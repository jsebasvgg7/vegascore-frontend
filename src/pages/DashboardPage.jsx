// src/pages/DashboardPage.jsx - CON FILTROS MODERNOS
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Trophy, TrendingUp, Target, Filter, X, ArrowUpDown, ChevronRight } from "lucide-react";

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
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState('date-asc');
  
  const sortRef = useRef(null);
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

  // ========== LEAGUE CATEGORIES ==========
  const leagueCategories = [
    { id: 'all', name: 'Todos', icon: '🌍', leagues: [] },
    { id: 'europe', name: 'Europa', icon: '🏆', leagues: ['Champions League', 'Europa League', 'Conference League'] },
    { id: 'england', name: 'Inglaterra', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', leagues: ['Premier League', 'Championship', 'FA Cup', 'EFL Cup'] },
    { id: 'spain', name: 'España', icon: '🇪🇸', leagues: ['La Liga', 'Copa del Rey', 'Supercopa'] },
    { id: 'italy', name: 'Italia', icon: '🇮🇹', leagues: ['Serie A', 'Coppa Italia', 'Supercoppa'] },
    { id: 'germany', name: 'Alemania', icon: '🇩🇪', leagues: ['Bundesliga', 'DFB Pokal'] },
    { id: 'france', name: 'Francia', icon: '🇫🇷', leagues: ['Ligue 1', 'Coupe de France', 'Coupe de la Ligue'] },
    { id: 'portugal', name: 'Portugal', icon: '🇵🇹', leagues: ['Primeira Liga', 'Taça de Portugal'] },
    { id: 'netherlands', name: 'Países Bajos', icon: '🇳🇱', leagues: ['Eredivisie'] },
    { id: 'southamerica', name: 'Sudamérica', icon: '🌎', leagues: ['Copa Libertadores', 'Copa Sudamericana'] },
  ];

  // ========== CLOSE SORT ON OUTSIDE CLICK ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    if (showSort) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSort]);

  // ========== HANDLERS ==========
  const handleBackToHome = () => {
    setShowProfile(false);
    setShowRanking(false);
    setShowAdmin(false);
    setShowNotifications(false);
    setShowStats(false);
  };

  const handleMakePrediction = async (matchId, homeScore, awayScore) => {
    const match = matches.find(m => m.id === matchId);
    if (match?.deadline) {
      const now = new Date();
      const deadline = new Date(match.deadline);
      if (now > deadline) {
        toast.warning("Plazo expirado");
        return;
      }
    }

    await makePrediction(
      matchId,
      homeScore,
      awayScore,
      (matchList) => {
        updateMatches(matchList);
        toast.success("Guardado 🎯");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const handleMakeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp) => {
    await makeLeaguePrediction(
      leagueId,
      champion,
      topScorer,
      topAssist,
      mvp,
      (leagueList) => {
        updateLeagues(leagueList);
        toast.success("Guardado 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const handleMakeAwardPrediction = async (awardId, predictedWinner) => {
    await makeAwardPrediction(
      awardId,
      predictedWinner,
      (awardList) => {
        updateAwards(awardList);
        toast.success("Guardado 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== FILTERED & SORTED MATCHES ==========
  const filteredMatches = useMemo(() => {
    let pending = matches
      .filter((m) => m.status === "pending");

    // Aplicar filtro de liga
    if (leagueFilter !== 'all') {
      const category = leagueCategories.find(c => c.id === leagueFilter);
      if (category) {
        pending = pending.filter(match => 
          category.leagues.some(league => 
            match.league.toLowerCase().includes(league.toLowerCase())
          )
        );
      }
    }

    // Aplicar ordenamiento
    return pending.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      
      switch (sortOption) {
        case 'date-asc':
          return dateA - dateB;
        case 'date-desc':
          return dateB - dateA;
        case 'league-asc':
          return a.league.localeCompare(b.league);
        case 'league-desc':
          return b.league.localeCompare(a.league);
        default:
          return dateA - dateB;
      }
    });
  }, [matches, leagueFilter, sortOption]);

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
        <div>Error: Usuario no encontrado</div>
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
                {/* Header con Sort y Filter */}
                <div className="matches-header-premium">
                  <div className="matches-badge">
                    <Target size={16} />
                    <span>{filteredMatches.length} disponibles</span>
                  </div>
                  
                  <div className="sort-filter-buttons">
                    {/* Sort Button */}
                    <div style={{ position: 'relative' }} ref={sortRef}>
                      <button 
                        className={`sort-btn ${showSort ? 'active' : ''}`}
                        onClick={() => setShowSort(!showSort)}
                      >
                        <ArrowUpDown size={16} />
                        <span>Ordenar</span>
                      </button>

                      {showSort && (
                        <>
                          <div 
                            className="sort-modal-backdrop" 
                            onClick={() => setShowSort(false)}
                          />
                          <div className="sort-modal">
                            <div className="sort-modal-header">
                              <ArrowUpDown size={18} />
                              <h4>Ordenar por</h4>
                            </div>
                            <div className="sort-options">
                              <button
                                className={`sort-option ${sortOption === 'date-asc' ? 'active' : ''}`}
                                onClick={() => {
                                  setSortOption('date-asc');
                                  setShowSort(false);
                                }}
                              >
                                <div className="sort-option-icon">
                                  <TrendingUp size={14} />
                                </div>
                                <span className="sort-option-text">Fecha: Más reciente</span>
                              </button>
                              <button
                                className={`sort-option ${sortOption === 'date-desc' ? 'active' : ''}`}
                                onClick={() => {
                                  setSortOption('date-desc');
                                  setShowSort(false);
                                }}
                              >
                                <div className="sort-option-icon">
                                  <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} />
                                </div>
                                <span className="sort-option-text">Fecha: Más antiguo</span>
                              </button>
                              <button
                                className={`sort-option ${sortOption === 'league-asc' ? 'active' : ''}`}
                                onClick={() => {
                                  setSortOption('league-asc');
                                  setShowSort(false);
                                }}
                              >
                                <div className="sort-option-icon">
                                  <Trophy size={14} />
                                </div>
                                <span className="sort-option-text">Liga: A-Z</span>
                              </button>
                              <button
                                className={`sort-option ${sortOption === 'league-desc' ? 'active' : ''}`}
                                onClick={() => {
                                  setSortOption('league-desc');
                                  setShowSort(false);
                                }}
                              >
                                <div className="sort-option-icon">
                                  <Trophy size={14} />
                                </div>
                                <span className="sort-option-text">Liga: Z-A</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Filter Button */}
                    <button 
                      className="filter-toggle-btn"
                      onClick={() => setShowFilters(true)}
                    >
                      <Filter size={16} />
                      <span>Filtrar</span>
                    </button>
                  </div>
                </div>

                {/* Filtros Modal (Side Panel) */}
                {showFilters && (
                  <>
                    <div 
                      className="filters-modal-backdrop"
                      onClick={() => setShowFilters(false)}
                    />
                    <div className="filters-modal">
                      <div className="filters-modal-header">
                        <div className="filters-modal-title">
                          <Filter size={22} />
                          <h3>Filtrar</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="filters-reset-btn"
                            onClick={() => setLeagueFilter('all')}
                          >
                            Reset
                          </button>
                          <button 
                            className="filters-close-btn"
                            onClick={() => setShowFilters(false)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="filters-modal-body">
                        {/* Categoría: Región */}
                        <div className="filter-category">
                          <div className="filter-category-header">
                            <span className="filter-category-title">Categoría</span>
                            <button className="view-all-link">
                              Ver todas <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            </button>
                          </div>
                          <div className="filter-pills">
                            {leagueCategories.slice(0, 7).map((category) => {
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
                                  className={`filter-pill ${leagueFilter === category.id ? 'active' : ''}`}
                                  onClick={() => {
                                    setLeagueFilter(category.id);
                                    setShowFilters(false);
                                  }}
                                >
                                  <span className="filter-pill-icon">{category.icon}</span>
                                  <span>{category.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Categoría: Más regiones */}
                        <div className="filter-category">
                          <div className="filter-category-header">
                            <span className="filter-category-title">Más regiones</span>
                          </div>
                          <div className="filter-pills">
                            {leagueCategories.slice(7).map((category) => {
                              const categoryMatches = matches.filter(m => 
                                m.status === "pending" &&
                                category.leagues.some(league =>
                                  m.league.toLowerCase().includes(league.toLowerCase())
                                )
                              );

                              return (
                                <button
                                  key={category.id}
                                  className={`filter-pill ${leagueFilter === category.id ? 'active' : ''}`}
                                  onClick={() => {
                                    setLeagueFilter(category.id);
                                    setShowFilters(false);
                                  }}
                                >
                                  <span className="filter-pill-icon">{category.icon}</span>
                                  <span>{category.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
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
                        <X size={12} />
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
                          ? 'Sin partidos'
                          : `Sin partidos de ${leagueCategories.find(c => c.id === leagueFilter)?.name}`
                        }
                      </div>
                      {leagueFilter !== 'all' && (
                        <button 
                          className="show-all-btn"
                          onClick={() => setLeagueFilter('all')}
                        >
                          Ver todos
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
                  <div className="matches-header-actions">
                    <div className="matches-badge">
                      <Trophy size={14} />
                      <span>{activeLeagues.length} disponibles</span>
                    </div>
                  </div>
                </div>

                <div className="matches-container">
                  {leagues.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🏆</div>
                      <div className="matches-empty-text">Sin ligas</div>
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
                  <div className="matches-header-actions">
                    <div className="matches-badge">
                      <Trophy size={14} />
                      <span>{activeAwards.length} disponibles</span>
                    </div>
                  </div>
                </div>

                <div className="matches-container">
                  {awards.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🥇</div>
                      <div className="matches-empty-text">Sin premios</div>
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