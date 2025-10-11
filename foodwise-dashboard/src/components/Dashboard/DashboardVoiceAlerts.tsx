import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const DashboardVoiceAlerts: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);

    const ALERT_URL = "https://5hmozf4lwl.execute-api.us-east-1.amazonaws.com/dev/get-latest-alert";

    const speakText = (text: string) => {
        if (!("speechSynthesis" in window)) {
            console.log("[TTS] not supported, message was:", text);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.volume = 1.0;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        
        utterance.onstart = () => console.log("Speech started:", text);
        utterance.onend = () => console.log("Speech ended");
        utterance.onerror = (e) => console.error("Speech error:", e);
        
        window.speechSynthesis.speak(utterance);
        console.log("Spoken alert:", text);
    };

    const checkAlertsOnce = async () => {
        try {
            console.log("Checking alerts from:", ALERT_URL);
            const res = await fetch(ALERT_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const j = await res.json();
            console.log("API response:", j);

            if (j && j.message) {
                const last = localStorage.getItem("lastAlertMessage");
                if (last !== j.message) {
                    localStorage.setItem("lastAlertMessage", j.message);
                    
                    // Create a better spoken message based on the actual response structure
                    let spokenMessage = j.message;
                    
                    // If there are low stock items, create detailed alerts
                    if (j.low_stock_items && j.low_stock_items.length > 0) {
                        const items = j.low_stock_items.map((item: any) => {
                            if (item.item_name && item.quantity !== undefined) {
                                return `${item.item_name} is low with only ${item.quantity} left`;
                            }
                            return JSON.stringify(item);
                        }).join('. ');
                        spokenMessage = `Alert: ${items}. Please restock these items.`;
                    } else {
                        // For "No new low-stock items" message, we might not want to speak it every time
                        if (j.message.includes("No new low-stock items")) {
                            console.log("No low-stock items, skipping voice alert");
                            return; // Don't speak when there are no alerts
                        }
                    }
                    
                    speakText(spokenMessage);
                } else {
                    console.log("Same message as last time, not speaking:", j.message);
                }
            } else {
                console.log("No message in response or empty response");
            }
        } catch (e) {
            console.error("Alert check failed", e);
            if (e instanceof TypeError && e.message.includes('fetch')) {
                console.error("Network error - check if API endpoint is accessible and CORS is configured");
            }
        }
    };

    // Set up polling when enabled
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isEnabled) {
            console.log("Dashboard Voice Alerts enabled - starting polling");
            // Check immediately when enabled
            checkAlertsOnce();
            // Then check every 10 seconds
            interval = setInterval(checkAlertsOnce, 10000);
        } else {
            console.log("Dashboard Voice Alerts disabled");
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isEnabled]);

    const handleToggle = () => {
        const newState = !isEnabled;
        console.log("Dashboard Voice Button Clicked! Current state:", isEnabled, "→ New state:", newState);
        setIsEnabled(newState);
        
        if (newState) {
            console.log("Enabling Dashboard Voice Alerts...");
            speakText("Dashboard voice alerts are now enabled");
        } else {
            console.log("Disabling Dashboard Voice Alerts...");
        }
    };

    return (
        <Tooltip title={isEnabled ? "Disable Voice Alerts" : "Enable Voice Alerts"}>
            <IconButton
                onClick={handleToggle}
                sx={{
                    color: isEnabled ? '#4caf50' : '#757575',
                }}
            >
                {isEnabled ? <CampaignIcon /> : <VolumeOffIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default DashboardVoiceAlerts;