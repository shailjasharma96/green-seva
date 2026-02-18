import React, { useState } from 'react';
import { Search, Bell, PlusCircle, CheckCircle, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = ({ title, onLogWaste, searchQuery, setSearchQuery, theme, toggleTheme }) => {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="topbar glass-morphism">
            <div className="topbar-left">
                <h1>{title}</h1>
            </div>
            <div className="topbar-right">
                <div className="search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search logs or centers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div className="notification-wrapper" style={{ position: 'relative' }}>
                    <button
                        className={`icon-btn ${showNotifications ? 'active' : ''}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        <span className="notification-dot"></span>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="notification-dropdown"
                                style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: 0,
                                    width: '300px',
                                    zIndex: 1001,
                                    padding: '20px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                    border: '1px solid #f1f5f9'
                                }}
                            >
                                <h4 style={{ marginBottom: '16px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Recent Notifications</h4>
                                <div className="notification-item" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                                        <CheckCircle size={14} color="#059669" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Welcome to GreenSeva!</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Start your journey to a cleaner planet today.</p>
                                    </div>
                                </div>
                                <div className="notification-item" style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                                        <PlusCircle size={14} color="#2563eb" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Points Earned</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>You earned 50 points for your first log!</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button className="log-waste-cta" onClick={onLogWaste}>
                    <PlusCircle size={20} />
                    <span>Log Waste</span>
                </button>
            </div>
        </header>
    );
};

export default Topbar;
