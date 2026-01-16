// src/components/adminComponents/AdminLeaguesList.jsx
import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';

export default function AdminLeaguesList({ leagues, onFinish, onDelete }) {
  return (
    <div className="admin-items-grid">
      {leagues.map(league => (
        <div key={league.id} className="admin-item-card league">
          <div className="item-header">
            <div className="item-info">
              <div className="item-title">
                {league.logo} {league.name}
              </div>
              <div className="item-subtitle">{league.season}</div>
            </div>
            <div className={`item-status ${league.status}`}>
              {league.status === 'active' ? 'Activa' : 'Finalizada'}
            </div>
          </div>
          <div className="item-actions">
            {league.status === 'active' && (
              <button 
                className="action-btn finish"
                onClick={() => onFinish(league)}
              >
                <CheckCircle size={16} />
                <span>Finalizar</span>
              </button>
            )}
            <button 
              className="action-btn delete"
              onClick={() => onDelete(league.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}