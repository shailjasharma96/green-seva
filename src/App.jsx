import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabase } from './db/db';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    seedDatabase();
    // Check both local and session storage
    const savedUserId = localStorage.getItem('gs_user_id') || sessionStorage.getItem('gs_user_id');
    if (savedUserId) {
      setCurrentUserId(parseInt(savedUserId));
      setIsAuthenticated(true);
    }
  }, []);

  const user = useLiveQuery(() => currentUserId ? db.users.get(currentUserId) : null, [currentUserId]);

  const handleLogin = (userData, rememberMe) => {
    setCurrentUserId(userData.id);
    setIsAuthenticated(true);

    if (rememberMe) {
      localStorage.setItem('gs_user_id', userData.id);
    } else {
      sessionStorage.setItem('gs_user_id', userData.id);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserId(null);
    localStorage.removeItem('gs_user_id');
    sessionStorage.removeItem('gs_user_id');
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

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;
  if (!user) return <div className="loading">Loading your green profile...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} setActiveTab={setActiveTab} />;
      case 'profile': return <UserProfile user={user} />;
      case 'logs': return <RecyclingLogs user={user} searchQuery={searchQuery} />;
      case 'centers': return <NearbyCenters searchQuery={searchQuery} />;
      case 'rewards': return <Rewards user={user} />;
      default: return <Dashboard user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
      <main className="main-container">
        <Topbar
          title={getTitle()}
          onLogWaste={() => setIsLogModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="content-area">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {renderContent()}
            </div>
          </AnimatePresence>
        </div>
      </main>
      {isLogModalOpen && <LogWasteModal user={user} onClose={() => setIsLogModalOpen(false)} />}
    </div>
  );
};

export default App;
