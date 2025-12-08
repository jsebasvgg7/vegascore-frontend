import React, { useState } from 'react';
import { X, Trophy, Target, Award, CheckCircle } from 'lucide-react';
import '../styles/AdminModal.css';

export default function FinishLeagueModal({ league, onFinish, onClose }) {
  const [form, setForm] = useState({
    champion: '',
    top_scorer: '',
    top_scorer_goals: '',
    top_assist: '',
    top_assist_count: '',
    mvp_player: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    if (!form.champion || !form.top_scorer || !form.top_scorer_goals || 
        !form.top_assist || !form.top_assist_count || !form.mvp_player) {
      alert('Todos los campos son obligatorios');
      return;
    }

    onFinish(league.id, {
      champion: form.champion,
      top_scorer: form.top_scorer,
      top_scorer_goals: parseInt(form.top_scorer_goals),
      top_assist: form.top_assist,
      top_assist_count: parseInt(form.top_assist_count),
      mvp_player: form.mvp_player
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
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 className="modal-title-premium">Finalizar Liga</h2>
              <p className="modal-subtitle-premium">{league.name} - {league.season}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-premium">
          {/* Champion */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Trophy size={14} />
              <span>Campeón de la Liga</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="champion" 
              placeholder="Nombre del equipo campeón" 
              value={form.champion}
              onChange={handleChange}
            />
          </div>

          {/* Top Scorer */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Trophy size={14} />
              <span>Máximo Goleador</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="top_scorer" 
              placeholder="Nombre del jugador" 
              value={form.top_scorer}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">
              <span>Goles Anotados</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="top_scorer_goals" 
              type="number"
              min="0"
              placeholder="Cantidad de goles" 
              value={form.top_scorer_goals}
              onChange={handleChange}
            />
          </div>

          {/* Top Assist */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Target size={14} />
              <span>Máximo Asistidor</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="top_assist" 
              placeholder="Nombre del jugador" 
              value={form.top_assist}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">
              <span>Asistencias</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="top_assist_count" 
              type="number"
              min="0"
              placeholder="Cantidad de asistencias" 
              value={form.top_assist_count}
              onChange={handleChange}
            />
          </div>

          {/* MVP */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Award size={14} />
              <span>Jugador MVP</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="mvp_player" 
              placeholder="Nombre del jugador MVP" 
              value={form.mvp_player}
              onChange={handleChange}
            />
          </div>

          <div className="form-hint" style={{ marginTop: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <strong>Nota:</strong> Al finalizar la liga se calcularán automáticamente los puntos de cada usuario. Cada predicción correcta otorga 5 puntos (máximo 20 puntos por liga).
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-premium">
          <button className="modal-btn-premium secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-premium primary" onClick={submit}>
            <CheckCircle size={18} />
            <span>Finalizar Liga</span>
          </button>
        </div>
      </div>
    </div>
  );
}