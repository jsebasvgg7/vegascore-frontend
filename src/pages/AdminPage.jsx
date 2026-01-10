// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, CheckCircle, Trophy, Target, Award, 
  Zap, Package, Search, TrendingUp, Clock, Calendar, Edit2
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useMatches } from '../hooks/useMatches';
import AdminModal from '../components/AdminModal';
import AdminLeagueModal from '../components/adminComponents/AdminLeagueModal';
import AdminAwardModal from '../components/adminComponents/AdminAwardModal';
import FinishMatchModal from '../components/adminComponents/FinishMatchModal';
import AdminAchievementsModal from '../components/adminComponents/AdminAchievementsModal';
import Footer from '../components/Footer';
import AdminTitlesModal from '../components/adminComponents/AdminTitlesModal';
import FinishLeagueModal from '../components/adminComponents/FinishLeagueModal';
import FinishAwardModal from '../components/adminComponents/FinishAwardModal';
import { ToastContainer, useToast } from '../components/Toast';
import '../styles/adminStyles/AdminPage.css';

export default function AdminPage({ currentUser, onBack }) {
  const [activeSection, setActiveSection] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modales
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [itemToFinish, setItemToFinish] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const toast = useToast();
  const { finishMatch } = useMatches(currentUser);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchData, leagueData, awardData, achievementData, titleData] = await Promise.all([
        supabase.from('matches').select('*, predictions(*)'),
        supabase.from('leagues').select('*, league_predictions(*)'),
        supabase.from('awards').select('*, award_predictions(*)'),
        supabase.from('available_achievements').select('*'),
        supabase.from('available_titles').select('*')
      ]);

      setMatches(matchData.data || []);
      setLeagues(leagueData.data || []);
      setAwards(awardData.data || []);
      setAchievements(achievementData.data || []);
      setTitles(titleData.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddMatch = async (match) => {
    try {
      const { error } = await supabase.from('matches').insert(match);
      if (error) throw error;
      await loadData();
      toast.success(`✅ Partido agregado`, 3000);
      setShowMatchModal(false);
    } catch (err) {
      console.error('Error adding match:', err);
      toast.error('❌ Error al agregar el partido');
    }
  };

  const handleFinishMatch = async (matchId, homeScore, awayScore) => {
    try {
      await finishMatch(
        matchId,
        homeScore,
        awayScore,
        async () => {
          await loadData();
          toast.success(`⚽ Partido finalizado`, 3000);
          setShowFinishMatchModal(false);
          setItemToFinish(null);
        },
        (error) => {
          toast.error(`❌ ${error}`);
          throw new Error(error);
        }
      );
    } catch (err) {
      console.error('Error finishing match:', err);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!confirm('¿Eliminar este partido?')) return;
    try {
      const { error } = await supabase.from('matches').delete().eq('id', matchId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Partido eliminado', 2000);
    } catch (err) {
      console.error('Error deleting match:', err);
      toast.error('❌ Error al eliminar');
    }
  };

  const handleAddLeague = async (league) => {
    try {
      const { error } = await supabase.from('leagues').insert(league);
      if (error) throw error;
      await loadData();
      toast.success(`🏆 Liga agregada`, 3000);
      setShowLeagueModal(false);
    } catch (err) {
      console.error('Error adding league:', err);
      toast.error('❌ Error al agregar liga');
    }
  };

  const handleFinishLeague = async (leagueId, results) => {
    try {
      await supabase.from('leagues').update({ status: 'finished', ...results }).eq('id', leagueId);
      await loadData();
      toast.success('🏆 Liga finalizada', 3000);
      setShowFinishLeagueModal(false);
      setItemToFinish(null);
    } catch (err) {
      console.error('Error finishing league:', err);
      toast.error('❌ Error al finalizar liga');
    }
  };

  const handleDeleteLeague = async (leagueId) => {
    if (!confirm('¿Eliminar esta liga?')) return;
    try {
      const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Liga eliminada', 2000);
    } catch (err) {
      console.error('Error deleting league:', err);
      toast.error('❌ Error al eliminar');
    }
  };

  const handleAddAward = async (award) => {
    try {
      const { error } = await supabase.from('awards').insert(award);
      if (error) throw error;
      await loadData();
      toast.success(`🏅 Premio agregado`, 3000);
      setShowAwardModal(false);
    } catch (err) {
      console.error('Error adding award:', err);
      toast.error('❌ Error al agregar premio');
    }
  };

  const handleFinishAward = async (awardId, winner) => {
    try {
      await supabase.from('awards').update({ status: 'finished', winner }).eq('id', awardId);
      await loadData();
      toast.success(`🏅 Premio finalizado`, 3000);
      setShowFinishAwardModal(false);
      setItemToFinish(null);
    } catch (err) {
      console.error('Error finishing award:', err);
      toast.error('❌ Error al finalizar premio');
    }
  };

  const handleDeleteAward = async (awardId) => {
    if (!confirm('¿Eliminar este premio?')) return;
    try {
      const { error } = await supabase.from('awards').delete().eq('id', awardId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Premio eliminado', 2000);
    } catch (err) {
      console.error('Error deleting award:', err);
      toast.error('❌ Error al eliminar');
    }
  };

  const handleSaveAchievement = async (achievement) => {
    try {
      const { error } = await supabase.from('available_achievements').upsert(achievement, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success(`⭐ Logro guardado`, 2000);
      setShowAchievementModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving achievement:', err);
      toast.error('❌ Error al guardar');
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    try {
      const { error } = await supabase.from('available_achievements').delete().eq('id', achievementId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Logro eliminado', 2000);
      setShowAchievementModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error deleting achievement:', err);
      toast.error('❌ Error al eliminar');
    }
  };

  const handleSaveTitle = async (title) => {
    try {
      const { error } = await supabase.from('available_titles').upsert(title, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success(`👑 Título guardado`, 2000);
      setShowTitleModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving title:', err);
      toast.error('❌ Error al guardar');
    }
  };

  const handleDeleteTitle = async (titleId) => {
    try {
      const { error } = await supabase.from('available_titles').delete().eq('id', titleId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Título eliminado', 2000);
      setShowTitleModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error deleting title:', err);
      toast.error('❌ Error al eliminar');
    }
  };

  const getFilteredItems = () => {
    let items = [];
    switch(activeSection) {
      case 'matches': items = matches; break;
      case 'leagues': items = leagues; break;
      case 'awards': items = awards; break;
      case 'achievements': items = achievements; break;
      case 'titles': items = titles; break;
      default: items = [];
    }

    if (searchTerm) {
      items = items.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all' && ['matches', 'leagues', 'awards'].includes(activeSection)) {
      items = items.filter(item => item.status === filterStatus);
    }

    return items;
  };

  const stats = {
    matches: { total: matches.length, pending: matches.filter(m => m.status === 'pending').length },
    leagues: { total: leagues.length, active: leagues.filter(l => l.status === 'active').length },
    awards: { total: awards.length, active: awards.filter(a => a.status === 'active').length },
    achievements: { total: achievements.length },
    titles: { total: titles.length }
  };

  const sections = [
    { id: 'matches', label: 'Partidos', icon: Target, count: stats.matches.pending },
    { id: 'leagues', label: 'Ligas', icon: Trophy, count: stats.leagues.active },
    { id: 'awards', label: 'Premios', icon: Award, count: stats.awards.active },
    { id: 'achievements', label: 'Logros', icon: Zap, count: null },
    { id: 'titles', label: 'Títulos', icon: Package, count: null }
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-container">
          {/* Header con Stats */}
          <div className="admin-header">
            <div className="admin-stats">
              <div className="stat-item">
                <Target className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{stats.matches.total}</span>
                  <span className="stat-label">Partidos</span>
                </div>
              </div>
              <div className="stat-item">
                <Trophy className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{stats.leagues.total}</span>
                  <span className="stat-label">Ligas</span>
                </div>
              </div>
              <div className="stat-item">
                <Award className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{stats.awards.total}</span>
                  <span className="stat-label">Premios</span>
                </div>
              </div>
              <div className="stat-item">
                <TrendingUp className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{stats.achievements.total + stats.titles.total}</span>
                  <span className="stat-label">Sistema</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="admin-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon size={18} />
                <span>{section.label}</span>
                {section.count > 0 && <span className="badge">{section.count}</span>}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="admin-controls">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder={`Buscar...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {['matches', 'leagues', 'awards'].includes(activeSection) && (
              <div className="filter-chips">
                <button 
                  className={`chip ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </button>
                <button 
                  className={`chip ${filterStatus === 'pending' || filterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => setFilterStatus(activeSection === 'matches' ? 'pending' : 'active')}
                >
                  Activos
                </button>
                <button 
                  className={`chip ${filterStatus === 'finished' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('finished')}
                >
                  Finalizados
                </button>
              </div>
            )}

            <button 
              className="add-btn"
              onClick={() => {
                if (activeSection === 'matches') setShowMatchModal(true);
                if (activeSection === 'leagues') setShowLeagueModal(true);
                if (activeSection === 'awards') setShowAwardModal(true);
                if (activeSection === 'achievements') setShowAchievementModal(true);
                if (activeSection === 'titles') setShowTitleModal(true);
              }}
            >
              <Plus size={18} />
              <span>Agregar</span>
            </button>
          </div>

          {/* Content */}
          <div className="admin-content">
            {activeSection === 'matches' && (
              <div className="items-grid">
                {getFilteredItems().map(match => (
                  <div key={match.id} className="item-card">
                    <div className="card-top">
                      <div className="card-info">
                        <span className="card-league">{match.league}</span>
                        <h3 className="card-title">
                          {match.home_team_logo} {match.home_team} vs {match.away_team} {match.away_team_logo}
                        </h3>
                        <div className="card-meta">
                          <Calendar size={12} />
                          <span>{match.date}</span>
                          <Clock size={12} />
                          <span>{match.time}</span>
                        </div>
                      </div>
                      <span className={`status ${match.status}`}>
                        {match.status === 'pending' ? 'Pendiente' : 'Finalizado'}
                      </span>
                    </div>
                    <div className="card-actions">
                      {match.status === 'pending' && (
                        <button 
                          className="btn-finish"
                          onClick={() => {
                            setItemToFinish(match);
                            setShowFinishMatchModal(true);
                          }}
                        >
                          <CheckCircle size={14} />
                          Finalizar
                        </button>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteMatch(match.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'leagues' && (
              <div className="items-grid">
                {getFilteredItems().map(league => (
                  <div key={league.id} className="item-card">
                    <div className="card-top">
                      <div className="card-info">
                        <h3 className="card-title">{league.logo} {league.name}</h3>
                        <p className="card-subtitle">{league.season}</p>
                      </div>
                      <span className={`status ${league.status}`}>
                        {league.status === 'active' ? 'Activa' : 'Finalizada'}
                      </span>
                    </div>
                    <div className="card-actions">
                      {league.status === 'active' && (
                        <button 
                          className="btn-finish"
                          onClick={() => {
                            setItemToFinish(league);
                            setShowFinishLeagueModal(true);
                          }}
                        >
                          <CheckCircle size={14} />
                          Finalizar
                        </button>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteLeague(league.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'awards' && (
              <div className="items-grid">
                {getFilteredItems().map(award => (
                  <div key={award.id} className="item-card">
                    <div className="card-top">
                      <div className="card-info">
                        <h3 className="card-title">{award.logo} {award.name}</h3>
                        <p className="card-subtitle">{award.season}</p>
                      </div>
                      <span className={`status ${award.status}`}>
                        {award.status === 'active' ? 'Activo' : 'Finalizado'}
                      </span>
                    </div>
                    <div className="card-actions">
                      {award.status === 'active' && (
                        <button 
                          className="btn-finish"
                          onClick={() => {
                            setItemToFinish(award);
                            setShowFinishAwardModal(true);
                          }}
                        >
                          <CheckCircle size={14} />
                          Finalizar
                        </button>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteAward(award.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'achievements' && (
              <div className="items-grid">
                {getFilteredItems().map(achievement => (
                  <div key={achievement.id} className="item-card">
                    <div className="card-top">
                      <div className="card-info">
                        <h3 className="card-title">{achievement.icon} {achievement.name}</h3>
                        <p className="card-subtitle">{achievement.description}</p>
                        <span className="card-badge">{achievement.category}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => {
                          setEditingItem(achievement);
                          setShowAchievementModal(true);
                        }}
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteAchievement(achievement.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'titles' && (
              <div className="items-grid">
                {getFilteredItems().map(title => (
                  <div key={title.id} className="item-card">
                    <div className="card-top">
                      <div className="card-info">
                        <h3 className="card-title" style={{ color: title.color }}>{title.name}</h3>
                        <p className="card-subtitle">{title.description}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => {
                          setEditingItem(title);
                          setShowTitleModal(true);
                        }}
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteTitle(title.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {getFilteredItems().length === 0 && (
              <div className="empty-state">
                <p>No hay {activeSection} disponibles</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Modales */}
      {showMatchModal && <AdminModal onAdd={handleAddMatch} onClose={() => setShowMatchModal(false)} />}
      {showLeagueModal && <AdminLeagueModal onAdd={handleAddLeague} onClose={() => setShowLeagueModal(false)} />}
      {showAwardModal && <AdminAwardModal onAdd={handleAddAward} onClose={() => setShowAwardModal(false)} />}
      {showAchievementModal && (
        <AdminAchievementsModal
          onClose={() => { setShowAchievementModal(false); setEditingItem(null); }}
          onSave={handleSaveAchievement}
          onDelete={handleDeleteAchievement}
          existingAchievement={editingItem}
        />
      )}
      {showTitleModal && (
        <AdminTitlesModal
          onClose={() => { setShowTitleModal(false); setEditingItem(null); }}
          onSave={handleSaveTitle}
          onDelete={handleDeleteTitle}
          existingTitle={editingItem}
        />
      )}
      {showFinishMatchModal && itemToFinish && (
        <FinishMatchModal 
          match={itemToFinish}
          onFinish={handleFinishMatch}
          onClose={() => { setShowFinishMatchModal(false); setItemToFinish(null); }}
        />
      )}
      {showFinishLeagueModal && itemToFinish && (
        <FinishLeagueModal 
          league={itemToFinish}
          onFinish={handleFinishLeague}
          onClose={() => { setShowFinishLeagueModal(false); setItemToFinish(null); }}
        />
      )}
      {showFinishAwardModal && itemToFinish && (
        <FinishAwardModal 
          award={itemToFinish}
          onFinish={handleFinishAward}
          onClose={() => { setShowFinishAwardModal(false); setItemToFinish(null); }}
        />
      )}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}