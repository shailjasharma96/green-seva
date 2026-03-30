import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { X, Truck, Calendar, Clock, MapPin, Package, CheckCircle2 } from 'lucide-react';

const SchedulePickupModal = ({ user, onClose, onSuccess }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00 AM');
    const [address, setAddress] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const wasteTypes = ['Plastic', 'Paper', 'Metal', 'Glass', 'E-Waste', 'Organic'];

    const toggleCategory = (cat) => {
        setCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!date || !address || categories.length === 0) return;
        
        setLoading(true);
        try {
            const { error } = await supabase
                .from('pickup_requests')
                .insert({
                    user_id: user.id,
                    pickup_date: date,
                    pickup_time: time,
                    address: address,
                    waste_categories: categories,
                    status: 'Scheduled'
                });

            if (error) throw error;
            
            setSubmitted(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Error scheduling pickup:', err.message);
            alert('Failed to schedule pickup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="modal-overlay">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="modal-card card" 
                    style={{ textAlign: 'center', padding: '48px 32px' }}
                >
                    <div style={{ 
                        background: 'var(--primary-light)', 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 24px' 
                    }}>
                        <CheckCircle2 size={40} color="var(--primary)" />
                    </div>
                    <h2 style={{ marginBottom: '12px' }}>Request Confirmed!</h2>
                    <p style={{ color: 'var(--text-soft)', lineHeight: 1.6 }}>
                        Our collection team will arrive at your address on <strong>{new Date(date).toLocaleDateString()}</strong> at <strong>{time}</strong>.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="modal-card card"
                style={{ maxWidth: '500px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                            <Truck size={24} color="var(--primary)" />
                        </div>
                        <h3 style={{ margin: 0 }}>Schedule Collection</h3>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-soft)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Calendar size={16} /> Pickup Date
                        </label>
                        <input 
                            type="date" 
                            required 
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Clock size={16} /> Preferred Time
                        </label>
                        <select 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                        >
                            <option>09:00 AM - 11:00 AM</option>
                            <option>11:00 AM - 01:00 PM</option>
                            <option>02:00 PM - 04:00 PM</option>
                            <option>04:00 PM - 06:00 PM</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <MapPin size={16} /> Collection Address
                        </label>
                        <textarea 
                            required
                            placeholder="Enter your full address..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Package size={16} /> Material Categories
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {wasteTypes.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleCategory(type)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        border: '1px solid',
                                        borderColor: categories.includes(type) ? 'var(--primary)' : 'var(--border-color)',
                                        background: categories.includes(type) ? 'var(--primary-light)' : 'transparent',
                                        color: categories.includes(type) ? 'var(--primary-dark)' : 'var(--text-soft)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button type="button" onClick={onClose} className="text-btn" style={{ flex: 1 }}>Cancel</button>
                        <button 
                            type="submit" 
                            disabled={loading || categories.length === 0}
                            className="btn-primary" 
                            style={{ flex: 2, background: 'var(--grad-primary)' }}
                        >
                            {loading ? 'Confirming...' : 'Schedule Pickup'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SchedulePickupModal;
