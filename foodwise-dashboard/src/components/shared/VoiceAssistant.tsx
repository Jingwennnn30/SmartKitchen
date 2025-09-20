import React, { useState } from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const VoiceAssistant: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);

    const speakText = (text: string) => {
        if (!("speechSynthesis" in window)) {
            console.log("[TTS] not supported, message was:", text);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    // Example: Listen for custom events that trigger voice notifications
    React.useEffect(() => {
        const handleVoiceNotification = (event: CustomEvent) => {
            if (isEnabled && event.detail?.message) {
                speakText(event.detail.message);
            }
        };

        // Add event listener for voice notifications
        window.addEventListener('voiceNotification' as any, handleVoiceNotification as EventListener);

        return () => {
            window.removeEventListener('voiceNotification' as any, handleVoiceNotification as EventListener);
        };
    }, [isEnabled]);

    return (
        <Tooltip title={isEnabled ? "Disable Voice Alerts" : "Enable Voice Alerts"}>
            <IconButton
                onClick={() => setIsEnabled(!isEnabled)}
                sx={{
                    color: isEnabled ? '#4caf50' : '#757575',
                }}
            >
                {isEnabled ? <CampaignIcon /> : <VolumeOffIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default VoiceAssistant;
