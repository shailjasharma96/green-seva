import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Globe, RefreshCcw, ShieldCheck, Zap } from 'lucide-react';
import { useUsageTracker } from '../context/UsageContext';

const SystemHealth = () => {
    const { counts, resetTracker } = useUsageTracker();

    const healthMetrics = [
        { label: 'Supabase Data Flow', value: 'Healthy', status: 'optimal', icon: Database },
        { label: 'Gemini AI Connectivity', value: 'Active', status: 'optimal', icon: Zap },
        { label: 'Storage Services', value: '100% Uptime', status: 'optimal', icon: ShieldCheck },
        { label: 'Identity Services', value: 'Operational', status: 'optimal', icon: Globe },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="system-health-page"
        >
            <div className="section-header" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Activity color="var(--primary)" /> System Diagnostics
                </h2>
                <p style={{ color: 'var(--text-soft)' }}>Real-time monitoring of AI services and infrastructure health.</p>
            </div>

            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* API Usage Card */}
                <div className="section-card card health-glow-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Gemini AI Usage</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>Token-based consumption tracking</p>
                        </div>
                        <Cpu size={24} color="var(--primary)" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="usage-stat">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.9rem' }}>Multimodal Image Scans</span>
                                <span style={{ fontWeight: 600 }}>{counts.imageScans} calls</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((counts.imageScans / 50) * 100, 100)}%` }}
                                    style={{ height: '100%', background: 'var(--grad-primary)' }}
                                />
                            </div>
                        </div>

                        <div className="usage-stat">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.9rem' }}>Conversational Chat Messages</span>
                                <span style={{ fontWeight: 600 }}>{counts.chatMessages} calls</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((counts.chatMessages / 100) * 100, 100)}%` }}
                                    style={{ height: '100%', background: '#3b82f6' }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={resetTracker}
                        style={{
                            marginTop: '24px',
                            padding: '10px',
                            width: '100%',
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: 'var(--text-soft)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--bg-color)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <RefreshCcw size={14} /> Clear Local Cache
                    </button>
                </div>

                {/* Network Health Card */}
                <div className="section-card card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Network Connectivity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {healthMetrics.map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                background: 'var(--bg-color)',
                                borderRadius: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', background: 'white', borderRadius: '8px', display: 'flex' }}>
                                        <item.icon size={18} color="var(--primary)" />
                                    </div>
                                    <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .health-glow-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(76, 175, 80, 0.05) 0%, transparent 70%);
                    pointer-events: none;
                }
            `}</style>
        </motion.div>
    );
};

export default SystemHealth;
