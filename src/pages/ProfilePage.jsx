import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Trophy, TrendingUp, Target, Flame, 
  Star, Award, Edit2, Save, X, ArrowLeft, Activity, Percent,
  CheckCircle2, XCircle, Clock, Medal, Globe, Heart, Zap,
  Crown, Shield, Rocket, Sparkles, BarChart3,
  Gamepad2, Users, MapPin, Flag, Layers, BadgeCheck, Gem,
  CheckCircle, TrendingDown, ChevronRight, Grid3x3, List
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import AvatarUpload from '../components/AvatarUpload';
import AdminAchievementsModal from '../components/adminComponents/AdminAchievementsModal';
import AdminTitlesModal from '../components/adminComponents/AdminTitlesModal';
import { ToastContainer, useToast } from '../components/Toast';
import Footer from '../components/Footer';
import '../styles/pagesStyles/ProfilePage.css';

export default function ProfilePage({ currentUser, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const toast = useToast();
  
  const [userData, setUserData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    favorite_team: currentUser?.favorite_team || '',
    favorite_player: currentUser?.favorite_player || '',
    gender: currentUser?.gender || '',
    nationality: currentUser?.nationality || '',
    avatar_url: currentUser?.avatar_url || null,
    level: currentUser?.level || 1,
    joined_date: currentUser?.created_at || new Date().toISOString()
  });
  
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    best_streak: 0,
    last_prediction_date: null
  });

  const [userAchievements, setUserAchievements] = useState([]);
  const [userTitles, setUserTitles] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [availableTitles, setAvailableTitles] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [showAdminAchievementsModal, setShowAdminAchievementsModal] = useState(false);
  const [showAdminTitlesModal, setShowAdminTitlesModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [userRanking, setUserRanking] = useState({
    position: 0,
    totalUsers: 0,
    pointsToNext: 0,
    pointsToLeader: 0,
    pointsFromPrev: 0
  });

  const profileTabs = [
    { id: 'overview', label: 'Resumen', icon: Grid3x3 },
    { id: 'achievements', label: 'Logros', icon: Trophy },
    { id: 'history', label: 'Historial', icon: List },
    { id: 'edit', label: 'Editar', icon: Edit2 }
  ];

  useEffect(() => {
    loadUserData();
    loadPredictionHistory();
    calculateStreaks();
  }, [currentUser]);

  useEffect(() => {
    const loadAchievementsAndTitles = async () => {
      if (!currentUser) return;
      
      try {
        setAchievementsLoading(true);
        
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('available_achievements')
          .select('*')
          .order('requirement_value', { ascending: true });

        if (achievementsError) throw achievementsError;
        setAvailableAchievements(achievementsData || []);

        const { data: titlesData, error: titlesError } = await supabase
          .from('available_titles')
          .select('*');

        if (titlesError) throw titlesError;
        setAvailableTitles(titlesData || []);

        const calculatedAchievements = calculateAchievements(
          achievementsData || [],
          {
            points: currentUser?.points || 0,
            predictions: currentUser?.predictions || 0,
            correct: currentUser?.correct || 0,
            current_streak: streakData.current_streak
          }
        );
        setUserAchievements(calculatedAchievements);

        const calculatedTitles = calculateTitles(
          titlesData || [],
          calculatedAchievements
        );
        setUserTitles(calculatedTitles);

      } catch (err) {
        console.error('Error loading achievements:', err);
      } finally {
        setAchievementsLoading(false);
      }
    };

    if (currentUser) {
      loadAchievementsAndTitles();
    }
  }, [currentUser, streakData]);

  useEffect(() => {
    const loadUserRanking = async () => {
      try {
        const { data: allUsers, error } = await supabase
          .from('users')
          .select('id, points')
          .order('points', { ascending: false });

        if (error) throw error;
        if (!allUsers || allUsers.length === 0) return;

        const userIndex = allUsers.findIndex(user => user.id === currentUser?.id);
        const userPosition = userIndex !== -1 ? userIndex + 1 : 0;

        const leaderPoints = allUsers[0]?.points || 0;
        const userPoints = currentUser?.points || 0;
        const nextUser = userIndex > 0 ? allUsers[userIndex - 1] : null;
        const prevUser = userIndex < allUsers.length - 1 ? allUsers[userIndex + 1] : null;

        setUserRanking({
          position: userPosition,
          totalUsers: allUsers.length,
          pointsToLeader: leaderPoints - userPoints,
          pointsToNext: nextUser ? userPoints - nextUser.points : 0,
          pointsFromPrev: prevUser ? prevUser.points - userPoints : 0
        });

      } catch (err) {
        console.error('Error loading ranking:', err);
      }
    };

    if (currentUser?.id) {
      loadUserRanking();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setUserData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          favorite_team: data.favorite_team || '',
          favorite_player: data.favorite_player || '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          avatar_url: data.avatar_url || null,
          level: data.level || 1,
          joined_date: data.created_at
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadPredictionHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            id,
            league,
            home_team,
            away_team,
            home_team_logo,
            away_team_logo,
            result_home,
            result_away,
            status,
            date,
            time
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictionHistory(data || []);
    } catch (err) {
      console.error('Error loading prediction history:', err);
      toast.error('Error al cargar el historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  const calculateStreaks = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            result_home,
            result_away,
            status,
            date
          )
        `)
        .eq('user_id', currentUser.id)
        .eq('matches.status', 'finished')
        .order('matches.date', { ascending: false });

      if (error) throw error;

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      const finishedPredictions = (data || [])
        .filter(p => p.matches?.status === 'finished')
        .sort((a, b) => new Date(b.matches.date) - new Date(a.matches.date));

      finishedPredictions.forEach((pred, index) => {
        const match = pred.matches;
        const isCorrect = checkPredictionCorrect(pred, match);

        if (index === 0) lastDate = match.date;

        if (isCorrect) {
          tempStreak++;
          if (index === 0 || isConsecutive(finishedPredictions[index - 1]?.matches.date, match.date)) {
            currentStreak = tempStreak;
          }
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
          if (index === 0) currentStreak = 0;
        }
      });

      setStreakData({
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_prediction_date: lastDate
      });
    } catch (err) {
      console.error('Error calculating streaks:', err);
    }
  };

  const isConsecutive = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const checkPredictionCorrect = (prediction, match) => {
    if (match.result_home === null || match.result_away === null) return false;
    
    const predDiff = Math.sign(prediction.home_score - prediction.away_score);
    const resultDiff = Math.sign(match.result_home - match.result_away);
    
    return predDiff === resultDiff || 
           (prediction.home_score === match.result_home && prediction.away_score === match.result_away);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          bio: userData.bio,
          favorite_team: userData.favorite_team,
          favorite_player: userData.favorite_player,
          gender: userData.gender,
          nationality: userData.nationality
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('¡Perfil actualizado con éxito!');
      setActiveTab('overview');
      
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (newUrl) => {
    setUserData({ ...userData, avatar_url: newUrl });
    toast.success('¡Avatar actualizado con éxito!');
  };

  const getPredictionResult = (pred) => {
    if (!pred.matches || pred.matches.status !== 'finished') {
      return { status: 'pending', points: 0, label: 'Pendiente' };
    }

    const match = pred.matches;
    const exactMatch = pred.home_score === match.result_home && pred.away_score === match.result_away;
    const resultCorrect = Math.sign(pred.home_score - pred.away_score) === Math.sign(match.result_home - match.result_away);

    if (exactMatch) {
      return { status: 'exact', points: 5, label: 'Resultado Exacto' };
    } else if (resultCorrect) {
      return { status: 'correct', points: 3, label: 'Resultado Acertado' };
    } else {
      return { status: 'wrong', points: 0, label: 'Fallado' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateAchievements = (availableAchievements, userStats) => {
    if (!availableAchievements || !userStats) return [];

    return availableAchievements.filter(achievement => {
      switch (achievement.requirement_type) {
        case 'points':
          return userStats.points >= achievement.requirement_value;
        case 'predictions':
          return userStats.predictions >= achievement.requirement_value;
        case 'correct':
          return userStats.correct >= achievement.requirement_value;
        case 'streak':
          return userStats.current_streak >= achievement.requirement_value;
        default:
          return false;
      }
    });
  };

  const calculateTitles = (availableTitles, userAchievements) => {
    if (!availableTitles || !userAchievements) return [];
    
    return availableTitles.filter(title => {
      const requiredAchievementId = title.requirement_achievement_id;
      return userAchievements.some(achievement => achievement.id === requiredAchievementId);
    });
  };

  const getActiveTitle = () => {
    if (userTitles.length === 0) return null;
    
    const sortedTitles = [...userTitles].sort((a, b) => {
      const order = ['leyenda', 'oráculo', 'visionario', 'pronosticador', 'novato'];
      return order.indexOf(b.id) - order.indexOf(a.id);
    });
    
    return sortedTitles[0];
  };

  const getIconEmoji = (iconText) => {
    const emojiMap = {
      '🎯': '🎯', '🌟': '🌟', '⭐': '⭐', '✨': '✨',
      '💫': '💫', '🎪': '🎪', '🎭': '🎭', '🎨': '🎨',
      '🔥': '🔥', '🌋': '🌋', '☄️': '☄️'
    };
    return emojiMap[iconText] || '';
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Inicio': return '#8B5CF6';
      case 'Progreso': return '#3B82F6';
      case 'Precisión': return '#10B981';
      case 'Racha': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  const handleSaveAchievement = async (achievementData) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .upsert(achievementData, { onConflict: 'id' });

      if (error) throw error;

      toast.success('¡Logro guardado exitosamente!');
      
      const { data } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
      setAvailableAchievements(data || []);
    } catch (err) {
      console.error('Error saving achievement:', err);
      toast.error('Error al guardar el logro');
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', achievementId);

      if (error) throw error;

      toast.success('¡Logro eliminado correctamente!');
      
      const { data } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
      setAvailableAchievements(data || []);
    } catch (err) {
      console.error('Error deleting achievement:', err);
      toast.error('Error al eliminar el logro');
    }
  };

  const handleSaveTitle = async (titleData) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .upsert(titleData, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Título guardado correctamente');
      
      const { data } = await supabase
        .from('available_titles')
        .select('*');
      setAvailableTitles(data || []);
    } catch (err) {
      console.error('Error saving title:', err);
      toast.error('Error al guardar el título');
    }
  };

  const handleDeleteTitle = async (titleId) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', titleId);

      if (error) throw error;

      toast.success('Título eliminado correctamente');
      
      const { data } = await supabase
        .from('available_titles')
        .select('*');
      setAvailableTitles(data || []);
    } catch (err) {
      console.error('Error deleting title:', err);
      toast.error('Error al eliminar el título');
    }
  };

  const accuracy = currentUser?.predictions > 0 
    ? Math.round((currentUser.correct / currentUser.predictions) * 100) 
    : 0;

  const currentLevelPoints = (userData.level - 1) * 20;
  const nextLevelPoints = userData.level * 20;
  const currentPoints = currentUser?.points || 0;
  const pointsInLevel = currentPoints - currentLevelPoints;
  const pointsToNextLevel = nextLevelPoints - currentPoints;
  const levelProgress = (pointsInLevel / 20) * 100;

  const activeTitle = getActiveTitle();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content-wrapper">
            {/* Stats Cards */}
            <div className="stats-cards-grid">
              <div className="stat-card-modern predictions">
                <div className="stat-card-icon">
                  <Target size={20} />
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-value">{currentUser?.predictions || 0}</div>
                  <div className="stat-card-label">Predicciones</div>
                </div>
              </div>

              <div className="stat-card-modern points">
                <div className="stat-card-icon">
                  <Zap size={20} />
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-value">{currentUser?.points || 0}</div>
                  <div className="stat-card-label">Puntos</div>
                </div>
              </div>

              <div className="stat-card-modern accuracy">
                <div className="stat-card-icon">
                  <BarChart3 size={20} />
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-value">{accuracy}%</div>
                  <div className="stat-card-label">Precisión</div>
                </div>
              </div>
            </div>

            {/* Level Card */}
            <div className="level-card-modern">
              <div className="level-card-header">
                <div className="level-icon-wrapper">
                  <Zap size={20} />
                </div>
                <div className="level-info">
                  <div className="level-number">Nivel {userData.level}</div>
                  <div className="level-subtitle">{pointsInLevel} de 20 puntos</div>
                </div>
                <div className="points-to-next">{pointsToNextLevel} pts</div>
              </div>
              <div className="level-progress-bar">
                <div className="level-progress-fill" style={{ width: `${levelProgress}%` }}></div>
              </div>
            </div>

            {/* Ranking */}
            <div className="ranking-card-modern">
              <div className="ranking-card-header">
                <Trophy size={20} />
                <span>Ranking Global</span>
              </div>
              <div className="ranking-position-display">
                <div className="position-large">#{userRanking.position || '--'}</div>
                <div className="position-context">de {userRanking.totalUsers} jugadores</div>
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="tab-content-wrapper">
            {/* Active Title */}
            {activeTitle && (
              <div className="active-title-card" style={{ borderColor: activeTitle.color }}>
                <div className="title-icon-large" style={{ background: `${activeTitle.color}15` }}>
                  <Gem size={24} style={{ color: activeTitle.color }} />
                </div>
                <div className="title-card-info">
                  <div className="title-card-name" style={{ color: activeTitle.color }}>{activeTitle.name}</div>
                  <div className="title-card-desc">{activeTitle.description}</div>
                </div>
              </div>
            )}

            {/* Titles Section */}
            <div className="section-modern">
              <div className="section-header-modern">
                <Layers size={18} />
                <h3>Títulos</h3>
                <span className="count-badge-modern">{userTitles.length}</span>
              </div>
              
              {achievementsLoading ? (
                <div className="loading-state">
                  <Activity size={24} className="spinner" />
                </div>
              ) : userTitles.length === 0 ? (
                <div className="empty-state">
                  <Shield size={32} />
                  <p>Aún no has obtenido títulos</p>
                </div>
              ) : (
                <div className="titles-list">
                  {userTitles.map((title) => (
                    <div key={title.id} className="title-list-item" style={{ borderLeftColor: title.color }}>
                      <div className="title-item-icon" style={{ color: title.color }}>
                        <Crown size={18} />
                      </div>
                      <div className="title-item-content">
                        <div className="title-item-name" style={{ color: title.color }}>{title.name}</div>
                        <div className="title-item-desc">{title.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Section */}
            <div className="section-modern">
              <div className="section-header-modern">
                <Award size={18} />
                <h3>Logros</h3>
                <span className="count-badge-modern">{userAchievements.length}/{availableAchievements.length}</span>
              </div>
              
              {achievementsLoading ? (
                <div className="loading-state">
                  <Activity size={24} className="spinner" />
                </div>
              ) : userAchievements.length === 0 ? (
                <div className="empty-state">
                  <Target size={32} />
                  <p>Comienza a hacer predicciones para desbloquear logros</p>
                </div>
              ) : (
                <div className="achievements-grid-modern">
                  {userAchievements.map((achievement) => (
                    <div key={achievement.id} className="achievement-card-modern">
                      <div className="achievement-emoji-icon">{getIconEmoji(achievement.icon)}</div>
                      <div className="achievement-card-content">
                        <div className="achievement-card-name">{achievement.name}</div>
                        <div className="achievement-card-desc">{achievement.description}</div>
                        <div className="achievement-category-badge" style={{ background: `${getCategoryColor(achievement.category)}15`, color: getCategoryColor(achievement.category) }}>
                          {achievement.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="tab-content-wrapper">
            {historyLoading ? (
              <div className="loading-state large">
                <Activity size={32} className="spinner" />
                <p>Cargando historial...</p>
              </div>
            ) : predictionHistory.length === 0 ? (
              <div className="empty-state large">
                <Gamepad2 size={48} />
                <p>Aún no has hecho predicciones</p>
                <span className="empty-subtitle">¡Comienza a predecir resultados!</span>
              </div>
            ) : (
              <div className="history-list-modern">
                {predictionHistory.map((pred) => {
                  const result = getPredictionResult(pred);
                  const match = pred.matches;

                  return (
                    <div key={pred.id} className={`history-card-modern ${result.status}`}>
                      <div className="history-card-header">
                        <span className="league-badge-modern">{match?.league}</span>
                        <span className="match-date-modern">{match?.date}</span>
                      </div>
                      
                      <div className="teams-display">
                        <div className="team-display">
                          <span className="team-logo-modern">{match?.home_team_logo}</span>
                          <span className="team-name-modern">{match?.home_team}</span>
                        </div>
                        <div className="vs-divider">VS</div>
                        <div className="team-display">
                          <span className="team-name-modern">{match?.away_team}</span>
                          <span className="team-logo-modern">{match?.away_team_logo}</span>
                        </div>
                      </div>

                      <div className="scores-display">
                        <div className="score-section">
                          <span className="score-label-modern">Tu predicción</span>
                          <span className="score-value-modern">{pred.home_score} - {pred.away_score}</span>
                        </div>
                        
                        {match?.status === 'finished' && (
                          <div className="score-section">
                            <span className="score-label-modern">Resultado</span>
                            <span className="score-value-modern">{match.result_home} - {match.result_away}</span>
                          </div>
                        )}
                      </div>

                      <div className={`result-badge-modern ${result.status}`}>
                        {result.status === 'exact' && <CheckCircle2 size={16} />}
                        {result.status === 'correct' && <CheckCircle2 size={16} />}
                        {result.status === 'wrong' && <XCircle size={16} />}
                        {result.status === 'pending' && <Clock size={16} />}
                        <span>{result.label}</span>
                        {result.points > 0 && <span className="points-earned">+{result.points}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'edit':
        return (
          <div className="tab-content-wrapper">
            <div className="section-header-modern">
              <Edit2 size={18} />
              <h3>Editar Perfil</h3>
            </div>

            <div className="edit-avatar-wrapper">
              <AvatarUpload
                currentUrl={userData.avatar_url}
                userId={currentUser.id}
                onUploadComplete={handleAvatarUpload}
                userLevel={userData.level}
              />
            </div>

            <div className="edit-form-modern">
              <div className="form-group-modern">
                <label className="form-label-modern">
                  <User size={16} />
                  <span>Nombre Completo</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <Trophy size={16} />
                  <span>Equipo Favorito</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.favorite_team}
                  onChange={(e) => setUserData({ ...userData, favorite_team: e.target.value })}
                  placeholder="Ej: Real Madrid"
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <Heart size={16} />
                  <span>Jugador Favorito</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.favorite_player}
                  onChange={(e) => setUserData({ ...userData, favorite_player: e.target.value })}
                  placeholder="Ej: Lionel Messi"
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <User size={16} />
                  <span>Género</span>
                </label>
                <select
                  className="form-select-modern"
                  value={userData.gender}
                  onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <Flag size={16} />
                  <span>Nacionalidad</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.nationality}
                  onChange={(e) => setUserData({ ...userData, nationality: e.target.value })}
                  placeholder="Ej: Colombia"
                />
              </div>

              <div className="form-group-modern full-width">
                <label className="form-label-modern">
                  <Star size={16} />
                  <span>Biografía</span>
                </label>
                <textarea
                  className="form-textarea-modern"
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>

              <div className="form-actions-modern">
                <button 
                  className="save-button-modern"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Activity size={16} className="spinner" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
                <button 
                  className="cancel-button-modern"
                  onClick={() => {
                    loadUserData();
                    setActiveTab('overview');
                  }}
                >
                  <X size={16} />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page-modern">
      <div className="profile-container-modern">
        {/* Avatar y Info Principal */}
        <div className="profile-hero">
          <div className="avatar-section">
            <div className="avatar-circle">
              {userData.avatar_url ? (
                <img src={userData.avatar_url} alt={userData.name} />
              ) : (
                <div className="avatar-placeholder-modern">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="level-badge-modern">
              <Crown size={12} />
              <span>{userData.level}</span>
            </div>
          </div>

          <div className="user-info-section">
            <h2 className="user-name-display">{userData.name}</h2>
            <p className="user-email-display">{userData.email}</p>
            {userData.bio && <p className="user-bio-display">{userData.bio}</p>}
            
            {(userData.favorite_team || userData.favorite_player || userData.nationality) && (
              <div className="user-tags">
                {userData.favorite_team && (
                  <span className="user-tag">
                    <Trophy size={12} /> {userData.favorite_team}
                  </span>
                )}
                {userData.favorite_player && (
                  <span className="user-tag">
                    <Heart size={12} /> {userData.favorite_player}
                  </span>
                )}
                {userData.nationality && (
                  <span className="user-tag">
                    <Globe size={12} /> {userData.nationality}
                  </span>
                )}
              </div>
            )}

            {/* Stats Mini */}
            <div className="stats-mini-row">
              <div className="stat-mini">
                <div className="stat-mini-value">{currentUser?.predictions || 0}</div>
                <div className="stat-mini-label">Predicts</div>
              </div>
              <div className="stat-mini-divider"></div>
              <div className="stat-mini">
                <div className="stat-mini-value">{currentUser?.points || 0}</div>
                <div className="stat-mini-label">Puntos</div>
              </div>
              <div className="stat-mini-divider"></div>
              <div className="stat-mini">
                <div className="stat-mini-value">{accuracy}%</div>
                <div className="stat-mini-label">Precisión</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Minimalistas */}
        <div className="profile-tabs-modern">
          {profileTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn-modern ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="profile-content-area">
          {renderTabContent()}
        </div>
      </div>

      <Footer />
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {showAdminAchievementsModal && (
        <AdminAchievementsModal
          onClose={() => {
            setShowAdminAchievementsModal(false);
            setEditingAchievement(null);
          }}
          onSave={handleSaveAchievement}
          onDelete={handleDeleteAchievement}
          existingAchievement={editingAchievement}
        />
      )}

      {showAdminTitlesModal && (
        <AdminTitlesModal
          onClose={() => {
            setShowAdminTitlesModal(false);
            setEditingTitle(null);
          }}
          onSave={handleSaveTitle}
          onDelete={handleDeleteTitle}
          existingTitle={editingTitle}
        />
      )}
    </div>
  );
}