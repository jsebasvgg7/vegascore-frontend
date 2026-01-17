// src/components/adminComponents/AdminCrownModal.jsx
import React, { useState } from 'react';
import { X, Trophy, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import '../../styles/adminStyles/AdminCrownModal.css';

export default function AdminCrownModal({ 
  onClose, 
  onAward, 
  currentTopUser, 
  currentMonth,
  currentUserId 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthLabel, setMonthLabel] = useState(currentMonth || '');

  const handleAward = async () => {
    if (!currentTopUser) {
      setError('No hay un usuario top disponible');
      return;
    }

    if (!monthLabel) {
      setError('Por favor, especifica el mes (ej: 2026-01)');
      return;
    }

    // Validar formato del mes (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(monthLabel)) {
      setError('Formato inválido. Usa YYYY-MM (ej: 2026-01)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAward(currentTopUser.id, monthLabel, currentUserId);
      onClose();
    } catch (err) {
      console.error('Error awarding crown:', err);
      setError(err.message || 'Error al otorgar la corona');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-crown-modal-overlay">
      <div className="admin-crown-modal">
        <div className="modal-header">
          <Trophy size={24} className="header-icon" />
          <h2>Otorgar Corona Mensual</h2>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="user-info">
            <div className="user-detail">
              <span className="label">Campeón Actual:</span>
              <span className="value">{currentTopUser?.name || 'No disponible'}</span>
            </div>
            <div className="user-detail">
              <span className="label">Puntos Mensuales:</span>
              <span className="value">{currentTopUser?.monthly_points || 0}</span>
            </div>
            <div className="user-detail">
              <span className="label">Coronas Actuales:</span>
              <span className="value">{currentTopUser?.monthly_championships || 0}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="monthLabel">
              <Calendar size={14} />
              Mes (YYYY-MM):
            </label>
            <input
              id="monthLabel"
              type="text"
              value={monthLabel}
              onChange={(e) => setMonthLabel(e.target.value)}
              placeholder="Ej: 2026-01"
              disabled={isLoading}
            />
            <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
              Formato: Año-Mes (ej: 2026-01 para Enero 2026)
            </span>
          </div>

          <p className="confirmation-text">
            ¿Confirmas otorgar la corona mensual a <strong>{currentTopUser?.name}</strong> para <strong>{monthLabel || 'el mes seleccionado'}</strong>?
            <br /><br />
            Esta acción es permanente y actualizará:
            <br />
            • El historial de coronas
            <br />
            • El contador de campeonatos del usuario
          </p>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button 
            className="award-btn" 
            onClick={handleAward} 
            disabled={isLoading || !currentTopUser || !monthLabel}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <CheckCircle size={16} />
                Otorgar Corona
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}