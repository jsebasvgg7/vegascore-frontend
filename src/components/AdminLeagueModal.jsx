// src/components/AdminLeagueModal.jsx
import React, { useState } from 'react';
import { X, Plus, Trophy, Calendar, Award, Target } from 'lucide-react';
import '../styles/AdminModal.css';

export default function AdminLeagueModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    season: '',
    logo: '🏆',
    deadline: '',
    deadline_time: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    if (!form.id || !form.name || !form.season || !form.deadline || !form.deadline_time) {
      alert('Todos los campos son obligatorios');
      return;
    }

    // Combinar fecha y hora en formato ISO
    const deadlineISO = `${form.deadline}T${form.deadline_time}:00`;

    onAdd({
      id: form.id,
      name: form.name,
      season: form.season,
      logo: form.logo,
      status: 'active',
      deadline: deadlineISO
    });

    onClose();
  };

  return (
    <div className="modal-backdrop-premium">
      <div className="modal-premium">
        {/* Header */}
        <div className="modal-header-premium">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="modal-title-premium">Agregar Nueva Liga</h2>
              <p className="modal-subtitle-premium">Completa la información de la competición</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-premium">
          {/* ID */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Trophy size={14} />
              <span>ID de la Liga</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="id" 
              placeholder="Ej: epl-2024, ucl-2025" 
              value={form.id}
              onChange={handleChange}
            />
            <span className="form-hint">Identificador único (sin espacios, usar guiones)</span>
          </div>

          {/* Nombre */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Award size={14} />
              <span>Nombre de la Competición</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="name" 
              placeholder="Ej: Premier League, La Liga, UEFA Champions League" 
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Temporada */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Calendar size={14} />
              <span>Temporada</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="season" 
              placeholder="Ej: 2024/25, 2024-2025" 
              value={form.season}
              onChange={handleChange}
            />
          </div>

          {/* Logo */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <span>Logo / Emoji</span>
            </label>
            <div className="logo-input-wrapper">
              <input 
                className="form-input-premium logo-input" 
                name="logo" 
                placeholder="🏆" 
                value={form.logo}
                onChange={handleChange}
                maxLength={2}
              />
              <span className="logo-preview">{form.logo}</span>
            </div>
            <span className="form-hint">Usa emojis: ⚽🏆🇪🇸🇬🇧⭐</span>
          </div>

          {/* Fecha límite */}
          <div className="datetime-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Fecha Límite</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="deadline" 
                type="date" 
                value={form.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Hora Límite</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="deadline_time" 
                type="time" 
                value={form.deadline_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-hint" style={{ marginTop: '-10px', marginBottom: '10px' }}>
            Fecha y hora hasta la cual se pueden hacer predicciones
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-premium">
          <button className="modal-btn-premium secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-premium primary" onClick={submit}>
            <Plus size={18} />
            <span>Agregar Liga</span>
          </button>
        </div>
      </div>
    </div>
  );
}