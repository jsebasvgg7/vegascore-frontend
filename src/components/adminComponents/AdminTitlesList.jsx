// src/components/adminComponents/AdminTitlesList.jsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminTitlesList({ titles, onEdit, onDelete }) {
  return (
    <div className="admin-items-grid">
      {titles.map(title => (
        <div key={title.id} className="admin-item-card title">
          <div className="item-header">
            <div className="item-info">
              <div className="item-title" style={{ color: title.color }}>
                {title.name}
              </div>
              <div className="item-subtitle">{title.description}</div>
            </div>
          </div>
          <div className="item-actions">
            <button 
              className="action-btn edit"
              onClick={() => onEdit(title)}
            >
              <Edit2 size={16} />
            </button>
            <button 
              className="action-btn delete"
              onClick={() => onDelete(title.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}