import React from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { MapPin, Search } from 'lucide-react';

const NearbyCenters = ({ searchQuery }) => {
    const centers = useLiveQuery(async () => {
        let allCenters = await db.centers.toArray();
        if (searchQuery) {
            allCenters = allCenters.filter(center =>
                center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                center.types.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        return allCenters;
    }, [searchQuery]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="centers-page">
            <div className="section-card">
                <div className="section-header">
                    <h2>Collection Centers Near You</h2>
                </div>
                <div className="centers-list">
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
                </div>
            </div>
        </motion.div>
    );
};

export default NearbyCenters;
