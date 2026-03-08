import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { History, Recycle, Trash2, Loader2 } from 'lucide-react';

const RecyclingLogs = ({ user, searchQuery }) => {
    const { t } = useTranslation();
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
        if (window.confirm(t('logs.delete_confirm'))) {
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
                    <h2>{t('logs.title')}</h2>
                </div>
                <div className="activity-list">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner" size={32} />
                            <p>{t('logs.fetching')}</p>
                        </div>
                    ) : (
                        <>
                            {logs?.map(item => (
                                <div key={item.id} className="activity-item">
                                    <div className="activity-icon"><Recycle size={18} /></div>
                                    <div className="activity-info">
                                        <p className="type">{item.type}</p>
                                        <p className="details">{item.weight} • {new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="activity-points">{item.points} {t('common.pts')}</div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(item.id)}
                                        title={t('logs.delete_tooltip')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <div className="empty-state">
                                    <History size={48} />
                                    <p>{searchQuery ? t('logs.no_results') : t('logs.no_logs')}</p>
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
