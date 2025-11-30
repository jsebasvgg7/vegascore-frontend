import React from 'react';
import { Trophy, Target } from 'lucide-react';
import '../styles/NavigationTabs.css';

export default function NavigationTabs({ activeTab, onTabChange }) {
  return (
    <div className="navigation-tabs">
      <button
        className={`nav-tab ${activeTab === 'matches' ? 'active' : ''}`}
        onClick={() => onTabChange('matches')}
      >
        <Target size={20} />
        <span>Partidos</span>
        <div className="tab-indicator"></div>
      </button>

      <button
        className={`nav-tab ${activeTab === 'leagues' ? 'active' : ''}`}
        onClick={() => onTabChange('leagues')}
      >
        <Trophy size={20} />
        <span>Ligas</span>
        <div className="tab-indicator"></div>
      </button>
    </div>
  );
}