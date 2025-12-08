import React, { useState } from 'react';
import { X, Trophy, Target, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/adminStyles/AdminModal.css';

export default function FinishMatchModal({ match, onFinish, onClose }) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validación
    if (homeScore === '' || awayScore === '') {
      setError('Por favor ingresa ambos resultados');
      return;
    }

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away)) {
      setError('Los resultados deben ser números válidos');
      return;
    }

    if (home < 0 || away < 0) {
      setError('Los resultados no pueden ser negativos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onFinish(match.id, home, away);
    } catch (err) {
      setError('Error al finalizar el partido');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="modal-backdrop-premium">
      <div className="modal-premium" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header-premium">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="modal-title-premium">Finalizar Partido</h2>
              <p className="modal-subtitle-premium">
                Ingresa el resultado final
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-premium">
          {/* Match Info */}
          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              {/* Home Team */}
              <div style={{ 
                flex: 1, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ fontSize: '32px' }}>
                  {match.home_team_logo}
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '14px',
                  color: '#111'
                }}>
                  {match.home_team}
                </div>
              </div>

              {/* VS */}
              <div style={{
                padding: '8px 16px',
                background: 'white',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '12px',
                color: '#666',
                border: '2px solid #e5e7eb'
              }}>
                VS
              </div>

              {/* Away Team */}
              <div style={{ 
                flex: 1, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ fontSize: '32px' }}>
                  {match.away_team_logo}
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '14px',
                  color: '#111'
                }}>
                  {match.away_team}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '12px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#666'
            }}>
              {match.league} • {match.date} {match.time}
            </div>
          </div>

          {/* Score Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            {/* Home Score */}
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Target size={14} />
                <span>Goles Local</span>
                <span className="required">*</span>
              </label>
              <input
                className="form-input-premium"
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                disabled={loading}
                autoFocus
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '900',
                  padding: '16px'
                }}
              />
            </div>

            {/* Separator */}
            <div style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#ccc',
              marginTop: '24px'
            }}>
              -
            </div>

            {/* Away Score */}
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Target size={14} />
                <span>Goles Visitante</span>
                <span className="required">*</span>
              </label>
              <input
                className="form-input-premium"
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                disabled={loading}
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '900',
                  padding: '16px'
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#dc2626',
              marginBottom: '16px',
              animation: 'shake 0.5s'
            }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                {error}
              </span>
            </div>
          )}

          {/* Info Box */}
          <div style={{
            padding: '14px',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '2px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#6366f1',
            lineHeight: '1.5'
          }}>
            <strong>⚠️ Importante:</strong> Esta acción calculará automáticamente los puntos 
            de todas las predicciones y no se puede deshacer.
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-premium">
          <button 
            className="modal-btn-premium secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="modal-btn-premium primary" 
            onClick={handleSubmit}
            disabled={loading || homeScore === '' || awayScore === ''}
            style={{
              background: loading 
                ? '#9CA3AF' 
                : 'linear-gradient(135deg, #10B981, #059669)',
              opacity: (loading || homeScore === '' || awayScore === '') ? 0.6 : 1
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Finalizando...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Finalizar Partido</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}