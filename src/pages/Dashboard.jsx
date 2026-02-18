import React from 'react';
import { motion } from 'framer-motion';
import { Recycle, MapPin, ArrowRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import ImpactSummary from '../components/ImpactSummary';

const Dashboard = ({ user, setActiveTab }) => {
    const logs = useLiveQuery(() => db.logs.where('userId').equals(user.id).toArray(), [user.id]);
    const centers = useLiveQuery(() => db.centers.toArray());

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-content">
            <ImpactSummary user={user} />

            <div className="main-grid">
                <div className="section-card">
                    <div className="section-header">
                        <h2>Recent Activity</h2>
                        <button className="btn-primary btn-sm" onClick={() => setActiveTab('logs')}>
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="activity-list">
                        {logs?.slice(-4).reverse().map(item => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-icon"><Recycle size={20} /></div>
                                <div className="activity-info">
                                    <p className="type">{item.type}</p>
                                    <p className="details">{item.weight} • {item.date}</p>
                                </div>
                                <div className="activity-points">{item.points} pts</div>
                            </div>
                        ))}
                        {(!logs || logs.length === 0) && (
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
                            <div key={center.id} className="center-item">
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
        </motion.div>
    );
};

export default Dashboard;
