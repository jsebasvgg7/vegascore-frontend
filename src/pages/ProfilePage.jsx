import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Trophy, TrendingUp, Target, Flame, 
  Star, Award, Edit2, Save, X, ArrowLeft, Activity, Percent,
  CheckCircle2, XCircle, Clock, Medal, Globe, Heart, Zap,
  Crown, Shield, Rocket, Sparkles, BarChart3,
  Gamepad2, Award as AwardIcon, Target as TargetIcon,
  Clock as ClockIcon, Users, MapPin, Flag, ScrollText, 
  BookOpen, Layers, BadgeCheck, Gem, Trophy as TrophyIcon,
  Zap as ZapIcon, CheckCircle, Bookmark, TrendingDown,
  BarChart as BarChartIcon, Package, Award as AwardLucide,
  Star as StarLucide, Target as TargetLucide, Home, Plus,
  Menu, ChevronRight, Grid3x3, List
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import AvatarUpload from '../components/AvatarUpload';
import AchievementsSection from '../components/AchievementsSection';
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

  // Tabs estilo Instagram
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
      '🎯': '🎯',
      '🌟': '🌟',
      '⭐': '⭐',
      '✨': '✨',
      '💫': '💫',
      '🎪': '🎪',
      '🎭': '🎭',
      '🎨': '🎨',
      '🔥': '🔥',
      '🌋': '🌋',
      '☄️': '☄️'
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

  // Renderizar contenido según tab activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            {/* Stats Grid */}
            <div className="stats-grid-compact">
              <div className="stat-box">
                <div className="stat-value">{currentUser?.predictions || 0}</div>
                <div className="stat-label">Predicciones</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{currentUser?.points || 0}</div>
                <div className="stat-label">Puntos</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{accuracy}%</div>
                <div className="stat-label">Precisión</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="level-card-compact">
              <div className="level-info-row">
                <div className="level-icon-wrapper">
                  <Zap size={20} />
                </div>
                <div className="level-text">
                  <h3>Nivel {userData.level}</h3>
                  <p>{pointsInLevel}/20 puntos • {pointsToNextLevel} para siguiente nivel</p>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${levelProgress}%` }}>
                  <div className="progress-glow"></div>
                </div>
              </div>
            </div>

            {/* Streaks */}
            <div className="streaks-compact">
              <div className="streak-box current">
                <Flame size={32} />
                <div className="streak-info">
                  <div className="streak-value">{streakData.current_streak}</div>
                  <div className="streak-label">Racha Actual</div>
                </div>
              </div>
              <div className="streak-box best">
                <Crown size={32} />
                <div className="streak-info">
                  <div className="streak-value">{streakData.best_streak}</div>
                  <div className="streak-label">Récord Personal</div>
                </div>
              </div>
            </div>

            {/* Ranking Card */}
            <div className="ranking-card-compact">
              <div className="ranking-header">
                <Trophy size={20} />
                <h3>Ranking Global</h3>
              </div>
              <div className="ranking-position">
                <span className="position-number">#{userRanking.position || '--'}</span>
                <span className="position-total">de {userRanking.totalUsers} jugadores</span>
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="tab-content">
            {/* Título Activo */}
            {activeTitle && (
              <div className="active-title-compact" style={{ borderColor: activeTitle.color }}>
                <div className="title-icon-large" style={{ color: activeTitle.color }}>
                  <Gem size={24} />
                </div>
                <div className="title-info">
                  <h4 style={{ color: activeTitle.color }}>{activeTitle.name}</h4>
                  <p>{activeTitle.description}</p>
                </div>
              </div>
            )}

            {/* Títulos */}
            <div className="section-compact">
              <div className="section-header-compact">
                <Layers size={18} />
                <h3>Títulos Obtenidos</h3>
                <span className="count-badge">{userTitles.length}</span>
              </div>
              
              {achievementsLoading ? (
                <div className="loading-compact">
                  <Activity size={24} className="spinner" />
                </div>
              ) : userTitles.length === 0 ? (
                <div className="empty-compact">
                  <Shield size={32} />
                  <p>Aún no has obtenido títulos</p>
                </div>
              ) : (
                <div className="titles-grid-compact">
                  {userTitles.map((title) => (
                    <div key={title.id} className="title-item" style={{ borderLeftColor: title.color }}>
                      <Crown size={18} style={{ color: title.color }} />
                      <div className="title-item-info">
                        <h4 style={{ color: title.color }}>{title.name}</h4>
                        <p>{title.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logros */}
            <div className="section-compact">
              <div className="section-header-compact">
                <Award size={18} />
                <h3>Logros Desbloqueados</h3>
                <span className="count-badge">{userAchievements.length}/{availableAchievements.length}</span>
              </div>
              
              {achievementsLoading ? (
                <div className="loading-compact">
                  <Activity size={24} className="spinner" />
                </div>
              ) : userAchievements.length === 0 ? (
                <div className="empty-compact">
                  <Target size={32} />
                  <p>Comienza a hacer predicciones para desbloquear logros</p>
                </div>
              ) : (
                <div className="achievements-grid-compact">
                  {userAchievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className="achievement-item"
                      style={{ borderColor: getCategoryColor(achievement.category) }}
                    >
                      <div className="achievement-emoji">{getIconEmoji(achievement.icon)}</div>
                      <div className="achievement-item-info">
                        <h4>{achievement.name}</h4>
                        <p>{achievement.description}</p>
                        <span className="achievement-category" style={{ color: getCategoryColor(achievement.category) }}>
                          {achievement.category}
                        </span>
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
          <div className="tab-content">
            <div className="section-header-compact">
              <Activity size={18} />
              <h3>Historial de Predicciones</h3>
            </div>

            {historyLoading ? (
              <div className="loading-compact">
                <Activity size={32} className="spinner" />
                <p>Cargando historial...</p>
              </div>
            ) : predictionHistory.length === 0 ? (
              <div className="empty-compact large">
                <Gamepad2 size={48} />
                <p>Aún no has hecho predicciones</p>
                <span>¡Comienza a predecir resultados!</span>
              </div>
            ) : (
              <div className="history-list-compact">
                {predictionHistory.map((pred) => {
                  const result = getPredictionResult(pred);
                  const match = pred.matches;

                  return (
                    <div key={pred.id} className={`history-item-compact ${result.status}`}>
                      <div className="match-header">
                        <span className="league-badge">{match?.league}</span>
                        <span className="match-date">{match?.date}</span>
                      </div>
                      
                      <div className="teams-row">
                        <div className="team">
                          <span className="team-logo">{match?.home_team_logo}</span>
                          <span className="team-name">{match?.home_team}</span>
                        </div>
                        <div className="vs">VS</div>
                        <div className="team">
                          <span className="team-name">{match?.away_team}</span>
                          <span className="team-logo">{match?.away_team_logo}</span>
                        </div>
                      </div>

                      <div className="scores-row">
                        <div className="score-group">
                          <span className="score-label">Tu predicción</span>
                          <span className="score-value">{pred.home_score} - {pred.away_score}</span>
                        </div>
                        
                        {match?.status === 'finished' && (
                          <div className="score-group">
                            <span className="score-label">Resultado</span>
                            <span className="score-value">{match.result_home} - {match.result_away}</span>
                          </div>
                        )}
                      </div>

                      <div className={`result-badge ${result.status}`}>
                        {result.status === 'exact' && <CheckCircle2 size={16} />}
                        {result.status === 'correct' && <CheckCircle2 size={16} />}
                        {result.status === 'wrong' && <XCircle size={16} />}
                        {result.status === 'pending' && <Clock size={16} />}
                        <span>{result.label}</span>
                        {result.points > 0 && <span className="points">+{result.points} pts</span>}
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
          <div className="tab-content">
            <div className="section-header-compact">
              <Edit2 size={18} />
              <h3>Editar Perfil</h3>
            </div>

            <div className="edit-avatar-section">
              <AvatarUpload
                currentUrl={userData.avatar_url}
                userId={currentUser.id}
                onUploadComplete={handleAvatarUpload}
                userLevel={userData.level}
              />
            </div>

            <div className="edit-form">
              <div className="form-group">
                <label>
                  <User size={16} />
                  <span>Nombre Completo</span>
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label>
                  <Trophy size={16} />
                  <span>Equipo Favorito</span>
                </label>
                <input
                  type="text"
                  value={userData.favorite_team}
                  onChange={(e) => setUserData({ ...userData, favorite_team: e.target.value })}
                  placeholder="Ej: Real Madrid"
                />
              </div>

              <div className="form-group">
                <label>
                  <Heart size={16} />
                  <span>Jugador Favorito</span>
                </label>
                <input
                  type="text"
                  value={userData.favorite_player}
                  onChange={(e) => setUserData({ ...userData, favorite_player: e.target.value })}
                  placeholder="Ej: Lionel Messi"
                />
              </div>

              <div className="form-group">
                <label>
                  <User size={16} />
                  <span>Género</span>
                </label>
                <select
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

              <div className="form-group">
                <label>
                  <Flag size={16} />
                  <span>Nacionalidad</span>
                </label>
                <input
                  type="text"
                  value={userData.nationality}
                  onChange={(e) => setUserData({ ...userData, nationality: e.target.value })}
                  placeholder="Ej: Colombia"
                />
              </div>

              <div className="form-group full-width">
                <label>
                  <Star size={16} />
                  <span>Biografía</span>
                </label>
                <textarea
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button 
                  className="save-button"
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
                  className="cancel-button"
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
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header-top">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h1>{userData.name}</h1>
        </div>

        {/* Profile Info Section */}
        <div className="profile-info-section">
          {/* Avatar y Stats en una fila */}
          <div className="profile-main-info">
            <div className="avatar-wrapper">
              <div className="avatar-large">
                {userData.avatar_url ? (
                  <img src={userData.avatar_url} alt={userData.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="level-badge-profile">
                <Crown size={12} fill="currentColor" />
                <span>Lvl {userData.level}</span>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-item-mini">
                <div className="stat-mini-value">{currentUser?.predictions || 0}</div>
                <div className="stat-mini-label">Predicciones</div>
              </div>
              <div className="stat-item-mini">
                <div className="stat-mini-value">{currentUser?.points || 0}</div>
                <div className="stat-mini-label">Puntos</div>
              </div>
              <div className="stat-item-mini">
                <div className="stat-mini-value">{accuracy}%</div>
                <div className="stat-mini-label">Precisión</div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="profile-details">
            <h2 className="profile-name">{userData.name}</h2>
            <p className="profile-email">{userData.email}</p>
            {userData.bio && <p className="profile-bio">{userData.bio}</p>}
            
            {/* Badges Compactos */}
            {(userData.favorite_team || userData.favorite_player || userData.nationality) && (
              <div className="profile-badges">
                {userData.favorite_team && (
                  <span className="profile-badge">
                    <Trophy size={12} /> {userData.favorite_team}
                  </span>
                )}
                {userData.favorite_player && (
                  <span className="profile-badge">
                    <Heart size={12} /> {userData.favorite_player}
                  </span>
                )}
                {userData.nationality && (
                  <span className="profile-badge">
                    <Globe size={12} /> {userData.nationality}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation (Estilo Instagram) */}
        <div className="profile-tabs">
          {profileTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      <Footer />
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Modales de Administración */}
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