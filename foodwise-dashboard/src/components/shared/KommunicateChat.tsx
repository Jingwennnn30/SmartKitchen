import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        kommunicate?: any;
        Kommunicate?: any;
    }
}

const KommunicateChat: React.FC = () => {
    const location = useLocation();
    const isInitialized = useRef(false);
    const isDashboard = location.pathname === '/';

    useEffect(() => {
        const loadKommunicate = () => {
            try {
                // Skip if already exists
                if (window.kommunicate) {
                    return;
                }

                const kommunicateSettings = {
                    appId: "1810d6110f3d3dac4bbc618d6c1fe4aac",
                    popupWidget: true,
                    automaticChatOpenOnNavigation: true
                };

                window.kommunicate = window.kommunicate || {};
                window.kommunicate._globals = kommunicateSettings;

                const script = document.createElement("script");
                script.type = "text/javascript";
                script.async = true;
                script.src = "https://widget.kommunicate.io/v2/kommunicate.app";
                script.onload = () => {
                    isInitialized.current = true;
                    // Show or hide based on current page
                    if (isDashboard) {
                        setTimeout(() => {
                            if (window.Kommunicate && window.Kommunicate.displayKommunicateWidget) {
                                window.Kommunicate.displayKommunicateWidget(true);
                            }
                        }, 1000);
                    }
                };
                script.onerror = (error) => {
                    console.error("Error loading Kommunicate script:", error);
                };
                
                document.body.appendChild(script);
            } catch (error) {
                console.error("Error initializing Kommunicate chat:", error);
            }
        };

        // Load Kommunicate if not loaded
        if (!isInitialized.current) {
            const timer = setTimeout(loadKommunicate, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    // Handle show/hide based on route changes
    useEffect(() => {
        if (isInitialized.current && window.Kommunicate && window.Kommunicate.displayKommunicateWidget) {
            if (isDashboard) {
                // Show widget on dashboard
                window.Kommunicate.displayKommunicateWidget(true);
            } else {
                // Hide widget on other pages
                window.Kommunicate.displayKommunicateWidget(false);
            }
        }
    }, [isDashboard]);

    return null;
};

export default KommunicateChat;
