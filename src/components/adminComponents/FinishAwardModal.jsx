import React, { useState } from 'react';
import { X, Trophy, CheckCircle } from 'lucide-react';
import '../styles/adminStyles/AdminModal.css';

export default function FinishAwardModal({ award, onFinish, onClose }) {
  const [winner, setWinner] = useState('');

  const submit = () => {
    if (!winner.trim()) {
      alert('Debes ingresar el ganador del premio');
      return;
    }

    onFinish(award.id, winner.trim());
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
              <h2 className="modal-title-premium">Finalizar Premio</h2>
              <p className="modal-subtitle-premium">{award.name} - {award.season}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-premium">
          {/* Ganador */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Trophy size={14} />
              <span>Ganador del Premio</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="winner" 
              placeholder="Nombre completo del ganador" 
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
            />
          </div>

          <div className="form-hint" style={{ marginTop: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <strong>Nota:</strong> Al finalizar el premio se calcularán automáticamente los puntos. Cada predicción correcta otorga <strong>10 puntos</strong>.
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-premium">
          <button className="modal-btn-premium secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-premium primary" onClick={submit}>
            <CheckCircle size={18} />
            <span>Finalizar Premio</span>
          </button>
        </div>
      </div>
    </div>
  );
}