import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { MapPin, Search, Loader2 } from 'lucide-react';

const NearbyCenters = ({ searchQuery }) => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                setLoading(true);
                let query = supabase.from('recycling_centers').select('*');

                if (searchQuery) {
                    // Filter in JS for complex array logic if needed, or use .contains() for Postgres arrays
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="centers-page">
            <div className="section-card">
                <div className="section-header">
                    <h2>Collection Centers Near You</h2>
                </div>
                <div className="centers-list">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner" size={32} />
                            <p>Loading centers...</p>
                        </div>
                    ) : (
                        <>
                            {centers?.map(center => (
                                <div key={center.id} className="center-item">
                                    <div className="center-info">
                                        <h4>{center.name}</h4>
                                        <p className="distance"><MapPin size={12} /> {center.distance} away</p>
                                        <div className="tags">
                                            {center.types.map(t => (
                                                <span key={t} className="tag">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`status ${center.status.toLowerCase().replace(' ', '-')}`}>{center.status}</div>
                                </div>
                            ))}
                            {(!centers || centers.length === 0) && (
                                <div className="empty-state">
                                    <Search size={48} />
                                    <p>No centers found matching your search.</p>
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
