import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User } from 'lucide-react';
import { db } from '../db/db';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (isForgotMode) {
            const user = await db.users.where('email').equals(forgotEmail).first();
            if (user) {
                setMessage('A password reset link has been sent to your email.');
                setTimeout(() => setIsForgotMode(false), 3000);
            } else {
                setError('No account found with this email adress.');
            }
            return;
        }

        try {
            if (isLogin) {
                const user = await db.users.where('email').equals(email).first();
                if (user && user.password === password) {
                    onLogin(user, rememberMe);
                } else {
                    setError('Invalid email or password');
                }
            } else {
                const existing = await db.users.where('email').equals(email).first();
                if (existing) {
                    setError('Email already registered');
                    return;
                }
                const newUser = {
                    name,
                    email,
                    password,
                    rank: 'Eco Novice',
                    stats: { totalWeight: 0, points: 0, impactProgress: 0 }
                };
                const id = await db.users.add(newUser);
                onLogin({ ...newUser, id }, rememberMe);
            }
        } catch (err) {
            setError('An error occurred during authentication');
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

                    <button type="submit" className="btn-primary auth-btn">
                        {isForgotMode ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')}
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
