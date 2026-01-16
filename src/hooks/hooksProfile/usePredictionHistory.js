import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export const usePredictionHistory = (currentUser) => {
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadPredictionHistory = async (toast) => {
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
      if (toast) {
        toast.error('Error al cargar el historial');
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPredictionHistory();
    }
  }, [currentUser]);

  return {
    predictionHistory,
    historyLoading,
    loadPredictionHistory
  };
};