// src/components/KnockoutMatchCard.jsx
import React from 'react';
import { Award, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import '../styles/cardStyles/KnockoutMatchCard.css';

// ============================================
// MAPA DE LOGOS
// ============================================
const TEAM_LOGO_MAP = {
  'Mexico': 'mexico',
  'South Africa': 'sudafrica',
  'Korea Republic': 'coreadelsur',
  'Denmark*': 'dinamarca',
  'Canada': 'canada',
  'Italy*': 'italia',
  'Qatar': 'qatar',
  'Switzerland': 'suiza',
  'Brazil': 'brasil',
  'Morocco': 'marruecos',
  'Haiti': 'haiti',
  'Scotland': 'escocia',
  'USA': 'usa',
  'Paraguay': 'paraguay',
  'Australia': 'australia',
  'Turkey*': 'turquia',
  'Germany': 'alemania',
  'Curacao': 'curacao',
  'Ivory Coast': 'costamarfil',
  'Ecuador': 'ecuador',
  'Netherlands': 'paisesbajos',
  'Japan': 'japon',
  'Poland*': 'polonia',
  'Tunisia': 'tunez',
  'Belgium': 'belgica',
  'Egypt': 'egipto',
  'Iran': 'iran',
  'New Zealand': 'nuevazelanda',
  'Spain': 'espana',
  'Cabo Verde': 'caboverde',
  'Saudi Arabia': 'arabiasaudita',
  'Uruguay': 'uruguay',
  'France': 'francia',
  'Senegal': 'senegal',
  'Bolivia*': 'bolivia',
  'Norway': 'noruega',
  'Argentina': 'argentina',
  'Algeria': 'argelia',
  'Austria': 'austria',
  'Jordan': 'jordan',
  'Portugal': 'portugal',
  'Congo*': 'congo',
  'Uzbekistan': 'uzbekistan',
  'Colombia': 'colombia',
  'England': 'inglaterra',
  'Croatia': 'croacia',
  'Ghana': 'ghana',
  'Panama': 'panama'
};

// ============================================
// HELPER: OBTENER BANDERA
// ============================================
function getTeamFlag(team) {
  const slug = TEAM_LOGO_MAP[team];
  if (!slug) return null;
  
  return supabase.storage
    .from('world-cup-logos')
    .getPublicUrl(`${slug}.png`).data.publicUrl;
}

// ============================================
// COMPONENTE: TEAM OPTION
// ============================================
function TeamOption({ team, placeholder, isSelected, onSelect, disabled }) {
  const flag = team ? getTeamFlag(team) : null;
  
  return (
    <div
      className={`knockout-team-option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onSelect : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-selected={isSelected}
    >
      <div className="knockout-team-flag-container">
        {flag ? (
          <img 
            src={flag} 
            alt={team} 
            className="knockout-team-flag"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
        ) : null}
        <span 
          className="knockout-team-placeholder" 
          style={{ display: flag ? 'none' : 'block' }}
        >
          ❓
        </span>
      </div>
      
      <span className="knockout-team-name">
        {team || placeholder}
      </span>
      
      {isSelected && (
        <CheckCircle 
          size={18} 
          className="knockout-check-icon"
          aria-label="Seleccionado"
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: KNOCKOUT MATCH CARD
// ============================================
export default function KnockoutMatchCard({ 
  match, 
  homeTeam, 
  awayTeam, 
  selectedWinner, 
  onSelect,
  disabled = false 
}) {
  return (
    <div className="knockout-match-card">
      {/* Header del partido */}
      <div className="knockout-match-header">
        <span className="knockout-match-label">{match.label}</span>
        <span className="knockout-match-id">#{match.id}</span>
      </div>

      {/* Equipo Local */}
      <TeamOption
        team={homeTeam}
        placeholder={match.home}
        isSelected={selectedWinner === homeTeam}
        onSelect={() => homeTeam && onSelect(homeTeam)}
        disabled={disabled || !homeTeam}
      />

      {/* Separador VS */}
      <div className="knockout-vs">VS</div>

      {/* Equipo Visitante */}
      <TeamOption
        team={awayTeam}
        placeholder={match.away}
        isSelected={selectedWinner === awayTeam}
        onSelect={() => awayTeam && onSelect(awayTeam)}
        disabled={disabled || !awayTeam}
      />

      {/* Footer opcional - mostrar si hay ganador */}
      {selectedWinner && (
        <div className="knockout-match-footer">
          <Award size={14} style={{ color: '#10B981' }} />
          <span>Ganador: {selectedWinner}</span>
        </div>
      )}
    </div>
  );
}