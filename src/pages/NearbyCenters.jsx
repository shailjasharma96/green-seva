import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { MapPin, Search, Loader2 } from 'lucide-react';

const NearbyCenters = ({ searchQuery }) => {
    const { t } = useTranslation();
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                setLoading(true);
                let query = supabase.from('recycling_centers').select('*');

                if (searchQuery) {
                    query = query.or(`name.ilike.%${searchQuery}%`);
                }

                const { data, error } = await query;
                if (error) throw error;

                let filteredData = data;
                if (searchQuery) {
                    filteredData = data.filter(center =>
                        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        center.types.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                }

                setCenters(filteredData);
            } catch (err) {
                console.error('Error fetching centers:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
    }, [searchQuery]);

    const getStatusTranslation = (status) => {
        const s = status.toLowerCase();
        if (s === 'open') return t('centers.status_open');
        if (s === 'closed') return t('centers.status_closed');
        if (s === 'closing soon') return t('centers.status_closing');
        return status;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="centers-page">
            <div className="section-card">
                <div className="section-header">
                    <h2>{t('centers.title')}</h2>
                    {searchQuery && <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)' }}>{t('centers.search_results', { query: searchQuery })}</p>}
                </div>
                <div className="centers-list">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner" size={32} />
                            <p>{t('centers.loading')}</p>
                        </div>
                    ) : (
                        <>
                            {centers?.map(center => (
                                <div key={center.id} className="center-item">
                                    <div className="center-info">
                                        <h4>{center.name}</h4>
                                        <p className="distance"><MapPin size={12} /> {t('centers.away', { distance: center.distance })}</p>
                                        <div className="tags">
                                            {center.types.map(t => (
                                                <span key={t} className="tag">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`status ${center.status.toLowerCase().replace(' ', '-')}`}>
                                        {getStatusTranslation(center.status)}
                                    </div>
                                </div>
                            ))}
                            {(!centers || centers.length === 0) && (
                                <div className="empty-state">
                                    <Search size={48} />
                                    <p>{t('centers.no_centers_found')}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default NearbyCenters;
