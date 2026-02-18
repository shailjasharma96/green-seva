import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit2, Check, X } from 'lucide-react';
import { db } from '../db/db';

const UserProfile = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(user);

    const handleSave = async () => {
        await db.users.update(user.id, {
            name: formData.name,
            email: formData.email
        });
        setIsEditing(false);
    };

    return (
        <div className="profile-view">
            <div className="profile-header-card card">
                <div className="avatar-xl">
                    {user.name.charAt(0)}
                    <button className="edit-avatar-btn"><Camera size={18} /></button>
                </div>
                <div className="profile-intro" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <p className="rank" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-dark)', marginBottom: '8px' }}>
                                {user.rank}
                            </p>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{user.name}</h2>
                            <p style={{ color: 'var(--text-soft)', fontSize: '1.1rem' }}>{user.email}</p>
                        </div>
                        {!isEditing && (
                            <button className="btn-primary" style={{ background: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={() => setIsEditing(true)}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isEditing ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="section-card card">
                    <h3 style={{ marginBottom: '24px' }}>Update Profile Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="text-btn" style={{ color: 'var(--text-soft)' }} onClick={() => setIsEditing(false)}>
                            <X size={18} /> Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSave}>
                            <Check size={18} /> Save Changes
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="stat-group">
                    <div className="card stat-card">
                        <p className="label">Total Recycled</p>
                        <p className="value">{user.stats.totalWeight}kg</p>
                    </div>
                    <div className="card stat-card">
                        <p className="label">Impact Points</p>
                        <p className="value">{user.stats.points}</p>
                    </div>
                    <div className="card stat-card">
                        <p className="label">Monthly Rank</p>
                        <p className="value">#{Math.floor(Math.random() * 100) + 1}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
