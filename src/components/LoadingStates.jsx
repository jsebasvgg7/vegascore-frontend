import React from 'react';
import { Loader2 } from 'lucide-react';
import "../styles/LoadingStates.css";

export const Spinner = ({ size = 40, color = '#ff8a00' }) => {
  return (
    <div className="spinner-wrapper">
      <Loader2 size={size} color={color} className="spinner-icon" />
    </div>
  );
};

// Loading de página completa
export const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <div className="logo-loader">⚽</div>
        <Spinner size={48} />
        <p className="loader-text">Cargando...</p>
      </div>
    </div>
  );
};

// Skeleton para Match Card
export const MatchCardSkeleton = () => {
  return (
    <div className="match-card-premium skeleton-card">
      <div className="match-header-premium">
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-datetime"></div>
      </div>

      <div className="teams-premium">
        <div className="team-premium home">
          <div className="skeleton skeleton-logo"></div>
          <div className="team-info">
            <div className="skeleton skeleton-team-name"></div>
            <div className="skeleton skeleton-team-label"></div>
          </div>
        </div>

        <div className="score-section">
          <div className="score-inputs-premium">
            <div className="skeleton skeleton-score"></div>
            <div className="vs-premium">VS</div>
            <div className="skeleton skeleton-score"></div>
          </div>
        </div>

        <div className="team-premium away">
          <div className="team-info">
            <div className="skeleton skeleton-team-name"></div>
            <div className="skeleton skeleton-team-label"></div>
          </div>
          <div className="skeleton skeleton-logo"></div>
        </div>
      </div>

      <div className="skeleton skeleton-button"></div>
    </div>
  );
};

// Skeleton para Ranking Item
export const RankingItemSkeleton = () => {
  return (
    <div className="ranking-item-premium skeleton-card">
      <div className="skeleton skeleton-rank-number"></div>
      <div className="rank-user-info">
        <div className="skeleton skeleton-avatar"></div>
        <div className="rank-details">
          <div className="skeleton skeleton-rank-name"></div>
          <div className="skeleton skeleton-rank-stats"></div>
        </div>
      </div>
      <div className="rank-points-premium">
        <div className="skeleton skeleton-points"></div>
      </div>
    </div>
  );
};

// Skeleton para Stats Card
export const StatCardSkeleton = () => {
  return (
    <div className="stat-card skeleton-card">
      <div className="skeleton skeleton-stat-icon"></div>
      <div className="skeleton skeleton-stat-label"></div>
      <div className="skeleton skeleton-stat-value"></div>
    </div>
  );
};

// Container de Skeletons para múltiples cards
export const MatchListSkeleton = ({ count = 3 }) => {
  return (
    <div className="matches-container">
      {[...Array(count)].map((_, index) => (
        <MatchCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const RankingListSkeleton = ({ count = 5 }) => {
  return (
    <div className="ranking-list-premium">
      {[...Array(count)].map((_, index) => (
        <RankingItemSkeleton key={index} />
      ))}
    </div>
  );
};

// Loading Overlay para acciones
export const LoadingOverlay = ({ message = "Procesando..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <Spinner size={48} />
        <p className="loading-overlay-text">{message}</p>
      </div>
    </div>
  );
};

// Mini loader para botones
export const ButtonLoader = ({ size = 16 }) => {
  return <Loader2 size={size} className="button-spinner" />;
};