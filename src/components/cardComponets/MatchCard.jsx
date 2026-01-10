// src/components/MatchCard.jsx
import React, { useState, useEffect } from "react";
import {  
  Clock, 
  CheckCircle2,
  Calendar,
  Trophy
} from "lucide-react";
import "../../styles/cardStyles/MatchCard.css"; 

export default function MatchCard({ match, userPred, onPredict }) {
  const initialHomeScore = userPred?.home_score ?? "";
  const initialAwayScore = userPred?.away_score ?? "";

  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [isSaved, setIsSaved] = useState(userPred !== undefined);

  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setIsSaved(userPred !== undefined);
  }, [userPred]);
  
  const handleScoreChange = (team, value) => {
    if (isDisabled) return;
    
    const numericValue = parseInt(value, 10);
    const score = isNaN(numericValue) || numericValue < 0 ? value : Math.min(numericValue, 20);

    if (team === 'home') {
      setHomeScore(score);
    } else {
      setAwayScore(score);
    }
    setIsSaved(false);
  };

  const handleSubmit = () => {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (homeScore === "" || awayScore === "" || isNaN(home) || isNaN(away)) {
        alert("Por favor, ingresa un marcador válido en ambos campos.");
        return;
    }

    if (isSaved && home === userPred.home_score && away === userPred.away_score) {
      return; 
    }

    onPredict(match.id, home, away);
    setIsSaved(true);
  };

  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  const isPredictionChanged = (
    parseInt(homeScore) !== userPred?.home_score || 
    parseInt(awayScore) !== userPred?.away_score
  );
  const showSaveButton = !isDisabled && (!isSaved || isPredictionChanged);

  // Función para renderizar el logo de la competición
  const renderLeagueLogo = () => {
    if (match.league_logo_url) {
      return (
        <img 
          src={match.league_logo_url} 
          alt={`${match.league} logo`}
          className="league-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            const fallbackIcon = e.target.nextElementSibling;
            if (fallbackIcon) fallbackIcon.style.display = 'flex';
          }}
        />
      );
    }
    return <Trophy size={16} className="league-icon-fallback" />;
  };

  // Función para renderizar el logo del equipo
  const renderTeamLogo = (logoUrl, fallbackEmoji) => {
    if (logoUrl && logoUrl.startsWith('http')) {
      return (
        <img 
          src={logoUrl} 
          alt="Team logo" 
          className="team-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = 'flex';
            }
          }}
        />
      );
    }
    return <span className="team-emoji">{fallbackEmoji || '⚽'}</span>;
  };

  // Función para formatear la fecha
  const formatMatchDate = (dateString) => {
    if (dateString && typeof dateString === 'string' && !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const matchDate = new Date(year, month - 1, day);
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const normalizeDate = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };

      const normalizedMatch = normalizeDate(matchDate);
      const normalizedToday = normalizeDate(today);
      const normalizedTomorrow = normalizeDate(tomorrow);

      if (normalizedMatch.getTime() === normalizedToday.getTime()) {
        return 'Hoy';
      } else if (normalizedMatch.getTime() === normalizedTomorrow.getTime()) {
        return 'Mañana';
      } else {
        return matchDate.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="match-card">
      
      {/* HEADER */}
      <div className="match-header">
        <div className="league-info">
          {renderLeagueLogo()}
          <Trophy size={16} className="league-icon-fallback" style={{ display: 'none' }} />
          <span className="league-name">{match.league}</span>
        </div>
        
        <div className="match-date">
          <Calendar size={12} />
          <span>{formatMatchDate(match.date)}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="match-content">
        
        {/* Equipo Local */}
        <div className="team-section">
          <div className="team-logo-container">
            {renderTeamLogo(match.home_team_logo_url, match.home_team_logo)}
            <span className="team-emoji" style={{ display: 'none' }}>
              {match.home_team_logo}
            </span>
          </div>
          <span className="team-name">{match.home_team}</span>
        </div>

        {/* Controles de Predicción */}
        <div className="prediction-section">
          
          <div className="score-inputs">
            <div className={`score-box ${isSaved ? 'saved' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input"
                value={homeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
                placeholder="0"
                disabled={isDisabled}
              />
              {isSaved && (
                <div className="saved-indicator">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </div>
            
            <div className={`score-box ${isSaved ? 'saved' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input"
                value={awayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
                placeholder="0"
                disabled={isDisabled}
              />
              {isSaved && (
                <div className="saved-indicator">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </div>
          </div>
          
          <div className="match-time">
            <Clock size={13} />
            <span>{match.time}</span>
          </div>

        </div>

        {/* Equipo Visitante */}
        <div className="team-section">
          <div className="team-logo-container">
            {renderTeamLogo(match.away_team_logo_url, match.away_team_logo)}
            <span className="team-emoji" style={{ display: 'none' }}>
              {match.away_team_logo}
            </span>
          </div>
          <span className="team-name">{match.away_team}</span>
        </div>
      </div>

      {/* FOOTER - AHORA CON EL BOTÓN */}
      <div className="match-footer">
        {isPastDeadline ? (
          <span className="status-message expired">
            <Clock size={14} /> Plazo de predicción expirado
          </span>
        ) : showSaveButton ? (
          <button
            className="save-button"
            onClick={handleSubmit}
          >
            {isSaved ? "Actualizar" : "Guardar"}
          </button>
        ) : !isDisabled && isSaved ? (
          <span className="status-message saved">
            <CheckCircle2 size={14} />
            Predicción guardada
          </span>
        ) : null}
      </div>

    </div>
  );
}