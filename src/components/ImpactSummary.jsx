import React from 'react';
import { Zap, Leaf } from 'lucide-react';

const ImpactSummary = ({ user }) => (
    <div className="impact-grid">
        <div className="impact-card green">
            <div className="card-header">
                <div className="title-group">
                    <p>Total Recycled</p>
                    <h3>{user.stats.totalWeight} <span className="unit">kg</span></h3>
                </div>
                <div className="trend positive">+12%</div>
            </div>
            <div className="progress-bar">
                <div className="fill" style={{ width: '82%' }}></div>
            </div>
        </div>
        <div className="impact-card blue">
            <div className="card-header">
                <div className="title-group">
                    <p>Eco Points</p>
                    <h3>{user.stats.points} <span className="unit">pts</span></h3>
                </div>
                <div className="trend positive">+5%</div>
            </div>
            <Zap className="bg-icon" />
        </div>
        <div className="impact-card purple">
            <div className="card-header">
                <div className="title-group">
                    <p>Impact Tokens</p>
                    <h3>{Math.floor(user.stats.points / 100)} <span className="unit">GSV</span></h3>
                </div>
                <div className="trend positive">+8%</div>
            </div>
            <Leaf className="bg-icon" />
        </div>
    </div>
);

export default ImpactSummary;
