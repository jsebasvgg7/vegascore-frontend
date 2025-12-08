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

  // Función para renderizar el logo (URL de imagen o emoji de fallback)
  const renderAwardLogo = (logoUrl, fallbackEmoji) => {
    if (logoUrl && logoUrl.startsWith('http')) {
      return (
        <img 
          src={logoUrl} 
          alt="Award logo" 
          className="award-logo-img"
          onError={(e) => {
            // Si la imagen falla, mostrar el emoji
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      );
    }
    // Si no hay URL, usar emoji
    return <span className="award-logo-emoji-display">{fallbackEmoji || '🏆'}</span>;
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
      className="award-card-light"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Header */}
      <div className="award-header-light">
        <div className="award-logo-section">
          <div className="award-logo-container">
            {renderAwardLogo(award.logo_url, award.logo)}
            <span className="award-logo-emoji-display" style={{ display: 'none' }}>
              {award.logo}
            </span>
          </div>
          <div className="award-info-header">
            <h3 className="award-name-light">{award.name}</h3>
            <span className="award-season-light">{award.season}</span>
          </div>
        </div>
      </div>

      {/* Formulario de predicción */}
      <div className="award-prediction-form">
        <div className="prediction-field-award">
          <label className="prediction-label-award">
            <Award size={14} />
            <span>Tu Predicción del Ganador</span>
          </label>
          <input
            type="text"
            className={`prediction-input-award ${hasPrediction ? 'has-prediction' : ''}`}
            value={predictedWinner}
            onChange={(e) => setPredictedWinner(e.target.value)}
            placeholder="Ingresa el nombre del ganador..."
            disabled={isFinished}
          />
          
          {isFinished && award.winner && (
            <div className="actual-result-award">
              <CheckCircle2 size={12} />
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
      <div className="award-footer-light">
        {isFinished && userPrediction ? (
          <div className="final-points-display">
            <Trophy size={16} />
            <span>
              {userPrediction.points_earned > 0 
                ? `¡Ganaste ${userPrediction.points_earned} puntos!` 
                : 'No acertaste esta vez'}
            </span>
          </div>
        ) : !isFinished && hasPrediction && (
          predictedWinner === userPrediction?.predicted_winner ? (
            <span className="prediction-status-light">
              <CheckCircle2 size={14} style={{color: '#059669'}}/>
              Predicción guardada
              {userPrediction.points_earned > 0 && (
                <span className="points-badge">+{userPrediction.points_earned} pts</span>
              )}
            </span>
          ) : null
        )}

        {!isFinished && (
          (!hasPrediction || predictedWinner !== userPrediction?.predicted_winner) && (
            <button className="predict-button-light" onClick={handleSubmit}>
              <Trophy size={16} />
              <span>{hasPrediction ? 'Actualizar' : 'Guardar'}</span>
            </button>
          )
        )}
      </div>

      {/* Deadline badge 
      {deadline && !isFinished && (
        <div className="award-deadline-badge">
          <Calendar size={12} />
          <span>Hasta {deadline}</span>
        </div>
      )}

      {isFinished && (
        <div className="award-status-badge finished">
          <CheckCircle2 size={12} />
          <span>Finalizado</span>
        </div>
      )}*/}
    </div>
  );
}