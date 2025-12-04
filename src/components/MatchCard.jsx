// src/components/MatchCard.jsx
import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Clock, 
  CheckCircle2
} from "lucide-react";
// Importar tu archivo de estilos para tema claro (MatchCard.css)
import "../styles/MatchCard.css"; 

export default function MatchCard({ match, userPred, onPredict }) {
  // Inicializar con la predicción del usuario o cadena vacía ("") para input
  const initialHomeScore = userPred?.home_score ?? "";
  const initialAwayScore = userPred?.away_score ?? "";

  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [isSaved, setIsSaved] = useState(userPred !== undefined);

  // Re-sincronizar el estado cuando la predicción del usuario (userPred) cambie
  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setIsSaved(userPred !== undefined);
  }, [userPred]);
  
  // Handlers para el cambio de input (NO necesitamos incrementar/decrementar)
  const handleScoreChange = (team, value) => {
    if (isDisabled) return;
    
    // Asegurar que solo se guarden números y que no excedan un límite razonable (ej. 20)
    const numericValue = parseInt(value, 10);
    const score = isNaN(numericValue) || numericValue < 0 ? value : Math.min(numericValue, 20);

    if (team === 'home') {
      setHomeScore(score);
    } else {
      setAwayScore(score);
    }
    setIsSaved(false); // Marcar como no guardado al cambiar
  };

  // Handler de envío de predicción
  const handleSubmit = () => {
    // Validar que ambos campos tienen un valor numérico y no son vacíos
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (homeScore === "" || awayScore === "" || isNaN(home) || isNaN(away)) {
        alert("Por favor, ingresa un marcador válido en ambos campos.");
        return;
    }

    // Si los scores son iguales a la predicción guardada, no hacer nada
    if (isSaved && home === userPred.home_score && away === userPred.away_score) {
      return; 
    }

    // Llamar a la función principal
    onPredict(match.id, home, away); // Pasar enteros parseados
    setIsSaved(true); // Asumir éxito inmediatamente
  };

  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now > deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  const isPredictionChanged = (
    parseInt(homeScore) !== userPred?.home_score || 
    parseInt(awayScore) !== userPred?.away_score
  );
  const showSaveButton = !isDisabled && (!isSaved || isPredictionChanged);

  return (
    // Usa la clase base de tu diseño de fondo claro
    <div className="match-card-light">
      
      {/* Header Compacto (Fecha de HOY, Liga, Hora) */}
      <div className="match-header-light">
        {/* Simulación del punto verde o fecha */}
        {match.date.toLowerCase().includes("hoy") ? (
          <div className="status-dot"></div>
        ) : null}
        
        {/* Información de la Liga y Hora */}
        <div className="match-league-info-light">
          <Zap size={14} className="league-icon" />
          <span className="league-name">{match.league}</span>
          <span className="match-datetime-separator">•</span>
          <span className="match-time">
            <Clock size={12} />
            {match.time}
          </span>
          {/* Si necesitas el icono de Edit2, descomentarlo: */}
          {/* <Edit2 size={16} className="edit-icon" /> */}
        </div>
      </div>

      {/* Contenido Principal (Equipos y Controles Centrales) */}
      <div className="match-content-light">
        
        {/* Equipo Local */}
        <div className="team-box-light team-home">
          <span className="team-logo-light">{match.home_team_logo}</span>
          <span className="team-name-light">{match.home_team}</span>
        </div>

        {/* Controles de Predicción Centrales (Ahora con Inputs) */}
        <div className="prediction-controls">
          
          {/* Marcador con Inputs */}
          <div className="score-display-light">
            {/* Input Local */}
            <div className={`score-cell-light ${isSaved ? 'has-prediction' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input-in-cell"
                value={homeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
                placeholder="0"
                disabled={isDisabled}
              />
              {isSaved && <div className="prediction-check-light"><CheckCircle2 size={12} /></div>}
            </div>
            
            {/* Input Visitante */}
            <div className={`score-cell-light ${isSaved ? 'has-prediction' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input-in-cell"
                value={awayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
                placeholder="0"
                disabled={isDisabled}
              />
              {isSaved && <div className="prediction-check-light"><CheckCircle2 size={12} /></div>}
            </div>
          </div>
           
          {/* Botón de Guardar/Actualizar */}
          {showSaveButton && (
            <button
              className="predict-button-light"
              onClick={handleSubmit}
              style={{ marginTop: '8px', width: '100%' }}
            >
              {isSaved ? "Actualizar" : "Guardar Predicción"}
            </button>
          )}

        </div>

        {/* Equipo Visitante */}
        <div className="team-box-light team-away">
          <span className="team-logo-light">{match.away_team_logo}</span>
          <span className="team-name-light">{match.away_team}</span>
        </div>
      </div>

      {/* Footer (Solo para mensaje de expiración o estado) */}
      <div className="match-footer-light">
        {isDisabled ? (
          <span className="prediction-status-light" style={{color: '#ef4444'}}>
             <Clock size={14} /> Plazo de predicción expirado
          </span>
        ) : !showSaveButton && isSaved ? (
          <span className="prediction-status-light">
            <CheckCircle2 size={14} style={{color: '#059669'}}/>
            Predicción guardada
          </span>
        ) : null}
      </div>

    </div>
  );
}