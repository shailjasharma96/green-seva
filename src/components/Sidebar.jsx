import React from 'react';
import { Leaf, LayoutDashboard, History, MapPin, Award, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
    const { t } = useTranslation();
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
        { id: 'logs', icon: History, label: t('common.recycling_logs') },
        { id: 'centers', icon: MapPin, label: t('common.nearby_centers') },
        { id: 'rewards', icon: Award, label: t('common.rewards') },
        { id: 'profile', icon: User, label: t('common.my_profile') },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Leaf size={32} />
                <span>{t('sidebar.brand_name')}</span>
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
                    <span>{t('common.sign_out')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
