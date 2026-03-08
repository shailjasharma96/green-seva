import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';

const Auth = ({ onLogin }) => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [error, setError] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check for error messages in the URL (e.g., from Supabase redirects)
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const errorDescription = params.get('error_description');
            if (errorDescription) {
                setError(errorDescription.replace(/\+/g, ' '));
                // Clear the hash so the error doesn't persist on reload
                window.history.replaceState(null, null, window.location.pathname);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isForgotMode) {
                const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
                if (error) throw error;
                setMessage(t('auth.reset_link_sent'));
                setTimeout(() => setIsForgotMode(false), 3000);
            } else if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Note: Supabase handles persistence automatically via localStorage
                // based on the configuration (default is persistence).
                onLogin(data.user);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                        }
                    }
                });
                if (error) throw error;
                if (data.user) {
                    setMessage(t('auth.registration_success'));
                    // If email verification is disabled in Supabase, we could log them in directly
                    if (data.session) onLogin(data.user);
                }
            }
        } catch (err) {
            setError(err.message || t('auth.error_login'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card">
                <div className="auth-header">
                    <Leaf className="logo-icon" size={48} />
                    <h2>{isForgotMode ? t('auth.reset_password') : (isLogin ? t('auth.welcome_back') : t('auth.join_green_seva'))}</h2>
                    <p>
                        {isForgotMode
                            ? t('auth.enter_email_reset')
                            : (isLogin ? t('auth.login_track_impact') : t('auth.start_journey'))}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {isForgotMode ? (
                        <div className="input-group">
                            <label>{t('auth.email_label')}</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder={t('auth.email_placeholder') || "email@example.com"}
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {!isLogin && (
                                <div className="input-group">
                                    <label>{t('auth.full_name')}</label>
                                    <div className="input-wrapper">
                                        <User size={18} />
                                        <input type="text" placeholder={t('auth.name_placeholder') || "John Doe"} value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                </div>
                            )}
                            <div className="input-group">
                                <label>{t('auth.email_label')}</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input type="email" placeholder={t('auth.email_placeholder') || "email@example.com"} value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>{t('auth.password_label')}</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            </div>

                            {isLogin && (
                                <div className="auth-options">
                                    <label className="remember-me">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span>{t('auth.remember_me')}</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="forgot-password-link"
                                        onClick={() => setIsForgotMode(true)}
                                    >
                                        {t('auth.forgot_password')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}

                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? t('auth.processing') : (isForgotMode ? t('auth.send_reset_link') : (isLogin ? t('auth.sign_in') : t('auth.create_account')))}
                    </button>

                    {isForgotMode && (
                        <button
                            type="button"
                            className="text-btn back-to-login"
                            onClick={() => setIsForgotMode(false)}
                        >
                            {t('auth.back_to_login')}
                        </button>
                    )}
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? t('auth.no_account') : t('auth.already_have_account')}
                        <button onClick={() => { setIsLogin(!isLogin); setIsForgotMode(false); setError(''); setMessage(''); }}>
                            {isLogin ? t('auth.sign_up') : t('auth.sign_in')}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
