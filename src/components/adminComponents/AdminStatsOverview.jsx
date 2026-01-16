// src/components/adminComponents/AdminStatsOverview.jsx
import React from 'react';
import { Trophy, Target, Award, Package } from 'lucide-react';

export default function AdminStatsOverview({ stats }) {
  return (
    <div className="admin-stats-overview">
      <div className="admin-stat-card matches">
        <div className="stat-icon-wrapper">
          <Target size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Partidos</div>
          <div className="stat-value">{stats.matches.total}</div>
          <div className="stat-detail">
            {stats.matches.pending} pendientes
          </div>
        </div>
      </div>

      <div className="admin-stat-card leagues">
        <div className="stat-icon-wrapper">
          <Trophy size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Ligas</div>
          <div className="stat-value">{stats.leagues.total}</div>
          <div className="stat-detail">
            {stats.leagues.active} activas
          </div>
        </div>
      </div>

      <div className="admin-stat-card awards">
        <div className="stat-icon-wrapper">
          <Award size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Premios</div>
          <div className="stat-value">{stats.awards.total}</div>
          <div className="stat-detail">
            {stats.awards.active} activos
          </div>
        </div>
      </div>

      <div className="admin-stat-card system">
        <div className="stat-icon-wrapper">
          <Package size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Sistema</div>
          <div className="stat-value">
            {stats.achievements.total + stats.titles.total}
          </div>
          <div className="stat-detail">
            logros y títulos
          </div>
        </div>
      </div>
    </div>
  );
}