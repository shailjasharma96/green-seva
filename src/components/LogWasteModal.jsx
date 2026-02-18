import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const LogWasteModal = ({ user, onClose, onSuccess }) => {
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
                    weight: `${weight}kg`,
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
            alert('Failed to log waste. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-card card">
                <h3>Log New Waste</h3>
                <div className="input-group">
                    <label>Material Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option>Plastic</option>
                        <option>Paper</option>
                        <option>Glass</option>
                        <option>Metal</option>
                        <option>E-Waste</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Weight (kg)</label>
                    <input type="number" step="0.1" placeholder="2.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="form-actions">
                    <button className="text-btn" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? 'Logging...' : 'Log Impact'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LogWasteModal;
