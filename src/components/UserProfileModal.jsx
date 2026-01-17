// src/components/UserProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Target, Flame, Star, Award, Calendar, 
  TrendingUp, Crown, Shield, Sparkles, Zap, Users,
  Globe, Heart, Flag, Gem, Layers, Activity
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import '../styles/UserProfileModal.css';

export default function UserProfileModal({ userId, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    best_streak: 0
  });
  const [userAchievements, setUserAchievements] = useState([]);
  const [userTitles, setUserTitles] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]); 
  const [userRanking, setUserRanking] = useState({
    position: 0,
    totalUsers: 0
  });
  const [crownHistory, setCrownHistory] = useState([]); // Nuevo: historial de coronas

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Cargar datos del usuario
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUserData(user);

      // Cargar ranking
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, points')
        .order('points', { ascending: false });

      if (allUsers) {
        const userIndex = allUsers.findIndex(u => u.id === userId);
        setUserRanking({
          position: userIndex + 1,
          totalUsers: allUsers.length
        });
      }

      // Calcular rachas
      const { data: predictions } = await supabase
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
        .eq('user_id', userId)
        .eq('matches.status', 'finished')
        .order('matches.date', { ascending: false });

      if (predictions) {
        calculateStreaks(predictions);
      }

      // Cargar logros disponibles
      const { data: achievements } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (achievements) {
        setAvailableAchievements(achievements); 
        const calculatedAchievements = calculateAchievements(achievements, {
          points: user.points || 0,
          predictions: user.predictions || 0,
          correct: user.correct || 0,
          current_streak: streakData.current_streak
        });
        setUserAchievements(calculatedAchievements);
      }

      // Cargar títulos disponibles
      const { data: titles } = await supabase
        .from('available_titles')
        .select('*');

      if (titles && achievements) {
        const calculatedTitles = calculateTitles(
          titles,
          calculateAchievements(achievements, {
            points: user.points || 0,
            predictions: user.predictions || 0,
            correct: user.correct || 0,
            current_streak: streakData.current_streak
          })
        );
        setUserTitles(calculatedTitles);
      }

      // Cargar historial de coronas (nuevo)
      const { data: history } = await supabase
        .from('monthly_championship_history')
        .select('*')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (history) {
        setCrownHistory(history);
      }

    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreaks = (predictions) => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const finishedPredictions = predictions
      .filter(p => p.matches?.status === 'finished')
      .sort((a, b) => new Date(b.matches.date) - new Date(a.matches.date));

    finishedPredictions.forEach((pred, index) => {
      const match = pred.matches;
      const isCorrect = checkPredictionCorrect(pred, match);

      if (isCorrect) {
        tempStreak++;
        if (index === 0) currentStreak = tempStreak;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
        if (index === 0) currentStreak = 0;
      }
    });

    setStreakData({ current_streak: currentStreak, best_streak: bestStreak });
  };

  const checkPredictionCorrect = (prediction, match) => {
    if (match.result_home === null || match.result_away === null) return false;
    
    const predDiff = Math.sign(prediction.home_score - prediction.away_score);
    const resultDiff = Math.sign(match.result_home - match.result_away);
    
    return predDiff === resultDiff || 
           (prediction.home_score === match.result_home && prediction.away_score === match.result_away);
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
    
    // Ordenar por el requirement_value del logro asociado (mayor = más avanzado)
    const sortedTitles = [...userTitles].sort((a, b) => {
      // Buscar el logro requerido para cada título
      const achievementA = availableAchievements.find(ach => ach.id === a.requirement_achievement_id);
      const achievementB = availableAchievements.find(ach => ach.id === b.requirement_achievement_id);
      
      // Si alguno no tiene logro asociado, ponerlo al final
      if (!achievementA) return 1;
      if (!achievementB) return -1;
      
      // Ordenar por requirement_value descendente (mayor valor = título más avanzado)
      return (achievementB.requirement_value || 0) - (achievementA.requirement_value || 0);
    });
    
    return sortedTitles[0];
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="user-modal-overlay">
        <div className="user-modal-container">
          <div className="user-modal-header">
            <div className="user-modal-title-section">
              <Users size={20} />
              <h2>Cargando Perfil</h2>
            </div>
            <button className="user-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="user-modal-body">
            <div className="loading-spinner">
              <Activity size={48} className="animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const accuracy = userData.predictions > 0 
    ? Math.round((userData.correct / userData.predictions) * 100)
    : 0;

  const activeTitle = getActiveTitle();

  const currentPoints = userData.points || 0;
  const pointsInLevel = currentPoints % 20;
  const nextLevelPoints = 20;
  const levelProgress = (pointsInLevel / nextLevelPoints) * 100;

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal-container" onClick={e => e.stopPropagation()}>
        <div className="user-modal-header">
          <div className="user-modal-title-section">
            <Users size={20} />
            <h2>{userData.name || 'Usuario'}</h2>
          </div>
          <button className="user-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="user-modal-body">
          {/* Banner y Avatar */}
          <div className="user-modal-avatar-section">
            <div className="user-modal-banner">
              <div className="banner-pattern"></div>
            </div>
            <div className="user-modal-avatar-wrapper">
              <div className="user-modal-avatar">
                {userData.avatar_url ? (
                  <img src={userData.avatar_url} alt={userData.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {userData.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="user-modal-level-badge">
                <Shield size={14} />
                <span>{userData.level || 1}</span>
              </div>
            </div>
          </div>

          {/* Nombre y Badges */}
          <div className="user-modal-name-section">
            <h3 className="user-modal-name">{userData.name || 'Usuario Anónimo'}</h3>
            {activeTitle && (
              <div className="user-modal-title-badge" style={{ color: activeTitle.color }}>
                <Gem size={14} />
                <span>{activeTitle.name}</span>
              </div>
            )}
          </div>

          {/* Coronas - Nueva sección */}
          <div className="user-modal-crowns">
            <div className="section-header">
              <Crown size={20} />
              <h4>Coronas Mensuales</h4>
              <span className="count-badge">
                {userData.monthly_championships || 0}
              </span>
            </div>
            
            <div className="crowns-display">
              {Array.from({ length: userData.monthly_championships || 0 }).map((_, index) => (
                <Crown key={index} size={28} className="crown-icon" />
              ))}
              {userData.monthly_championships === 0 && (
                <p className="no-crowns">No hay coronas aún</p>
              )}
            </div>
            
            {crownHistory.length > 0 && (
              <div className="crowns-history">
                <h5>Historial</h5>
                {crownHistory.map((crown) => (
                  <div key={crown.id} className="history-item">
                    <span className="month">{crown.month_year}</span>
                    <span className="points">{crown.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="user-modal-badges-grid">
            {userData.favorite_team && (
              <div className="user-modal-badge team">
                <div className="badge-icon"><Trophy size={14} /></div>
                <div className="badge-text">
                  <span className="badge-label">Equipo Fav</span>
                  <span className="badge-value">{userData.favorite_team}</span>
                </div>
              </div>
            )}

            {userData.favorite_player && (
              <div className="user-modal-badge player">
                <div className="badge-icon"><Heart size={14} /></div>
                <div className="badge-text">
                  <span className="badge-label">Jugador Fav</span>
                  <span className="badge-value">{userData.favorite_player}</span>
                </div>
              </div>
            )}

            {userData.nationality && (
              <div className="user-modal-badge nation">
                <div className="badge-icon"><Globe size={14} /></div>
                <div className="badge-text">
                  <span className="badge-label">País</span>
                  <span className="badge-value">{userData.nationality}</span>
                </div>
              </div>
            )}

            <div className="user-modal-badge joined">
              <div className="badge-icon"><Calendar size={14} /></div>
              <div className="badge-text">
                <span className="badge-label">Miembro desde</span>
                <span className="badge-value">{formatDate(userData.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Stats Principales */}
          <div className="user-modal-stats-grid">
            <div className="user-modal-stat-item primary">
              <div className="stat-icon">
                <TrendingUp size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Puntos Totales</div>
                <div className="stat-value">{userData.points || 0}</div>
              </div>
            </div>

            <div className="user-modal-stat-item success">
              <div className="stat-icon">
                <Target size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Precisión</div>
                <div className="stat-value">{accuracy}%</div>
              </div>
            </div>

            <div className="user-modal-stat-item warning">
              <div className="stat-icon">
                <Flame size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Racha Actual</div>
                <div className="stat-value">{streakData.current_streak}</div>
              </div>
            </div>

            <div className="user-modal-stat-item accent">
              <div className="stat-icon">
                <Trophy size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Ranking</div>
                <div className="stat-value">#{userRanking.position}</div>
              </div>
            </div>
          </div>

          {/* Progreso de Nivel */}
          <div className="user-modal-level-card">
            <div className="level-header">
              <div className="level-title-section">
                <Zap size={20} />
                <div>
                  <h4>Nivel {userData.level}</h4>
                  <p>Progreso hacia el siguiente nivel</p>
                </div>
              </div>
              <div className="level-points">
                <span className="current-points">{currentPoints} pts</span>
                <span className="next-level-points">Siguiente: {nextLevelPoints} pts</span>
              </div>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${levelProgress}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
              <div className="progress-label">
                <span>{pointsInLevel}/20 puntos</span>
                <span>{nextLevelPoints - currentPoints} pts restantes</span>
              </div>
            </div>
          </div>

          {/* Rachas */}
          <div className="user-modal-streaks">
            <div className="streak-item current">
              <div className="streak-icon">
                <Flame size={28} />
              </div>
              <div className="streak-info">
                <div className="streak-label">Racha Actual</div>
                <div className="streak-value">{streakData.current_streak}</div>
              </div>
              {streakData.current_streak > 0 && (
                <div className="streak-badge">
                  <Sparkles size={12} />
                  <span>Activa</span>
                </div>
              )}
            </div>

            <div className="streak-item best">
              <div className="streak-icon">
                <Crown size={28} />
              </div>
              <div className="streak-info">
                <div className="streak-label">Récord Personal</div>
                <div className="streak-value">{streakData.best_streak}</div>
              </div>
            </div>
          </div>

          {/* Título Activo */}
          {activeTitle && (
            <div className="user-modal-active-title">
              <div className="title-header">
                <Crown size={20} />
                <h4>Título Activo</h4>
                <div className="title-active-badge">
                  <Sparkles size={12} />
                  <span>Equipado</span>
                </div>
              </div>
              
              <div className="current-title-display" style={{ borderColor: activeTitle.color }}>
                <div className="title-icon-large" style={{ color: activeTitle.color }}>
                  <Gem size={28} />
                </div>
                <div className="title-details">
                  <h5 style={{ color: activeTitle.color }}>{activeTitle.name}</h5>
                  <p>{activeTitle.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logros */}
          <div className="user-modal-achievements">
            <div className="section-header">
              <Award size={20} />
              <h4>Logros Obtenidos</h4>
              <span className="count-badge">
                {userAchievements.length}
              </span>
            </div>
            
            {userAchievements.length === 0 ? (
              <div className="empty-achievements">
                <Target size={40} />
                <p>Sin logros aún</p>
              </div>
            ) : (
              <div className="achievements-grid">
                {userAchievements.slice(0, 6).map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="achievement-card"
                    style={{ 
                      borderColor: getCategoryColor(achievement.category),
                      background: `linear-gradient(135deg, ${getCategoryColor(achievement.category)}10, transparent)`
                    }}
                  >
                    <div className="achievement-emoji">{getIconEmoji(achievement.icon)}</div>
                    <div className="achievement-info">
                      <h5>{achievement.name}</h5>
                      <p>{achievement.description}</p>
                      <div className="achievement-category" style={{ color: getCategoryColor(achievement.category) }}>
                        {achievement.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}