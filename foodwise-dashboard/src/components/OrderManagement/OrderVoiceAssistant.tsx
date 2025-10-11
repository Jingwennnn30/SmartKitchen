import React, { useEffect, useState, useRef } from 'react';

interface OrderVoiceAssistantProps {
    isActive: boolean;
}

const OrderVoiceAssistant: React.FC<OrderVoiceAssistantProps> = ({ isActive }) => {
    const [status, setStatus] = useState("idle");
    
    // Voice assistant state
    const wakeRecRef = useRef<any>(null);
    const cmdRecRef = useRef<any>(null);
    const isRunningRef = useRef(false);
    const isInCommandModeRef = useRef(false);
    const sessionIdRef = useRef<string>("");

    const API_ENDPOINT = "https://ig70s4dg02.execute-api.us-east-1.amazonaws.com/dev/voice-assist";

    // Initialize session ID
    useEffect(() => {
        let sessionId = localStorage.getItem("lexSessionId");
        if (!sessionId) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
            localStorage.setItem("lexSessionId", sessionId);
        }
        sessionIdRef.current = sessionId;
        console.log("Using Lex session ID:", sessionId);
    }, []);

    // Function to reset session (clear previous conversation context)
    const resetSession = () => {
        const newSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        localStorage.setItem("lexSessionId", newSessionId);
        sessionIdRef.current = newSessionId;
        console.log("Reset Lex session, new ID:", newSessionId);
    };

    const log = (...args: any[]) => {
        console.log("[OrderVoiceAssistant]", ...args);
    };

    const setStatusInternal = (text: string, cls: string = "idle") => {
        setStatus(text);
        log("Status:", text);
    };

    const sleep = (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const speakText = (text: string) => {
        if (!("speechSynthesis" in window)) {
            log("[TTS] not supported, showing text:", text);
            return;
        }
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
    };

    const shouldContinueConversation = (messages: string[]) => {
        if (!messages || messages.length === 0) return false;
        
        const lastMessage = messages[messages.length - 1].toLowerCase();
        
        // End conversation if order is placed
        if (lastMessage.includes("placed an order") || lastMessage.includes("i've placed")) {
            return false;
        }
        
        // Continue if Lex is asking a question or expecting more input
        const questionIndicators = ['?', 'what', 'which', 'how', 'when', 'where', 'do you want', 'would you like'];
        
        return questionIndicators.some(indicator => lastMessage.includes(indicator));
    };

    const sendToBackend = async (text: string) => {
        setStatusInternal("calling Lex...", "idle");
        try {
            console.log("Sending to Lex:", text);
            console.log("Session ID:", sessionIdRef.current);
            console.log("API Endpoint:", API_ENDPOINT);
            
            const requestBody = { text: text, sessionId: sessionIdRef.current };
            console.log("Request Body:", JSON.stringify(requestBody));
            
            const resp = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            
            if (!resp.ok) {
                throw new Error(`HTTP error! status: ${resp.status}`);
            }
            
            const j = await resp.json();
            console.log("Lex Response:", JSON.stringify(j, null, 2));
            
            if (j.sessionId) {
                sessionIdRef.current = j.sessionId;
                localStorage.setItem("lexSessionId", sessionIdRef.current);
            }
            const messages = j.messages || [];
            log("[Lex] messages:", JSON.stringify(messages));
            
            // speak the messages
            for (const m of messages) {
                speakText(m);
                await sleep(300); // small gap between messages
            }
            
            // Check if conversation should continue
            if (shouldContinueConversation(messages)) {
                log("[System] Continuing conversation - listening for follow-up");
                setStatusInternal("waiting for follow-up...", "listening");
                // Wait a bit for TTS to finish, then start command listening again
                setTimeout(() => {
                    isInCommandModeRef.current = true; // stay in command mode
                    startCommandRecognition();
                }, 1000);
            } else {
                log("[System] Conversation ended - returning to wake word detection");
                setStatusInternal("idle");
                // Resume wake word detection
                setTimeout(() => {
                    isRunningRef.current = true;
                    if (isRunningRef.current) startWakeRecognition();
                }, 1000);
            }
        } catch (err) {
            log("Error calling backend:", err);
            console.error("Lex API Error:", err);
            setStatusInternal("error");
            // Resume wake listening on error
            setTimeout(() => {
                isRunningRef.current = true;
                if (isRunningRef.current) startWakeRecognition();
            }, 300);
        }
    };

    const startCommandRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        if (cmdRecRef.current) {
            try { cmdRecRef.current.stop(); } catch(e) {}
        }
        
        cmdRecRef.current = new SpeechRecognition();
        cmdRecRef.current.lang = "en-US";
        cmdRecRef.current.continuous = true; // allow longer commands
        cmdRecRef.current.interimResults = false;
        cmdRecRef.current.maxAlternatives = 1;

        let commandTimeout: NodeJS.Timeout | null = null;
        setStatusInternal("listening for command... (up to 10s)", "listening");
        log("[Cmd] listening for command...");

        cmdRecRef.current.onresult = (ev: any) => {
            let transcript = "";
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
                transcript += ev.results[i][0].transcript;
            }
            transcript = transcript.trim();
            
            console.log("[Cmd] Raw command heard:", transcript);
            console.log("[Cmd] Is final result:", ev.results[ev.results.length - 1].isFinal);
            
            if (transcript) {
                log("[Cmd] recognized:", transcript);
                console.log("[Cmd] Command recognized:", transcript);
                setStatusInternal("sending to Lex...", "idle");
                // Stop listening and send to backend
                if (commandTimeout) clearTimeout(commandTimeout);
                isInCommandModeRef.current = false; // exit command mode immediately
                try { cmdRecRef.current.stop(); } catch(e) {}
                // sendToBackend will handle resuming wake detection after TTS completes
                sendToBackend(transcript);
            } else {
                console.log("[Cmd] Empty transcript received");
            }
        };

        cmdRecRef.current.onend = () => {
            log("[Cmd] command session ended");
            console.log("[Cmd] Command listening ended");
            // Only resume wake recognition if still in command mode (timeout case)
            if (isInCommandModeRef.current) {
                console.log("[Cmd] Command timeout - returning to wake word detection");
                isInCommandModeRef.current = false;
                isRunningRef.current = true;
                setTimeout(() => startWakeRecognition(), 300);
            }
        };

        cmdRecRef.current.onerror = (ev: any) => {
            log("[Cmd] error:", ev.error);
            if (commandTimeout) clearTimeout(commandTimeout);
            // exit command mode and resume wake recognition
            isInCommandModeRef.current = false;
            isRunningRef.current = true;
            setTimeout(() => startWakeRecognition(), 300);
        };

        // Stop after 10 seconds if no command
        commandTimeout = setTimeout(() => {
            log("[Cmd] timeout: no command after 10s");
            try { cmdRecRef.current.stop(); } catch(e) {}
        }, 10000);

        try {
            cmdRecRef.current.start();
        } catch(e) {
            console.error("Could not start cmdRec:", e);
            if (commandTimeout) clearTimeout(commandTimeout);
            isInCommandModeRef.current = false;
            isRunningRef.current = true;
            setTimeout(() => startWakeRecognition(), 300);
        }
    };

    const startWakeRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        if (wakeRecRef.current) {
            try { wakeRecRef.current.stop(); } catch (e) {}
        }
        
        wakeRecRef.current = new SpeechRecognition();
        wakeRecRef.current.lang = "en-US";
        wakeRecRef.current.continuous = true;
        wakeRecRef.current.interimResults = true;
        wakeRecRef.current.maxAlternatives = 1;

        wakeRecRef.current.onstart = () => {
            setStatusInternal("listening for 'hey chef'...", "listening");
            log("[Wake] started");
            console.log("[Wake] Microphone started successfully");
            console.log("[Wake] Please say 'Hey Chef' loudly and clearly");
        };

        wakeRecRef.current.onend = () => {
            // auto-restart only if isRunning is true and not transitioning to command mode
            if (isRunningRef.current) {
                try { wakeRecRef.current.start(); } catch(e) { console.warn("restart wake failed", e); }
            }
            log("[Wake] ended");
        };

        wakeRecRef.current.onerror = (ev: any) => {
            log("[Wake] error:", ev.error);
            console.error("[Wake] Speech Recognition Error:", ev.error);
            
            if (ev.error === 'not-allowed') {
                console.error("[Wake] MICROPHONE PERMISSION DENIED!");
                alert("Microphone permission denied! Please allow microphone access and try again.");
            } else if (ev.error === 'no-speech') {
                console.log("[Wake] No speech detected - this is normal, continuing to listen...");
            } else if (ev.error === 'audio-capture') {
                console.error("[Wake] AUDIO CAPTURE ERROR - Check if microphone is connected");
            } else if (ev.error === 'network') {
                console.error("[Wake] NETWORK ERROR - Check internet connection");
            }
        };

        wakeRecRef.current.onresult = (ev: any) => {
            // Only process if not already in command mode
            if (isInCommandModeRef.current) return;
            
            // assemble transcript from event.results
            let transcript = "";
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
                transcript += ev.results[i][0].transcript;
            }
            
            // Log EVERYTHING we hear for debugging
            log("[Wake] HEARD:", transcript.trim());
            console.log("[Wake] Raw transcript:", transcript);
            console.log("[Wake] Is final result:", ev.results[ev.results.length - 1].isFinal);
            
            // lower-case check for wake word
            const txt = transcript.toLowerCase();
            console.log("[Wake] Checking:", txt, "for wake words");
            
            // simple check for 'hey chef' or 'heychef'
            if (txt.includes("hey chef") || txt.includes("heychef")) {
                log("[Wake] WAKE WORD DETECTED: " + transcript.trim());
                console.log("[Wake] WAKE WORD DETECTED:", transcript.trim());
                // stop wake listener while processing
                isRunningRef.current = false; // prevent auto-restart
                isInCommandModeRef.current = true; // enter command mode
                try { wakeRecRef.current.stop(); } catch(e) {}
                // start command capture for 10 seconds
                startCommandRecognition();
            } else {
                console.log("[Wake] No wake word detected in:", txt);
            }
        };

        try {
            wakeRecRef.current.start();
        } catch (e) {
            console.error("Could not start wakeRec:", e);
        }
    };

    // Handle isActive prop changes
    useEffect(() => {
        console.log("OrderVoiceAssistant: isActive changed to:", isActive);
        
        if (isActive) {
            // Reset session when starting fresh to clear any previous context
            resetSession();
            
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            console.log("Speech Recognition support:", !!SpeechRecognition);
            
            if (!SpeechRecognition) {
                alert("This feature requires Chrome (or Edge) with the Web Speech API. The app will not work in this browser.");
                return;
            }

            if (!isRunningRef.current) {
                log("Starting Hey Chef voice assistant...");
                isRunningRef.current = true;
                startWakeRecognition();
            }
        } else {
            log("Stopping Hey Chef voice assistant...");
            isRunningRef.current = false;
            isInCommandModeRef.current = false;
            if (wakeRecRef.current) try { wakeRecRef.current.stop(); } catch(e) {}
            if (cmdRecRef.current) try { cmdRecRef.current.stop(); } catch(e) {}
            setStatusInternal("stopped", "idle");
        }

        // Cleanup on unmount
        return () => {
            log("Cleanup: Stopping Hey Chef voice assistant...");
            isRunningRef.current = false;
            isInCommandModeRef.current = false;
            if (wakeRecRef.current) try { wakeRecRef.current.stop(); } catch(e) {}
            if (cmdRecRef.current) try { cmdRecRef.current.stop(); } catch(e) {}
        };
    }, [isActive]);

    return null; // No visible UI needed
};

export default OrderVoiceAssistant;