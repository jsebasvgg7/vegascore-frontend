// src/components/adminComponents/AdminCrownsSection.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

export default function AdminCrownsSection({ top10, history }) {
  return (
    <div className="admin-crowns-section">
      <div className="section-header">
        <h3>Ranking Mensual Top 10</h3>
        <p>Usuarios ordenados por puntos mensuales</p>
      </div>
      <div className="top10-list">
        {top10?.map((user, index) => (
          <div key={user.id} className={`top-user-card ${index === 0 ? 'top1' : ''}`}>
            <div className="position">{index + 1}</div>
            <div className="user-info">
              <span className="name">{user.name}</span>
              <span className="points">{user.monthly_points || 0} pts</span>
              <span className="championships">Coronas: {user.monthly_championships || 0}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h3>Historial de Coronas</h3>
        <p>Últimas coronas otorgadas</p>
      </div>
      <div className="history-list">
        {history?.map(historyItem => (
          <div key={historyItem.id} className="history-item">
            <div className="history-info">
              <span className="month">{historyItem.month_year}</span>
              <span className="winner">{historyItem.users.name}</span>
              <span className="points">{historyItem.points} pts</span>
            </div>
            <div className="history-meta">
              <Calendar size={14} />
              <span>{new Date(historyItem.awarded_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {(!history || history.length === 0) && (
          <p className="empty-history">No hay coronas otorgadas aún</p>
        )}
      </div>
    </div>
  );
}