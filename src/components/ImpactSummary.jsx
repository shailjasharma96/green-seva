import React from 'react';
import { Zap, Leaf } from 'lucide-react';

const ImpactSummary = ({ user, onNavigate }) => (
    <div className="impact-grid">
        <div className="impact-card green" onClick={() => onNavigate?.('logs')} style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <div className="title-group">
                    <p>Total Recycled</p>
                    <h3>{user.total_weight || 0} <span className="unit">kg</span></h3>
                </div>
                <div className="trend positive">+12%</div>
            </div>
            <div className="progress-bar">
                <div className="fill" style={{ width: `${Math.min((user.total_weight || 0) * 5, 100)}%` }}></div>
            </div>
        </div>
        <div className="impact-card blue" onClick={() => onNavigate?.('rewards')} style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <div className="title-group">
                    <p>Eco Points</p>
                    <h3>{user.eco_points || 0} <span className="unit">pts</span></h3>
                </div>
                <div className="trend positive">+5%</div>
            </div>
            <Zap className="bg-icon" />
        </div>
        <div className="impact-card purple" onClick={() => onNavigate?.('rewards')} style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <div className="title-group">
                    <p>Impact Tokens</p>
                    <h3>{Math.floor((user.eco_points || 0) / 100)} <span className="unit">GSV</span></h3>
                </div>
                <div className="trend positive">+8%</div>
            </div>
            <Leaf className="bg-icon" />
        </div>
    </div>
);

export default ImpactSummary;
