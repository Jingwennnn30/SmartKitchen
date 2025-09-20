import React, { useEffect, useState, useRef } from 'react';
import VoiceAssistantService from '../../services/voiceAssistant';

interface VoiceAssistantProps {
    isActive: boolean;
    onStatusChange?: (status: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isActive }) => {
    const voiceAssistantRef = useRef<VoiceAssistantService | null>(null);

    // Initialize voice assistant on mount
    useEffect(() => {
        voiceAssistantRef.current = new VoiceAssistantService({
            onStatusChange: () => {}, // No status display needed
            onLog: () => {} // No logs display needed
        });

        // Cleanup on unmount
        return () => {
            if (voiceAssistantRef.current) {
                voiceAssistantRef.current.stop();
            }
        };
    }, []);

    // Start/stop voice assistant based on isActive prop
    useEffect(() => {
        const assistant = voiceAssistantRef.current;
        if (!assistant) return;

        if (isActive) {
            assistant.start();
        } else {
            assistant.stop();
        }
    }, [isActive]);

    return null; // No visible UI needed
};

export default VoiceAssistant;