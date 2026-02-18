import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Auth = ({ onLogin }) => {
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
                setMessage('A password reset link has been sent to your email.');
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
                    setMessage('Registration successful! Please check your email to verify your account.');
                    // If email verification is disabled in Supabase, we could log them in directly
                    if (data.session) onLogin(data.user);
                }
            }
        } catch (err) {
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card">
                <div className="auth-header">
                    <Leaf className="logo-icon" size={48} />
                    <h2>{isForgotMode ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join Green Seva')}</h2>
                    <p>
                        {isForgotMode
                            ? 'Enter your email to receive a reset link'
                            : (isLogin ? 'Login to track your impact' : 'Start your journey to a cleaner planet')}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {isForgotMode ? (
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="email@example.com"
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
                                    <label>Full Name</label>
                                    <div className="input-wrapper">
                                        <User size={18} />
                                        <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                </div>
                            )}
                            <div className="input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Password</label>
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
                                        <span>Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="forgot-password-link"
                                        onClick={() => setIsForgotMode(true)}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}

                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isForgotMode ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account'))}
                    </button>

                    {isForgotMode && (
                        <button
                            type="button"
                            className="text-btn back-to-login"
                            onClick={() => setIsForgotMode(false)}
                        >
                            Back to Login
                        </button>
                    )}
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLogin(!isLogin); setIsForgotMode(false); setError(''); setMessage(''); }}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
