import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Recycle, MapPin, ArrowRight } from 'lucide-react';
import ImpactSummary from '../components/ImpactSummary';
import { supabase } from '../lib/supabaseClient';

const Dashboard = ({ user, setActiveTab, setSearchQuery }) => {
    const [recentLogs, setRecentLogs] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch in parallel
                const [logsRes, centersRes] = await Promise.all([
                    supabase
                        .from('recycling_logs')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(4),
                    supabase
                        .from('recycling_centers')
                        .select('*')
                        .limit(3)
                ]);

                if (logsRes.error) throw logsRes.error;
                if (centersRes.error) throw centersRes.error;

                setRecentLogs(logsRes.data);
                setCenters(centersRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Subscribe to real-time updates for logs
        const channel = supabase
            .channel('dashboard-logs-ui')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'recycling_logs',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchDashboardData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-content">
            <ImpactSummary user={user} onNavigate={setActiveTab} />

            <div className="main-grid">
                <div className="section-card">
                    <div className="section-header">
                        <h2>Recent Activity</h2>
                        <button className="btn-primary btn-sm" onClick={() => setActiveTab('logs')}>
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="activity-list">
                        {recentLogs?.map(item => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-icon"><Recycle size={20} /></div>
                                <div className="activity-info">
                                    <p className="type">{item.type}</p>
                                    <p className="details">{item.weight} • {new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="activity-points">{item.points} pts</div>
                            </div>
                        ))}
                        {(!recentLogs || recentLogs.length === 0) && (
                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                <p className="empty-text">No recycling logs yet. Start today!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h2>Nearby Centers</h2>
                        <button className="text-btn" onClick={() => setActiveTab('centers')}>
                            View map <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
                        </button>
                    </div>
                    <div className="centers-list">
                        {centers?.slice(0, 3).map(center => (
                            <div
                                key={center.id}
                                className="center-item"
                                onClick={() => {
                                    setSearchQuery(center.name);
                                    setActiveTab('centers');
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="center-info">
                                    <h4>{center.name}</h4>
                                    <p className="distance"><MapPin size={12} /> {center.distance} away</p>
                                    <div className="tags">
                                        {center.types.map(t => <span key={t} className="tag">{t}</span>)}
                                    </div>
                                </div>
                                <div className={`status ${center.status.toLowerCase().replace(' ', '-')}`}>{center.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="section-card pickup-cta" style={{ marginTop: '24px', background: 'var(--grad-primary)', color: 'white', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ marginBottom: '8px', color: 'white' }}>Have heavy items to recycle?</h3>
                    <p style={{ opacity: 0.9 }}>Schedule a doorstep collection for large amounts or E-Waste.</p>
                </div>
                <button className="btn-primary" style={{ background: 'white', color: 'var(--primary)' }} onClick={() => setActiveTab('pickups')}>
                    Book a Pickup
                </button>
            </div>
        </motion.div>
    );
};

export default Dashboard;
