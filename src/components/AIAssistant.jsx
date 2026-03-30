import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useUsageTracker } from '../context/UsageContext';

const AIAssistant = () => {
    const { trackChatMessage } = useUsageTracker();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', parts: [{ text: "Hi! I'm your Green Seva assistant. Ask me anything about recycling, waste disposal, or how to improve your eco-footprint!" }] }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSend = async () => {
        if (!message.trim() || loading) return;

        const userMessage = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);
        trackChatMessage();

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API Key missing");

            const client = new GoogleGenAI({ apiKey });

            // Format history for the new SDK
            const historicalContents = chatHistory.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: msg.parts
            }));

            const result = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [...historicalContents, userMessage],
                config: {
                    systemInstruction: "You are Green Seva AI, a helpful and knowledgeable recycling assistant. Your goal is to help users manage waste responsibly, explain what can and cannot be recycled in a friendly tone, and encourage sustainable living. Keep responses concise and practical."
                }
            });

            const modelResponse = { role: 'model', parts: [{ text: result.text }] };
            setChatHistory(prev => [...prev, modelResponse]);
        } catch (error) {
            console.error("Chat Error:", error);
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }] }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-assistant-wrapper" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="chat-window card"
                        style={{
                            width: '350px',
                            height: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            marginBottom: '16px',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div className="chat-header" style={{
                            padding: '16px',
                            background: 'var(--grad-primary)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bot size={20} />
                                <span style={{ fontWeight: 600 }}>Eco Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="chat-messages" style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'var(--bg-color)'
                        }}>
                            {chatHistory.map((msg, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '8px'
                                }}>
                                    {msg.role === 'model' && <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={14} color="var(--primary)" /></div>}
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '10px 14px',
                                        borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                        background: msg.role === 'user' ? 'var(--primary)' : 'white',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        {msg.parts[0].text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={14} className="spinner" color="var(--primary)" /></div>
                                    <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 2px', background: 'white', fontSize: '0.9rem' }}>Thinking...</div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input" style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: 'white' }}>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about recycling..."
                                style={{
                                    flex: 1,
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '8px 16px',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || loading}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--grad-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: 'var(--secondary)',
                            borderRadius: '50%',
                            padding: '4px'
                        }}
                    >
                        <Sparkles size={12} color="white" />
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
};

export default AIAssistant;
