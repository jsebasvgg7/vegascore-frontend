// src/components/adminComponents/AdminNavigationTabs.jsx
import React from 'react';
import { Trophy, Target, Award, Shield, Package, Crown } from 'lucide-react';

export default function AdminNavigationTabs({ activeSection, setActiveSection, stats }) {
  return (
    <div className="admin-nav-tabs">
      <button 
        className={`admin-nav-tab ${activeSection === 'matches' ? 'active' : ''}`}
        onClick={() => setActiveSection('matches')}
      >
        <Target size={20} />
        <span>Partidos</span>
        {stats.matches.pending > 0 && (
          <span className="tab-badge">{stats.matches.pending}</span>
        )}
      </button>

      <button 
        className={`admin-nav-tab ${activeSection === 'leagues' ? 'active' : ''}`}
        onClick={() => setActiveSection('leagues')}
      >
        <Trophy size={20} />
        <span>Ligas</span>
        {stats.leagues.active > 0 && (
          <span className="tab-badge">{stats.leagues.active}</span>
        )}
      </button>

      <button 
        className={`admin-nav-tab ${activeSection === 'awards' ? 'active' : ''}`}
        onClick={() => setActiveSection('awards')}
      >
        <Award size={20} />
        <span>Premios</span>
        {stats.awards.active > 0 && (
          <span className="tab-badge">{stats.awards.active}</span>
        )}
      </button>

      <button 
        className={`admin-nav-tab ${activeSection === 'achievements' ? 'active' : ''}`}
        onClick={() => setActiveSection('achievements')}
      >
        <Shield size={20} />
        <span>Logros</span>
      </button>

      <button 
        className={`admin-nav-tab ${activeSection === 'titles' ? 'active' : ''}`}
        onClick={() => setActiveSection('titles')}
      >
        <Package size={20} />
        <span>Títulos</span>
      </button>

      <button 
        className={`admin-nav-tab ${activeSection === 'crowns' ? 'active' : ''}`}
        onClick={() => setActiveSection('crowns')}
      >
        <Crown size={20} />
        <span>Coronas</span>
        {stats.crowns.thisMonth === 0 && (
          <span className="tab-badge pending">Pendiente</span>
        )}
      </button>
    </div>
  );
}