import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useDashboardData() {
  const { profile: currentUser } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [users, setUsers] = useState([]); 

  const [loading, setLoading] = useState(true);

  // Mapea la predicción del usuario logueado en la propiedad 'prediction' del objeto principal
  const mapPredictions = (data, predictionKey, userId) => {
    return data.map(item => {
      // item[predictionKey] contiene el array de predicciones de ese partido/liga/premio
      const userPrediction = item[predictionKey].find(
        (pred) => pred.user_id === userId // Asumimos 'user_id' es la columna de vínculo
      );

      return {
        ...item,
        prediction: userPrediction || null,
        // Eliminamos el array completo de predicciones para evitar datos redundantes
        [predictionKey]: undefined, 
      };
    });
  };


  const fetchAllData = useCallback(async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      
      // ---- A. PARTIDOS ----
      // Eliminamos el !left para que Supabase infiera la relación directamente por el nombre de la tabla.
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          match_predictions( 
            id, user_id, home_score_pred, away_score_pred, status, points
          )
        `)
        .order('date', { ascending: true });

      if (matchesError) throw matchesError;
      const processedMatches = mapPredictions(matchesData, 'match_predictions', userId);
      setMatches(processedMatches);


      // ---- B. LIGAS ----
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select(`
          *,
          league_predictions( 
            id, user_id, champion_pred, topscorer_pred, topassist_pred, mvp_pred, status, points
          )
        `)
        .order('name', { ascending: true });

      if (leaguesError) throw leaguesError;
      const processedLeagues = mapPredictions(leaguesData, 'league_predictions', userId);
      setLeagues(processedLeagues);


      // ---- C. PREMIOS ----
      const { data: awardsData, error: awardsError } = await supabase
        .from('awards')
        .select(`
          *,
          award_predictions( 
            id, user_id, winner_pred, status, points
          )
        `)
        .order('name', { ascending: true });

      if (awardsError) throw awardsError;
      const processedAwards = mapPredictions(awardsData, 'award_predictions', userId);
      setAwards(processedAwards);
      
      
      // ---- D. USUARIOS ----
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData);


    } catch (error) {
      // Aquí verás el error de la DB
      console.error("Error al cargar los datos del Dashboard y Predicciones:", error);
    } finally {
      setLoading(false);
    }
  }, []); 

  
  // EFECTO PRINCIPAL
  useEffect(() => {
    if (currentUser?.id) { 
      fetchAllData(currentUser.id);
    }
  }, [currentUser?.id, fetchAllData]);
  
  const refreshData = () => {
    if (currentUser?.id) {
        fetchAllData(currentUser.id);
    }
  };

  return {
    matches,
    leagues,
    awards,
    users,
    loading,
    setMatches,
    setLeagues,
    setAwards,
    refreshData,
  };
}