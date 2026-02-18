import React from 'react';
import { Leaf, LayoutDashboard, History, MapPin, Award, User, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'logs', icon: History, label: 'Recycling Logs' },
        { id: 'centers', icon: MapPin, label: 'Nearby Centers' },
        { id: 'rewards', icon: Award, label: 'Rewards' },
        { id: 'profile', icon: User, label: 'My Profile' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Leaf size={32} />
                <span>GreenSeva</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile-mini" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
                    <div className="avatar-mini">
                        {user.name.charAt(0)}
                    </div>
                    <div className="user-info">
                        <p className="name">{user.name}</p>
                        <p className="email">{user.email}</p>
                    </div>
                </div>

                <button className="nav-item signout-btn" onClick={onLogout}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
