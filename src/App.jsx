import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LogWasteModal from './components/LogWasteModal';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import RecyclingLogs from './pages/RecyclingLogs';
import NearbyCenters from './pages/NearbyCenters';
import Rewards from './pages/Rewards';

import './App.css';

const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('gs_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (!supabase) return;
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it (handles users created before trigger)
        console.log('Profile not found, creating default...');
        const { data: { user } } = await supabase.auth.getUser();
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: user.user_metadata?.name || 'Green Seva User',
            email: user.email,
            eco_points: 0,
            total_weight: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      // If we can't get or create a profile, we might still want to let them in
      // but with a shell profile so the app doesn't hang
      if (!profile) {
        setProfile({ id: userId, name: 'Eco User', email: '', eco_points: 0, total_weight: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    // This is called after successful Auth.jsx login
    // Session state will be updated by onAuthStateChange listener
    // We just need to make sure session is set
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('dashboard');
  };

  const getTitle = () => {
    const titles = {
      dashboard: 'Dashboard Overview',
      logs: 'Recycling Logs',
      centers: 'Nearby Centers',
      rewards: 'My Rewards',
      profile: 'User Profile',
    };
    return titles[activeTab] || 'Overview';
  };

  if (!supabase) return (
    <div className="loading" style={{ color: 'var(--error)' }}>
      <h3>Configuration Error</h3>
      <p>Supabase URL or Key is missing in your .env file.</p>
    </div>
  );
  if (!session) return <Auth onLogin={handleLogin} />;
  if (loading) return <div className="loading">Loading your green profile...</div>;
  if (!profile) return <div className="loading">Initializing profile...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard
          user={profile}
          setActiveTab={setActiveTab}
          setSearchQuery={setSearchQuery}
        />;
      case 'profile': return <UserProfile user={profile} onNavigate={setActiveTab} />;
      case 'logs': return <RecyclingLogs user={profile} searchQuery={searchQuery} />;
      case 'centers': return <NearbyCenters searchQuery={searchQuery} />;
      case 'rewards': return <Rewards user={profile} />;
      default:
        return <Dashboard
          user={profile}
          setActiveTab={setActiveTab}
          setSearchQuery={setSearchQuery}
        />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={profile} onLogout={handleLogout} />
      <main className="main-container">
        <Topbar
          title={getTitle()}
          onLogWaste={() => setIsLogModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <div className="content-area">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {renderContent()}
            </div>
          </AnimatePresence>
        </div>
      </main>
      {isLogModalOpen && (
        <LogWasteModal
          user={profile}
          onClose={() => setIsLogModalOpen(false)}
          onSuccess={() => fetchProfile(session.user.id)}
        />
      )}
    </div>
  );
};

export default App;
