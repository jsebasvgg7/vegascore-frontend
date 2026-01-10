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
  // Estados
  const [homeScore, setHomeScore] = useState(userPred?.home_score ?? "");
  const [awayScore, setAwayScore] = useState(userPred?.away_score ?? "");
  const [isSaved, setIsSaved] = useState(userPred !== undefined);

  // Sincronizar con cambios en userPred
  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setIsSaved(userPred !== undefined);
  }, [userPred]);

  // Cálculos de estado del partido
  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  // Verificar si la predicción cambió
  const isPredictionChanged = (
    parseInt(homeScore) !== userPred?.home_score || 
    parseInt(awayScore) !== userPred?.away_score
  );
  const showSaveButton = !isDisabled && (!isSaved || isPredictionChanged);

  // Manejadores
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

  // Funciones auxiliares
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
    return null;
  };

  const renderTeamLogo = (logoUrl, fallbackEmoji) => {
    if (logoUrl && logoUrl.startsWith('http')) {
      return (
        <img 
          src={logoUrl} 
          alt="Team logo" 
          className="team-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="match-card">
      
      {/* HEADER: Liga y Fecha */}
      <div className="match-header">
        <div className="league-info">
          {renderLeagueLogo()}
          <Trophy size={16} className="league-icon-fallback" style={{ display: match.league_logo_url ? 'none' : 'flex' }} />
          <span className="league-name">{match.league}</span>
        </div>
        
        <div className="match-date">
          <Calendar size={12} />
          <span>{formatMatchDate(match.date)}</span>
        </div>
      </div>

      {/* CONTENT: Equipos y Predicción */}
      <div className="match-content">
        
        {/* Equipo Local */}
        <div className="team-section">
          <div className="team-logo-wrapper">
            {renderTeamLogo(match.home_team_logo_url, match.home_team_logo)}
            <span className="team-emoji" style={{ display: match.home_team_logo_url ? 'none' : 'flex' }}>
              {match.home_team_logo || '⚽'}
            </span>
          </div>
          <span className="team-name">{match.home_team}</span>
        </div>

        {/* Predicción Central */}
        <div className="prediction-section">
          <div className="score-inputs">
            <div className={`score-box ${isSaved ? 'saved' : ''} ${isDisabled ? 'disabled' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input"
                value={homeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
                placeholder="—"
                disabled={isDisabled}
              />
              {isSaved && !isDisabled && (
                <div className="saved-indicator">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </div>
            
            <div className={`score-box ${isSaved ? 'saved' : ''} ${isDisabled ? 'disabled' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input"
                value={awayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
                placeholder="—"
                disabled={isDisabled}
              />
              {isSaved && !isDisabled && (
                <div className="saved-indicator">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </div>
          </div>
          
          <div className="match-time">
            <Clock size={12} />
            <span>{match.time}</span>
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="team-section">
          <div className="team-logo-wrapper">
            {renderTeamLogo(match.away_team_logo_url, match.away_team_logo)}
            <span className="team-emoji" style={{ display: match.away_team_logo_url ? 'none' : 'flex' }}>
              {match.away_team_logo || '⚽'}
            </span>
          </div>
          <span className="team-name">{match.away_team}</span>
        </div>
      </div>

      {/* FOOTER: Estado y Acciones */}
      {(isPastDeadline || showSaveButton || (isSaved && !isDisabled)) && (
        <div className="match-footer">
          {isPastDeadline ? (
            <div className="status-message expired">
              <Clock size={14} />
              <span>Predicción cerrada</span>
            </div>
          ) : showSaveButton ? (
            <button
              className="save-button"
              onClick={handleSubmit}
            >
              {isSaved ? "Actualiza" : "Guarda"}
            </button>
          ) : isSaved && !isDisabled ? (
            <div className="status-message saved">
              <CheckCircle2 size={14} />
              <span>Predicción guardada</span>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
}