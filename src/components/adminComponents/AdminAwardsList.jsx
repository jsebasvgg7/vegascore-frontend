// src/components/adminComponents/AdminAwardsList.jsx
import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';

export default function AdminAwardsList({ awards, onFinish, onDelete }) {
  return (
    <div className="admin-items-grid">
      {awards.map(award => (
        <div key={award.id} className="admin-item-card award">
          <div className="item-header">
            <div className="item-info">
              <div className="item-title">
                {award.logo} {award.name}
              </div>
              <div className="item-subtitle">{award.season}</div>
            </div>
            <div className={`item-status ${award.status}`}>
              {award.status === 'active' ? 'Activo' : 'Finalizado'}
            </div>
          </div>
          <div className="item-actions">
            {award.status === 'active' && (
              <button 
                className="action-btn finish"
                onClick={() => onFinish(award)}
              >
                <CheckCircle size={16} />
                <span>Finalizar</span>
              </button>
            )}
            <button 
              className="action-btn delete"
              onClick={() => onDelete(award.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}