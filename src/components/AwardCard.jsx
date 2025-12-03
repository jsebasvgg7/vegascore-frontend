import React, { useState } from 'react';
import { Trophy, Award, Calendar, CheckCircle2, Star } from 'lucide-react';
import '../styles/AwardCard.css';

export default function AwardCard({ award, userPrediction, onPredict }) {
  const [predictedWinner, setPredictedWinner] = useState(userPrediction?.predicted_winner ?? '');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = () => {
    if (!predictedWinner.trim()) {
      alert('Por favor ingresa tu predicción');
      return;
    }
    onPredict(award.id, predictedWinner.trim());
  };

  const hasPrediction = userPrediction !== undefined;
  const isFinished = award.status === 'finished';
  const deadline = award.deadline ? new Date(award.deadline).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  return (
    <div 
      className="award-card-premium"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Header */}
      <div className="award-header-premium">
        <div className="award-logo-section">
          <div className="award-logo-big">{award.logo}</div>
          <div className="award-info-header">
            <h3 className="award-name-premium">{award.name}</h3>
            <span className="award-season">{award.season}</span>
          </div>
        </div>
        
        {deadline && !isFinished && (
          <div className="award-deadline">
            <Calendar size={14} />
            <span>Hasta {deadline}</span>
          </div>
        )}

        {isFinished && (
          <div className="award-status finished">
            <CheckCircle2 size={14} />
            <span>Finalizado</span>
          </div>
        )}
      </div>

      {/* Formulario de predicción */}
      <div className="award-prediction-form">
        <div className="prediction-field-award">
          <label className="prediction-label-award">
            <Award size={16} />
            <span>Tu Predicción - Ganador del {award.name}</span>
          </label>
          <input
            type="text"
            className="prediction-input-award"
            value={predictedWinner}
            onChange={(e) => setPredictedWinner(e.target.value)}
            placeholder="...Ingresa el nombre del ganador"
            disabled={isFinished}
          />
          
          {isFinished && award.winner && (
            <div className="actual-result-award">
              <CheckCircle2 size={14} />
              <span>
                <strong>Ganador: {award.winner}</strong>
                {predictedWinner.toLowerCase() === award.winner.toLowerCase() && 
                  <strong className="correct-badge-award"> ✓ ¡Acertaste!</strong>
                }
              </span>
            </div>
          )}
        </div>

        {award.category && (
          <div className="award-category-badge">
            <Star size={14} />
            <span>{award.category}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasPrediction && !isFinished && (
        <div className="prediction-saved-badge-award">
          <CheckCircle2 size={16} />
          <span>Predicción guardada</span>
          {userPrediction.points_earned > 0 && (
            <span className="points-earned-award">+{userPrediction.points_earned} pts</span>
          )}
        </div>
      )}

      {isFinished && userPrediction && (
        <div className="final-points-banner-award">
          <Trophy size={18} />
          <span>
            {userPrediction.points_earned > 0 
              ? `¡Ganaste ${userPrediction.points_earned} puntos!` 
              : 'No acertaste esta vez'}
          </span>
        </div>
      )}

      {!isFinished && (
        <button className="predict-award-btn" onClick={handleSubmit}>
          <Trophy size={18} />
          <span>{hasPrediction ? 'Actualizar Predicción' : 'Guardar Predicción'}</span>
          <div className="btn-glow-award"></div>
        </button>
      )}
    </div>
  );
}