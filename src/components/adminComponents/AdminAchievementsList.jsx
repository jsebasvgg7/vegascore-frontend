// src/components/adminComponents/AdminAchievementsList.jsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminAchievementsList({ achievements, onEdit, onDelete }) {
  return (
    <div className="admin-items-grid">
      {achievements.map(achievement => (
        <div key={achievement.id} className="admin-item-card achievement">
          <div className="item-header">
            <div className="item-info">
              <div className="item-title">
                {achievement.icon} {achievement.name}
              </div>
              <div className="item-subtitle">{achievement.description}</div>
              <div className="item-meta">
                <span className="category-badge">{achievement.category}</span>
                <span>{achievement.requirement_value} {achievement.requirement_type}</span>
              </div>
            </div>
          </div>
          <div className="item-actions">
            <button 
              className="action-btn edit"
              onClick={() => onEdit(achievement)}
            >
              <Edit2 size={16} />
            </button>
            <button 
              className="action-btn delete"
              onClick={() => onDelete(achievement.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}