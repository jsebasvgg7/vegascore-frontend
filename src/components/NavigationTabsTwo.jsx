// src/components/NavigationTabsTwo.jsx
import React from 'react';
import { Trophy, Shield } from 'lucide-react';
import '../styles/NavigationTabsTwo.css';

export default function NavigationTabsTwo({ activeTab, onTabChange, isAdmin }) {
  // Si no es admin, no mostrar las tabs
  if (!isAdmin) return null;

  return (
    <div className="navigation-tabs-two">
      {/* TAB: RANKING */}
      <button
        className={`nav-tab-two ${activeTab === 'ranking' ? 'active' : ''}`}
        onClick={() => onTabChange('ranking')}
      >
        <Trophy size={20} />
        <span>Ranking</span>
        <div className="tab-indicator-two"></div>
      </button>

      {/* TAB: ADMIN */}
      <button
        className={`nav-tab-two ${activeTab === 'admin' ? 'active' : ''}`}
        onClick={() => onTabChange('admin')}
      >
        <Shield size={20} />
        <span>Admin</span>
        <div className="tab-indicator-two"></div>
      </button>
    </div>
  );
}