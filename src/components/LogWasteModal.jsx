import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Camera, Sparkles, Loader2, X, Check } from 'lucide-react';
import { identifyMaterial } from '../lib/gemini';
import { useUsageTracker } from '../context/UsageContext';

const LogWasteModal = ({ user, onClose, onSuccess }) => {
    const { trackImageScan } = useUsageTracker();
    const [type, setType] = useState('Plastic');
    const [weight, setWeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleSave = async () => {
        if (!weight) return;
        setLoading(true);

        try {
            const numericWeight = parseFloat(weight);
            const points = Math.floor(numericWeight * 10);

            const { error: logError } = await supabase
                .from('recycling_logs')
                .insert({
                    user_id: user.id,
                    type,
                    weight: `${weight}kg`,
                    points: points
                });
            if (logError) throw logError;

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        setAiResult(null);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result;
                trackImageScan();
                const result = await identifyMaterial(base64);

                setAiResult(result);
                if (result.type) {
                    // Try to match returned type with our options
                    const validTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste', 'Organic'];
                    if (validTypes.includes(result.type)) {
                        setType(result.type);
                    }
                }

                if (result.estimated_weight_kg) {
                    setWeight(result.estimated_weight_kg.toString());
                }
                setIsScanning(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('AI Identification Error:', err);
            alert(err.message || 'AI failed to identify the material.');
            setIsScanning(false);
        }
    };

    return (
        <div className="modal-overlay">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-card card"
                style={{ position: 'relative' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>Log New Waste</h3>
                    <button onClick={onClose} style={{ color: 'var(--text-soft)' }}><X size={20} /></button>
                </div>

                <div className="ai-scanner-section" style={{ marginBottom: '20px' }}>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        className="btn-primary"
                        style={{ width: '100%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '50px' }}
                        onClick={() => fileInputRef.current.click()}
                        disabled={isScanning}
                    >
                        {isScanning ? (
                            <><Loader2 className="spinner" size={20} /> Analyzing with AI...</>
                        ) : (
                            <><Sparkles size={20} /> Scan with AI Optimizer</>
                        )}
                    </button>

                    <AnimatePresence>
                        {aiResult && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    background: 'var(--primary-light)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <div style={{ background: 'white', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                                    <Check size={16} color="var(--primary)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', margin: 0 }}>
                                        AI Match: {aiResult.type}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', margin: 0, opacity: 0.8 }}>
                                        {aiResult.short_description}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', margin: '0 -24px 20px -24px' }}></div>

                <div className="input-group">
                    <label>Material Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-main)' }}
                    >
                        <option>Plastic</option>
                        <option>Paper</option>
                        <option>Glass</option>
                        <option>Metal</option>
                        <option>E-Waste</option>
                        <option>Organic</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="2.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-main)' }}
                    />
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="text-btn" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave} disabled={loading || isScanning} style={{ flex: 2 }}>
                        {loading ? 'Logging...' : 'Log Impact'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LogWasteModal;
