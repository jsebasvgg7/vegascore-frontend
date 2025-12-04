import React, { useState } from "react";
import { Calendar, Clock, Zap, CheckCircle2 } from "lucide-react";
import "../styles/MatchCard.css";

export default function MatchCard({ match, userPred, onPredict }) {
  const [homeScore, setHomeScore] = useState(userPred?.home_score ?? "");
  const [awayScore, setAwayScore] = useState(userPred?.away_score ?? "");

  const handleSubmit = () => {
    if (homeScore === "" || awayScore === "") {
      alert("Ingresa un marcador válido");
      return;
    }
    onPredict(match.id, parseInt(homeScore), parseInt(awayScore));
  };

  const hasPrediction = userPred !== undefined;
  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now > deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  return (
    <div className="match-card-modern">
      {/* Header con Liga */}
      <div className="match-header-modern">
        <div className="match-league-info">
          <span className="league-icon">{match.league === "LaLiga" ? "⚽" : "⚽"}</span>
          <span className="league-name">{match.league}</span>
        </div>
      </div>

      {/* Contenedor Principal de Equipos y Marcador */}
      <div className="match-main-container">
        {/* Equipo Local */}
        <div className="team-section">
          <span className="team-logo-large">{match.home_team_logo}</span>
          <span className="team-name-display">{match.home_team}</span>
        </div>

        {/* Marcador Central */}
        <div className="score-section">
          <input
            type="number"
            min="0"
            max="20"
            className="score-input-central"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="-"
            disabled={isDisabled}
          />
          <span className="score-separator">-</span>
          <input
            type="number"
            min="0"
            max="20"
            className="score-input-central"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="-"
            disabled={isDisabled}
          />
        </div>

        {/* Equipo Visitante */}
        <div className="team-section">
          <span className="team-logo-large">{match.away_team_logo}</span>
          <span className="team-name-display">{match.away_team}</span>
        </div>
      </div>

      {/* Footer con Estado y Botón */}
      <div className="match-footer-modern">
        {hasPrediction && (
          <div className="prediction-status saved">
            <CheckCircle2 size={14} />
            <span>Predicción guardada</span>
          </div>
        )}
        
        {!isDisabled && (
          <button 
            className="predict-button-modern" 
            onClick={handleSubmit}
          >
            <span>{hasPrediction ? "Actualizar" : "Guardar"}</span>
          </button>
        )}
      </div>
    </div>
  );
}