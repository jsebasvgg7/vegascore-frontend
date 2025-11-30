// src/components/AdminModal.jsx
import React, { useState } from "react";
import { X, Plus, Calendar, Clock, Shield } from "lucide-react";

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: "",
    league: "",
    home_team: "",
    away_team: "",
    home_team_logo: "🏠",
    away_team_logo: "✈️",
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    if (!form.id || !form.home_team || !form.away_team || !form.date || !form.time) {
      alert("Todos los campos son obligatorios");
      return;
    }

    onAdd({
      ...form,
      status: "pending",
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} />
            Agregar Partido
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>
              ID del partido
            </label>
            <input 
              className="input" 
              name="id" 
              placeholder="match-001" 
              value={form.id}
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={14} />
              Liga
            </label>
            <input 
              className="input" 
              name="league" 
              placeholder="Premier League" 
              value={form.league}
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>
              Equipo Local
            </label>
            <input 
              className="input" 
              name="home_team" 
              placeholder="Manchester United" 
              value={form.home_team}
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>
              Equipo Visitante
            </label>
            <input 
              className="input" 
              name="away_team" 
              placeholder="Liverpool" 
              value={form.away_team}
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>
                Logo Local
              </label>
              <input 
                className="input" 
                name="home_team_logo" 
                placeholder="🏠" 
                value={form.home_team_logo}
                onChange={handleChange}
                maxLength={2}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>
                Logo Visitante
              </label>
              <input 
                className="input" 
                name="away_team_logo" 
                placeholder="✈️" 
                value={form.away_team_logo}
                onChange={handleChange}
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              Fecha
            </label>
            <input 
              className="input" 
              name="date" 
              type="date" 
              value={form.date}
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              Hora
            </label>
            <input 
              className="input" 
              name="time" 
              type="time" 
              value={form.time}
              onChange={handleChange} 
            />
          </div>

          <button className="btn" onClick={submit}>
            <Plus size={18} style={{ marginRight: '6px', display: 'inline' }} />
            Agregar Partido
          </button>
          <button className="btn secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}