import React, { createContext, useContext, useState, useEffect } from 'react';

const UsageContext = createContext();

export const UsageProvider = ({ children }) => {
    const [counts, setCounts] = useState(() => {
        const saved = localStorage.getItem('gs_api_usage');
        return saved ? JSON.parse(saved) : { imageScans: 0, chatMessages: 0 };
    });

    useEffect(() => {
        localStorage.setItem('gs_api_usage', JSON.stringify(counts));
    }, [counts]);

    const trackImageScan = () => {
        setCounts(prev => ({ ...prev, imageScans: prev.imageScans + 1 }));
    };

    const trackChatMessage = () => {
        setCounts(prev => ({ ...prev, chatMessages: prev.chatMessages + 1 }));
    };

    const resetTracker = () => {
        setCounts({ imageScans: 0, chatMessages: 0 });
    };

    return (
        <UsageContext.Provider value={{ counts, trackImageScan, trackChatMessage, resetTracker }}>
            {children}
        </UsageContext.Provider>
    );
};

export const useUsageTracker = () => {
    const context = useContext(UsageContext);
    if (!context) {
        throw new Error('useUsageTracker must be used within a UsageProvider');
    }
    return context;
};
