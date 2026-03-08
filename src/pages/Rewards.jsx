import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Gift, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';

const Rewards = ({ user }) => {
    const { t } = useTranslation();
    const [showSuccess, setShowSuccess] = useState(false);
    const [redeemedItem, setRedeemedItem] = useState('');
    const [loading, setLoading] = useState(false);

    const rewards = [
        { id: 1, title: t('rewards.items.eco_starter.title'), cost: 500, icon: Gift, description: t('rewards.items.eco_starter.desc') },
        { id: 2, title: t('rewards.items.energy_booster.title'), cost: 1200, icon: Zap, description: t('rewards.items.energy_booster.desc') },
        { id: 3, title: t('rewards.items.green_master.title'), cost: 5000, icon: Award, description: t('rewards.items.green_master.desc') },
    ];

    const handleRedeem = async (reward) => {
        if ((user.eco_points || 0) >= reward.cost) {
            try {
                setLoading(true);
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        eco_points: user.eco_points - reward.cost
                    })
                    .eq('id', user.id);

                if (error) throw error;

                setRedeemedItem(reward.title);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (err) {
                console.error('Error redeeming reward:', err.message);
                alert(t('rewards.redeem_failed'));
            } finally {
                setLoading(false);
            }
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
                        <span>{t('rewards.redeem_success', { item: redeemedItem })}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="section-card">
                <div className="section-header">
                    <div>
                        <h2>{t('rewards.redeem_points')}</h2>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{t('rewards.redeem_subtitle')}</p>
                    </div>
                    <div className="user-points card" style={{ padding: '12px 24px', background: 'var(--bg-color)', border: 'none' }}>
                        {t('rewards.current_balance')}: <strong style={{ color: 'var(--primary-dark)', fontSize: '1.25rem' }}>{user.eco_points || 0} {t('common.pts')}</strong>
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
                            <div className="cost-pill">{reward.cost} {t('common.pts')}</div>
                            <button
                                className={`btn-primary auth-btn ${(user.eco_points || 0) < reward.cost ? 'disabled' : ''}`}
                                disabled={(user.eco_points || 0) < reward.cost || loading}
                                onClick={() => handleRedeem(reward)}
                            >
                                {loading && redeemedItem === reward.title ? t('common.processing') : ((user.eco_points || 0) < reward.cost ? t('rewards.insufficient_points') : t('rewards.redeem_now'))}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Rewards;
