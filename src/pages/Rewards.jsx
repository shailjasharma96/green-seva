import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Gift, CheckCircle } from 'lucide-react';
import { db } from '../db/db';

const Rewards = ({ user }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [redeemedItem, setRedeemedItem] = useState('');

    const rewards = [
        { id: 1, title: 'Eco Starter', cost: 500, icon: Gift, description: 'Basic eco-friendly kit for your sustainable home' },
        { id: 2, title: 'Energy Booster', cost: 1200, icon: Zap, description: 'Compact solar power bank for your devices' },
        { id: 3, title: 'Green Master', cost: 5000, icon: Award, description: 'Premium bag made from 100% recycled materials' },
    ];

    const handleRedeem = async (reward) => {
        if (user.stats.points >= reward.cost) {
            const updatedStats = {
                ...user.stats,
                points: user.stats.points - reward.cost
            };

            await db.users.update(user.id, { stats: updatedStats });

            setRedeemedItem(reward.title);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rewards-page">
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="success-toast"
                    >
                        <CheckCircle size={20} />
                        <span>Successfully redeemed {redeemedItem}! Check your email.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="section-card">
                <div className="section-header">
                    <div>
                        <h2>Redeem Your Eco Points</h2>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>Use your hard-earned points to get sustainable rewards</p>
                    </div>
                    <div className="user-points card" style={{ padding: '12px 24px', background: 'var(--bg-color)', border: 'none' }}>
                        Current Balance: <strong style={{ color: 'var(--primary-dark)', fontSize: '1.25rem' }}>{user.stats.points} pts</strong>
                    </div>
                </div>

                <div className="grid-3" style={{ marginTop: '32px' }}>
                    {rewards.map(reward => (
                        <div key={reward.id} className="card reward-card">
                            <div className="reward-icon-wrapper">
                                <reward.icon size={40} />
                            </div>
                            <h3>{reward.title}</h3>
                            <p>{reward.description}</p>
                            <div className="cost-pill">{reward.cost} pts</div>
                            <button
                                className={`btn-primary auth-btn ${user.stats.points < reward.cost ? 'disabled' : ''}`}
                                disabled={user.stats.points < reward.cost}
                                onClick={() => handleRedeem(reward)}
                            >
                                {user.stats.points < reward.cost ? 'Insufficient Points' : 'Redeem Now'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Rewards;
