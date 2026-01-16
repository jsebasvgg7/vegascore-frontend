// src/components/adminComponents/AdminMatchesList.jsx
import React from 'react';
import { Calendar, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminMatchesList({ matches, onFinish, onDelete }) {
  return (
    <div className="admin-items-grid">
      {matches.map(match => (
        <div key={match.id} className="admin-item-card match">
          <div className="item-header">
            <div className="item-info">
              <div className="item-league">{match.league}</div>
              <div className="item-teams">
                {match.home_team_logo} {match.home_team} vs {match.away_team} {match.away_team_logo}
              </div>
              <div className="item-meta">
                <Calendar size={14} />
                <span>{match.date}</span>
              </div>
            </div>
            <div className={`item-status ${match.status}`}>
              {match.status === 'pending' ? 'Pendiente' : 'Finalizado'}
            </div>
          </div>
          <div className="item-actions">
            {match.status === 'pending' && (
              <button 
                className="action-btn finish"
                onClick={() => onFinish(match)}
              >
                <CheckCircle size={16} />
                <span>Finalizar</span>
              </button>
            )}
            <button 
              className="action-btn delete"
              onClick={() => onDelete(match.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}