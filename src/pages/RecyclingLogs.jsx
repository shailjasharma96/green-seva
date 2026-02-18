import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { History, Recycle, Trash2, Loader2 } from 'lucide-react';

const RecyclingLogs = ({ user, searchQuery }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();

        // Real-time subscription
        const channel = supabase
            .channel('recycling-logs-ui')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'recycling_logs',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchLogs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id, searchQuery]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('recycling_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (searchQuery) {
                query = query.or(`type.ilike.%${searchQuery}%,weight.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setLogs(data);
        } catch (err) {
            console.error('Error fetching logs:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            try {
                const { error } = await supabase
                    .from('recycling_logs')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                setLogs(logs.filter(log => log.id !== id));
            } catch (err) {
                console.error('Error deleting log:', err.message);
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="logs-page">
            <div className="section-card">
                <div className="section-header">
                    <h2>All Impact Logs</h2>
                </div>
                <div className="activity-list">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner" size={32} />
                            <p>Fetching your impact logs...</p>
                        </div>
                    ) : (
                        <>
                            {logs?.map(item => (
                                <div key={item.id} className="activity-item">
                                    <div className="activity-icon"><Recycle size={18} /></div>
                                    <div className="activity-info">
                                        <p className="type">{item.type}</p>
                                        <p className="details">{item.weight} • {item.date}</p>
                                    </div>
                                    <div className="activity-points">{item.points} pts</div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(item.id)}
                                        title="Delete log"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <div className="empty-state">
                                    <History size={48} />
                                    <p>{searchQuery ? 'No results found for your search.' : 'No logs found. Start recycling to see your impact here!'}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RecyclingLogs;
