import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';

const LogWasteModal = ({ user, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [type, setType] = useState('Plastic');
    const [weight, setWeight] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!weight) return;
        setLoading(true);

        try {
            const numericWeight = parseFloat(weight);
            const points = Math.floor(numericWeight * 10);

            // 1. Insert log
            const { error: logError } = await supabase
                .from('recycling_logs')
                .insert({
                    user_id: user.id,
                    type,
                    weight: `${weight}${t('common.kg')}`,
                    points: points
                });
            if (logError) throw logError;

            // 2. Update profile stats
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    total_weight: (user.total_weight || 0) + numericWeight,
                    eco_points: (user.eco_points || 0) + points,
                })
                .eq('id', user.id);
            if (profileError) throw profileError;

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Error logging waste:', err.message);
            alert(t('modal.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-card card">
                <h3>{t('modal.log_waste_title')}</h3>
                <div className="input-group">
                    <label>{t('modal.material_type')}</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="Plastic">{t('modal.materials.plastic')}</option>
                        <option value="Paper">{t('modal.materials.paper')}</option>
                        <option value="Glass">{t('modal.materials.glass')}</option>
                        <option value="Metal">{t('modal.materials.metal')}</option>
                        <option value="E-Waste">{t('modal.materials.ewaste')}</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>{t('modal.weight_kg')}</label>
                    <input type="number" step="0.1" placeholder="2.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="form-actions">
                    <button className="text-btn" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
                    <button className="btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? t('modal.logging') : t('modal.log_impact')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LogWasteModal;
