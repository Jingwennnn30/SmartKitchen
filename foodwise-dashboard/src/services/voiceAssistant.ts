/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

interface VoiceAssistantOptions {
    onStatusChange?: (status: string) => void;
    onLog?: (message: string) => void;
}

class VoiceAssistant {
    private API_ENDPOINT = "https://1f8dniswv6.execute-api.us-east-1.amazonaws.com/dev/lex";
    private sessionId: string;
    private wakeRec: any = null;
    private cmdRec: any = null;
    private isRunning = false;
    private isInCommandMode = false;
    private SpeechRecognition: any;
    private options: VoiceAssistantOptions;

    constructor(options: VoiceAssistantOptions = {}) {
        this.options = options;
        this.SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.sessionId = localStorage.getItem("lexSessionId") || this.generateSessionId();
    }

    private generateSessionId(): string {
        const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        localStorage.setItem("lexSessionId", sessionId);
        return sessionId;
    }

    private log(message: string) {
        console.log(message);
        this.options.onLog?.(message);
    }

    private setStatus(text: string) {
        this.options.onStatusChange?.(text);
    }

    private speakText(text: string) {
        if (!("speechSynthesis" in window)) {
            this.log("[TTS] not supported, showing text: " + text);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private shouldContinueConversation(messages: string[]): boolean {
        if (!messages?.length) return false;
        const lastMessage = messages[messages.length - 1].toLowerCase();
        if (lastMessage.includes("placed an order") || lastMessage.includes("i've placed")) {
            return false;
        }
        const questionIndicators = ['?', 'what', 'which', 'how', 'when', 'where', 'do you want', 'would you like'];
        return questionIndicators.some(indicator => lastMessage.includes(indicator));
    }

    private async sendToBackend(text: string) {
        this.setStatus("calling Lex...");
        try {
            const response = await fetch(this.API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, sessionId: this.sessionId })
            });
            const data = await response.json();
            if (data.sessionId) {
                this.sessionId = data.sessionId;
                localStorage.setItem("lexSessionId", this.sessionId);
            }
            const messages = data.messages || [];
            this.log("[Lex] messages: " + JSON.stringify(messages));

            // Speak messages
            for (const message of messages) {
                this.speakText(message);
                await this.sleep(300);
            }

            if (this.shouldContinueConversation(messages)) {
                this.log("[System] Continuing conversation");
                this.setStatus("waiting for follow-up...");
                setTimeout(() => {
                    this.isInCommandMode = true;
                    this.startCommandRecognition();
                }, 1000);
            } else {
                this.log("[System] Conversation ended");
                this.setStatus("Ready");
                setTimeout(() => {
                    this.isRunning = true;
                    if (this.isRunning) this.startWakeRecognition();
                }, 1000);
            }
        } catch (err) {
            this.log("Error processing command");
            this.setStatus("error");
            setTimeout(() => {
                this.isRunning = true;
                if (this.isRunning) this.startWakeRecognition();
            }, 300);
        }
    }

    private startCommandRecognition() {
        if (!this.SpeechRecognition) return;
        if (this.cmdRec) try { this.cmdRec.stop(); } catch (e) { }

        this.cmdRec = new this.SpeechRecognition();
        this.cmdRec.lang = "en-US";
        this.cmdRec.continuous = false;
        this.cmdRec.interimResults = false;
        this.cmdRec.maxAlternatives = 1;

        let commandTimeout: NodeJS.Timeout | null = null;
        this.setStatus("listening for command...");
        this.log("[Cmd] listening for command...");

        this.cmdRec.onresult = (ev: any) => {
            let transcript = "";
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
                transcript += ev.results[i][0].transcript;
            }
            transcript = transcript.trim();
            if (transcript) {
                this.log("[Cmd] recognized: " + transcript);
                this.setStatus("processing...");
                if (commandTimeout) clearTimeout(commandTimeout);
                this.isInCommandMode = false;
                try { this.cmdRec.stop(); } catch (e) { }
                this.sendToBackend(transcript);
            }
        };

        this.cmdRec.onend = () => {
            this.log("[Cmd] command session ended");
            if (this.isInCommandMode) {
                try {
                    this.cmdRec.start();
                    this.log("[Cmd] restarted command recognition");
                } catch (e) {
                    this.log("[Cmd] failed to restart: " + e);
                    this.isInCommandMode = false;
                    this.isRunning = true;
                    setTimeout(() => this.startWakeRecognition(), 300);
                }
            }
        };

        this.cmdRec.onerror = (ev: any) => {
            this.log("[Cmd] error: " + ev.error);
            if (commandTimeout) clearTimeout(commandTimeout);
            this.isInCommandMode = false;
            this.isRunning = true;
            setTimeout(() => this.startWakeRecognition(), 300);
        };

        commandTimeout = setTimeout(() => {
            this.log("[Cmd] timeout: no command after 10s");
            try { this.cmdRec.stop(); } catch (e) { }
        }, 10000);

        try {
            this.cmdRec.start();
        } catch (e) {
            console.error("Could not start command recognition:", e);
            if (commandTimeout) clearTimeout(commandTimeout);
            this.isInCommandMode = false;
            this.isRunning = true;
            setTimeout(() => this.startWakeRecognition(), 300);
        }
    }

    private startWakeRecognition() {
        if (!this.SpeechRecognition) return;
        if (this.wakeRec) try { this.wakeRec.stop(); } catch (e) { }

        this.wakeRec = new this.SpeechRecognition();
        this.wakeRec.lang = "en-US";
        this.wakeRec.continuous = true;
        this.wakeRec.interimResults = true;
        this.wakeRec.maxAlternatives = 1;

        this.wakeRec.onstart = () => {
            this.setStatus("listening for 'hey chef'...");
            this.log("[Wake] started");
        };

        this.wakeRec.onend = () => {
            if (this.isRunning && !this.isInCommandMode) {
                try {
                    this.wakeRec.start();
                } catch (e) {
                    console.warn("restart wake failed", e);
                }
            }
            this.log("[Wake] ended");
        };

        this.wakeRec.onerror = (ev: any) => {
            this.log("[Wake] error: " + ev.error);
        };

        this.wakeRec.onresult = (ev: any) => {
            if (this.isInCommandMode) return;

            let transcript = "";
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
                transcript += ev.results[i][0].transcript;
            }

            const txt = transcript.toLowerCase();
            if (txt.includes("hey chef") || txt.includes("heychef")) {
                this.log("[Wake] detected: " + transcript.trim());
                this.isRunning = false;
                this.isInCommandMode = true;
                try { this.wakeRec.stop(); } catch (e) { }
                this.startCommandRecognition();
            }
        };

        try {
            this.wakeRec.start();
        } catch (e) {
            console.error("Could not start wake recognition:", e);
        }
    }

    public start() {
        if (!this.SpeechRecognition) {
            this.log("Speech recognition not supported");
            return false;
        }
        if (!this.isRunning) {
            this.isRunning = true;
            this.startWakeRecognition();
        }
        return true;
    }

    public stop() {
        this.isRunning = false;
        this.isInCommandMode = false;
        if (this.wakeRec) try { this.wakeRec.stop(); } catch (e) { }
        if (this.cmdRec) try { this.cmdRec.stop(); } catch (e) { }
        this.setStatus("Stopped");
        this.log("[UI] stopped");
    }
}

export default VoiceAssistant;