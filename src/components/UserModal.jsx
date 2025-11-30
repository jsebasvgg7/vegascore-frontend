// src/components/UserModal.jsx
import React from "react";
import { Users, X } from "lucide-react";

export default function UserModal({ onClose, users, onSelect }) {
  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} />
            Usuarios Registrados
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <ul className="modal-user-list">
          {users.map((u) => (
            <li
              key={u.id}
              className="modal-user-item"
              onClick={() => onSelect(u)}
            >
              <span className="user-avatar">{u.name[0]}</span>
              <span className="user-name">{u.name}</span>
            </li>
          ))}
        </ul>

        <button className="btn secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}