import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

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

export const useAchievements = (currentUser, streakData) => {
  const [userAchievements, setUserAchievements] = useState([]);
  const [userTitles, setUserTitles] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [availableTitles, setAvailableTitles] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  const loadAchievementsAndTitles = async () => {
    if (!currentUser) return;
    
    try {
      setAchievementsLoading(true);
      
      // Load available achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (achievementsError) throw achievementsError;
      setAvailableAchievements(achievementsData || []);

      // Load available titles
      const { data: titlesData, error: titlesError } = await supabase
        .from('available_titles')
        .select('*');

      if (titlesError) throw titlesError;
      setAvailableTitles(titlesData || []);

      // Calculate user achievements
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

      // Calculate user titles
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

  const handleSaveAchievement = async (achievementData, toast) => {
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

  const handleDeleteAchievement = async (achievementId, toast) => {
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

  const handleSaveTitle = async (titleData, toast) => {
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

  const handleDeleteTitle = async (titleId, toast) => {
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

  const getActiveTitle = () => {
    if (userTitles.length === 0) return null;
    
    const sortedTitles = [...userTitles].sort((a, b) => {
      const achievementA = availableAchievements.find(ach => ach.id === a.requirement_achievement_id);
      const achievementB = availableAchievements.find(ach => ach.id === b.requirement_achievement_id);
      
      if (!achievementA) return 1;
      if (!achievementB) return -1;
      
      return (achievementB.requirement_value || 0) - (achievementA.requirement_value || 0);
    });
    
    return sortedTitles[0];
  };

  useEffect(() => {
    if (currentUser) {
      loadAchievementsAndTitles();
    }
  }, [currentUser, streakData]);

  return {
    userAchievements,
    userTitles,
    availableAchievements,
    availableTitles,
    achievementsLoading,
    getActiveTitle,
    handleSaveAchievement,
    handleDeleteAchievement,
    handleSaveTitle,
    handleDeleteTitle
  };
};