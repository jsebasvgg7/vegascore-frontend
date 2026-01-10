// src/pages/DashboardPage.jsx
import React, { useState, useMemo } from "react";
import { Trophy, TrendingUp, Target, Filter, X } from "lucide-react";

// Components
import MatchCard from "../components/cardComponets/MatchCard";
import LeagueCard from "../components/cardComponets/LeagueCard";
import AwardCard from "../components/cardComponets/AwardCard";
import NavigationTabs from "../components/NavigationTabs";
import ProfilePage from "./ProfilePage";
import RankingPage from "./RankingPage";
import Footer from "../components/Footer";
import AdminPage from "./AdminPage";
import NotificationsPage from "./NotificationsPage";
import StatsPage from "./StatsPage";
import { PageLoader, LoadingOverlay } from "../components/LoadingStates";
import { ToastContainer, useToast } from "../components/Toast";

// Custom Hooks
import { useDataLoader } from "../hooks/useDataLoader";
import { useMatches } from "../hooks/useMatches";
import { useLeagues } from "../hooks/useLeagues";
import { useAwards } from "../hooks/useAwards";

// Styles
import "../styles/pagesStyles/DashboardPage.css";

export default function VegaScorePage() {
  // ========== STATE MANAGEMENT ==========
  const [showProfile, setShowProfile] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const [showFilters, setShowFilters] = useState(false);

  const toast = useToast();

  // ========== CUSTOM HOOKS ==========
  const {
    currentUser,
    users,
    matches,
    leagues,
    awards,
    loading,
    error,
    updateUsers,
    updateMatches,
    updateLeagues,
    updateAwards
  } = useDataLoader();

  const {
    loading: matchesLoading,
    makePrediction,
    addMatch,
    finishMatch
  } = useMatches(currentUser);

  const {
    loading: leaguesLoading,
    makeLeaguePrediction,
    addLeague,
    finishLeague: finishLeagueHook
  } = useLeagues(currentUser);

  const {
    loading: awardsLoading,
    makeAwardPrediction,
    addAward,
    finishAward: finishAwardHook
  } = useAwards(currentUser);

  // ========== LEAGUE FILTERS ==========
  const leagueCategories = [
    { id: 'all', name: 'Todos', icon: '🌍', leagues: [] },
    { id: 'england', name: 'Inglaterra', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', leagues: ['Premier League', 'Championship', 'FA Cup', 'Carabao Cup'] },
    { id: 'spain', name: 'España', icon: '🇪🇸', leagues: ['La Liga', 'Copa del Rey', 'Supercopa'] },
    { id: 'italy', name: 'Italia', icon: '🇮🇹', leagues: ['Serie A', 'Coppa Italia', 'Supercoppa'] },
    { id: 'germany', name: 'Alemania', icon: '🇩🇪', leagues: ['Bundesliga', 'DFB Pokal', 'Supercup'] },
    { id: 'france', name: 'Francia', icon: '🇫🇷', leagues: ['Ligue 1', 'Coupe de France', 'Trophée des Champions'] },
    { id: 'europe', name: 'Europa', icon: '🏆', leagues: ['UEFA Champions League', 'UEFA Europa League', 'UEFA Conference League', 'Champions League', 'Europa League', 'Conference League'] }
  ];

  // ========== HANDLERS - PAGINAS ==========
  const handleBackToHome = () => {
    setShowProfile(false);
    setShowRanking(false);
    setShowAdmin(false);
    setShowNotifications(false);
    setShowStats(false);
  };

  // ========== HANDLERS - MATCHES ==========
  const handleMakePrediction = async (matchId, homeScore, awayScore) => {
    const match = matches.find(m => m.id === matchId);
    if (match?.deadline) {
      const now = new Date();
      const deadline = new Date(match.deadline);
      if (now > deadline) {
        toast.warning("El tiempo para hacer predicciones ha expirado");
        return;
      }
    }

    await makePrediction(
      matchId,
      homeScore,
      awayScore,
      (matchList) => {
        updateMatches(matchList);
        toast.success("¡Predicción guardada exitosamente! 🎯");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== HANDLERS - LEAGUES ==========
  const handleMakeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp) => {
    await makeLeaguePrediction(
      leagueId,
      champion,
      topScorer,
      topAssist,
      mvp,
      (leagueList) => {
        updateLeagues(leagueList);
        toast.success("¡Predicción de liga guardada exitosamente! 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== HANDLERS - AWARDS ==========
  const handleMakeAwardPrediction = async (awardId, predictedWinner) => {
    await makeAwardPrediction(
      awardId,
      predictedWinner,
      (awardList) => {
        updateAwards(awardList);
        toast.success("¡Predicción guardada exitosamente! 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== FILTERED MATCHES ==========
  const filteredMatches = useMemo(() => {
    const pending = matches
      .filter((m) => m.status === "pending")
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });

    if (leagueFilter === 'all') return pending;

    const category = leagueCategories.find(c => c.id === leagueFilter);
    if (!category) return pending;

    return pending.filter(match => 
      category.leagues.some(league => 
        match.league.toLowerCase().includes(league.toLowerCase())
      )
    );
  }, [matches, leagueFilter]);

  // ========== RENDER ==========
  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="centered">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="centered">
        <div>Error: No se pudo cargar el usuario</div>
      </div>
    );
  }

  // Mostrar páginas secundarias
  if (showProfile) {
    return (
      <>
        <ProfilePage 
          currentUser={currentUser} 
          onBack={() => setShowProfile(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showRanking) {
    return (
      <>
        <RankingPage 
          currentUser={currentUser}
          users={users.sort((a, b) => b.points - a.points)}
          onBack={() => setShowRanking(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showAdmin) {
    return (
      <>
        <AdminPage 
          currentUser={currentUser}
          users={users.sort((a, b) => b.points - a.points)}
          onBack={() => setShowAdmin(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showNotifications) {
    return (
      <>
        <NotificationsPage 
          currentUser={currentUser}
          onBack={() => setShowNotifications(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showStats) {
    return (
      <>
        <StatsPage 
          currentUser={currentUser}
          onBack={() => setShowStats(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const activeLeagues = leagues.filter((l) => l.status === "active");
  const activeAwards = awards.filter((a) => a.status === "active");
  const isLoading = matchesLoading || leaguesLoading || awardsLoading;

  return (
    <>
      <div className="vega-root">
        <main className="container">
          <section className="main-content-full">
            <NavigationTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />

            {activeTab === 'matches' && (
              <div className="matches-section-premium">
                {/* Header */}
                <div className="matches-header-premium">
                  <div className="matches-title-section">
                    <div className="matches-icon-wrapper">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <h2 className="matches-title-premium">Próximos Partidos</h2>
                      <p className="matches-subtitle-premium">Haz tus predicciones y gana puntos</p>
                    </div>
                  </div>
                  <div className="matches-header-actions">
                    <div className="matches-badge">
                      <Target size={14} />
                      <span>{filteredMatches.length} disponibles</span>
                    </div>
                    <button 
                      className="filter-toggle-btn"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter size={16} />
                      <span>Filtrar</span>
                    </button>
                  </div>
                </div>

                {/* Filtros Desplegables */}
                {showFilters && (
                  <div className="league-filters-panel">
                    <div className="filters-panel-header">
                      <h3>Filtrar por competición</h3>
                      <button 
                        className="filters-close-btn"
                        onClick={() => setShowFilters(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="league-filters-grid">
                      {leagueCategories.map((category) => {
                        const categoryMatches = category.id === 'all'
                          ? matches.filter(m => m.status === "pending")
                          : matches.filter(m => 
                              m.status === "pending" &&
                              category.leagues.some(league =>
                                m.league.toLowerCase().includes(league.toLowerCase())
                              )
                            );

                        return (
                          <button
                            key={category.id}
                            className={`league-filter-btn ${leagueFilter === category.id ? 'active' : ''}`}
                            onClick={() => {
                              setLeagueFilter(category.id);
                              setShowFilters(false);
                            }}
                          >
                            <span className="filter-icon">{category.icon}</span>
                            <div className="filter-info">
                              <span className="filter-name">{category.name}</span>
                              <span className="filter-count">{categoryMatches.length} partidos</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chip de filtro activo */}
                {leagueFilter !== 'all' && (
                  <div className="active-filter-bar">
                    <div className="active-filter-chip">
                      <span className="filter-icon">
                        {leagueCategories.find(c => c.id === leagueFilter)?.icon}
                      </span>
                      <span>{leagueCategories.find(c => c.id === leagueFilter)?.name}</span>
                      <button 
                        className="clear-filter-btn"
                        onClick={() => setLeagueFilter('all')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Partidos */}
                <div className="matches-container">
                  {filteredMatches.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">⚽</div>
                      <div className="matches-empty-text">
                        {leagueFilter === 'all' 
                          ? 'No hay partidos disponibles'
                          : `No hay partidos de ${leagueCategories.find(c => c.id === leagueFilter)?.name}`
                        }
                      </div>
                      {leagueFilter !== 'all' && (
                        <button 
                          className="show-all-btn"
                          onClick={() => setLeagueFilter('all')}
                        >
                          Ver todos los partidos
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        userPred={m.predictions?.find(
                          (p) => p.user_id === currentUser?.id
                        )}
                        onPredict={handleMakePrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'leagues' && (
              <div className="matches-section-premium">
                <div className="matches-header-premium">
                  <div className="matches-title-section">
                    <div className="matches-icon-wrapper">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <h2 className="matches-title-premium">Competiciones</h2>
                      <p className="matches-subtitle-premium">Predice campeones y goleadores</p>
                    </div>
                  </div>
                  <div className="matches-badge">
                    <Trophy size={14} />
                    <span>{activeLeagues.length} activas</span>
                  </div>
                </div>

                <div className="matches-container">
                  {leagues.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🏆</div>
                      <div className="matches-empty-text">No hay ligas disponibles</div>
                      <div className="matches-empty-subtext">Las nuevas ligas aparecerán aquí</div>
                    </div>
                  ) : (
                    leagues.map((league) => (
                      <LeagueCard
                        key={league.id}
                        league={league}
                        userPrediction={league.league_predictions?.find(
                          (p) => p.user_id === currentUser?.id
                        )}
                        onPredict={handleMakeLeaguePrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'awards' && (
              <div className="matches-section-premium">
                <div className="matches-header-premium">
                  <div className="matches-title-section">
                    <div className="matches-icon-wrapper">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <h2 className="matches-title-premium">Premios Individuales</h2>
                      <p className="matches-subtitle-premium">Predice ganadores y gana puntos</p>
                    </div>
                  </div>
                  <div className="matches-badge">
                    <Trophy size={14} />
                    <span>{activeAwards.length} activos</span>
                  </div>
                </div>

                <div className="matches-container">
                  {awards.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🥇</div>
                      <div className="matches-empty-text">No hay premios disponibles</div>
                      <div className="matches-empty-subtext">Los nuevos premios aparecerán aquí</div>
                    </div>
                  ) : (
                    awards.map((award) => (
                      <AwardCard
                        key={award.id}
                        award={award}
                        userPrediction={award.award_predictions?.find(
                          (p) => p.user_id === currentUser?.id
                        )}
                        onPredict={handleMakeAwardPrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
        <Footer />

        {isLoading && <LoadingOverlay message="Procesando..." />}
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </div>
    </>
  );
}