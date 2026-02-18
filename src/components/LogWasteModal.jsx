import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../db/db';

const LogWasteModal = ({ user, onClose }) => {
    const [type, setType] = useState('Plastic');
    const [weight, setWeight] = useState('');

    const handleSave = async () => {
        if (!weight) return;
        const points = parseInt(weight) * 10;
        await db.logs.add({
            userId: user.id,
            type,
            weight: `${weight}kg`,
            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            points: `+${points}`
        });

        const updatedStats = {
            ...user.stats,
            totalWeight: user.stats.totalWeight + parseFloat(weight),
            points: user.stats.points + points,
        };
        await db.users.update(user.id, { stats: updatedStats });
        onClose();
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
                    <button className="text-btn" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Log Impact</button>
                </div>
            </motion.div>
        </div>
    );
};

export default LogWasteModal;
