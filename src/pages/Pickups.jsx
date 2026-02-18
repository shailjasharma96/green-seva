import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Calendar, MapPin, Package, Clock, Loader2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import SchedulePickupModal from '../components/SchedulePickupModal';

const Pickups = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRequests();

        // Real-time subscription
        const channel = supabase
            .channel('pickup-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'pickup_requests',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchRequests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pickup_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('pickup_date', { ascending: true });

            if (error) throw error;
            setRequests(data);
        } catch (err) {
            console.error('Error fetching pickups:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Cancel this pickup request?')) return;
        try {
            const { error } = await supabase
                .from('pickup_requests')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setRequests(requests.filter(r => r.id !== id));
        } catch (err) {
            alert('Failed to delete request.');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Picked Up': return <CheckCircle2 size={18} color="var(--success)" />;
            case 'Scheduled': return <Clock size={18} color="var(--secondary)" />;
            case 'Cancelled': return <AlertCircle size={18} color="var(--danger)" />;
            default: return <Clock size={18} color="var(--text-muted)" />;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pickups-page">
            <div className="section-card card" style={{ padding: '32px' }}>
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Pickup Services</h2>
                        <p style={{ color: 'var(--text-soft)' }}>Manage and schedule waste collections from your doorstep.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Truck size={18} /> Schedule New Pickup
                    </button>
                </div>

                <div className="requests-container">
                    {loading ? (
                        <div className="loading-state" style={{ textAlign: 'center', padding: '60px' }}>
                            <Loader2 className="spinner" size={40} />
                            <p style={{ marginTop: '16px' }}>Fetching your pickups...</p>
                        </div>
                    ) : (
                        <div className="pickup-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {requests.map(req => (
                                <motion.div
                                    layout
                                    key={req.id}
                                    className="pickup-item-card card"
                                    style={{ padding: '20px', position: 'relative', borderLeft: `4px solid ${req.status === 'Picked Up' ? 'var(--success)' : 'var(--primary)'}` }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span className={`status-pill ${req.status.toLowerCase()}`} style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: req.status === 'Picked Up' ? 'var(--primary-light)' : 'var(--bg-color)',
                                            color: req.status === 'Picked Up' ? 'var(--primary-dark)' : 'var(--text-soft)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {getStatusIcon(req.status)} {req.status}
                                        </span>
                                        <button className="icon-btn delete" onClick={() => handleDelete(req.id)} style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{new Date(req.pickup_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>

                                    <div className="details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-soft)' }}>
                                            <Clock size={16} /> {req.pickup_time}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-soft)' }}>
                                            <MapPin size={16} /> {req.address}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--text-soft)' }}>
                                            <Package size={16} style={{ marginTop: '2px' }} />
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {req.waste_categories.map(c => <span key={c} className="tag-sm" style={{ background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{c}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {requests.length === 0 && (
                                <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-color)', borderRadius: '12px' }}>
                                    <Truck size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                                    <h3>No pickups scheduled</h3>
                                    <p style={{ color: 'var(--text-soft)', marginTop: '8px' }}>Need a hand with heavy items? Schedule a professional pickup today!</p>
                                    <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setIsModalOpen(true)}>Book First Pickup</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <SchedulePickupModal
                        user={user}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={fetchRequests}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Pickups;
