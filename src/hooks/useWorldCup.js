// src/hooks/useWorldCup.js
import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useWorldCup = (currentUser) => {
  const [loading, setLoading] = useState(false);

  // Cargar predicciones del usuario
  const loadPredictions = useCallback(async () => {
    if (!currentUser) return null;
    
    try {
      const { data, error } = await supabase
        .from('worldcup_predictions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        return {
          groups: data.groups_predictions || {},
          knockout: data.knockout_predictions || {
            round16: {},
            quarters: {},
            semis: {},
            final: {},
            thirdPlace: {}
          },
          awards: data.awards_predictions || {
            topScorer: '',
            topAssist: '',
            surpriseTeam: '',
            disappointmentTeam: '',
            breakoutPlayer: '',
            disappointmentPlayer: ''
          }
        };
      }

      return null;
    } catch (err) {
      console.error('Error loading predictions:', err);
      throw err;
    }
  }, [currentUser]);

  // Guardar predicciones
  const savePredictions = useCallback(async (predictions, onSuccess, onError) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('worldcup_predictions')
        .upsert({
          user_id: currentUser.id,
          groups_predictions: predictions.groups,
          knockout_predictions: predictions.knockout,
          awards_predictions: predictions.awards,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      onSuccess?.();
    } catch (err) {
      console.error('Error saving predictions:', err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Calcular estadísticas del usuario
  const calculateUserStats = useCallback(async () => {
    if (!currentUser) return null;

    try {
      const { data: predictions } = await supabase
        .from('worldcup_predictions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (!predictions) return null;

      // Contar predicciones completadas
      const groupsCount = Object.keys(predictions.groups_predictions || {}).length;
      const knockoutCount = Object.keys(predictions.knockout_predictions?.round16 || {}).length;
      const awardsCount = Object.values(predictions.awards_predictions || {})
        .filter(v => v && v.trim() !== '').length;

      return {
        groupsPredicted: groupsCount,
        knockoutPredicted: knockoutCount,
        awardsPredicted: awardsCount,
        totalCompleted: groupsCount + knockoutCount + awardsCount,
        lastUpdated: predictions.updated_at
      };
    } catch (err) {
      console.error('Error calculating stats:', err);
      return null;
    }
  }, [currentUser]);

  return {
    loading,
    loadPredictions,
    savePredictions,
    calculateUserStats
  };
};