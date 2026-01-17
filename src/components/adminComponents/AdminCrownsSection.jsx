// src/components/adminComponents/AdminCrownsSection.jsx
import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';

export default function AdminCrownsSection({ top10, history, onResetStats }) {
  return (
    <div className="admin-crowns-section">
      <div className="section-header">
        <div>
          <h3>Ranking Mensual Top 10</h3>
          <p>Usuarios ordenados por puntos mensuales</p>
        </div>
        {onResetStats && (
          <button 
            className="reset-stats-btn"
            onClick={onResetStats}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            <RotateCcw size={16} />
            <span>Resetear Estadísticas</span>
          </button>
        )}
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
        {(!top10 || top10.length === 0) && (
          <p className="empty-history">No hay usuarios con puntos mensuales aún</p>
        )}
      </div>

      <div className="section-header" style={{ marginTop: '32px' }}>
        <div>
          <h3>Historial de Coronas</h3>
          <p>Últimas coronas otorgadas</p>
        </div>
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