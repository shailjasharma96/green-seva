import React from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { History, Recycle, Trash2 } from 'lucide-react';

const RecyclingLogs = ({ user, searchQuery }) => {
    const logs = useLiveQuery(async () => {
        let allLogs = await db.logs.where('userId').equals(user.id).toArray();
        if (searchQuery) {
            allLogs = allLogs.filter(log =>
                log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.weight.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return allLogs;
    }, [user.id, searchQuery]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            await db.logs.delete(id);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="logs-page">
            <div className="section-card">
                <div className="section-header">
                    <h2>All Impact Logs</h2>
                </div>
                <div className="activity-list">
                    {logs?.slice().reverse().map(item => (
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
                </div>
            </div>
        </motion.div>
    );
};

export default RecyclingLogs;
