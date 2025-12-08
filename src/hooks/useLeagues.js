// src/hooks/useLeagues.js
import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useLeagues = (currentUser) => {
  const [loading, setLoading] = useState(false);

  // Hacer predicción de liga
  const makeLeaguePrediction = useCallback(async (leagueId, champion, topScorer, topAssist, mvp, onSuccess, onError) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("league_predictions")
        .upsert({
          league_id: leagueId,
          user_id: currentUser.id,
          predicted_champion: champion,
          predicted_top_scorer: topScorer,
          predicted_top_assist: topAssist,
          predicted_mvp: mvp,
        }, {
          onConflict: 'league_id,user_id'
        });

      if (error) throw error;

      const { data: leagueList } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)");

      onSuccess?.(leagueList);
    } catch (err) {
      console.error("Error al guardar predicción de liga:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Agregar nueva liga
  const addLeague = useCallback(async (league, onSuccess, onError) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("leagues").insert(league);
      if (error) throw error;

      const { data } = await supabase.from("leagues").select("*, league_predictions(*)");
      onSuccess?.(data);
    } catch (err) {
      console.error("Error al agregar liga:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar liga y calcular puntos
  const finishLeague = useCallback(async (leagueId, results, onSuccess, onError) => {
    setLoading(true);
    try {
      console.log(`🏆 Finalizando liga ${leagueId}`);

      // 1. Actualizar liga con resultados
      const { error: updateError } = await supabase
        .from("leagues")
        .update({ 
          status: "finished",
          champion: results.champion,
          top_scorer: results.top_scorer,
          top_scorer_goals: results.top_scorer_goals,
          top_assist: results.top_assist,
          top_assist_count: results.top_assist_count,
          mvp_player: results.mvp_player
        })
        .eq("id", leagueId);

      if (updateError) throw updateError;

      // 2. Obtener liga con predicciones
      const { data: league, error: leagueError } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)")
        .eq("id", leagueId)
        .single();

      if (leagueError) throw leagueError;

      console.log(`📊 Liga encontrada con ${league.league_predictions.length} predicciones`);

      // 3. Calcular puntos (5 por cada predicción correcta)
      for (const prediction of league.league_predictions) {
        let pointsEarned = 0;
        let correctPredictions = 0;

        if (prediction.predicted_champion?.toLowerCase() === results.champion.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }
        if (prediction.predicted_top_scorer?.toLowerCase() === results.top_scorer.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }
        if (prediction.predicted_top_assist?.toLowerCase() === results.top_assist.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }
        if (prediction.predicted_mvp?.toLowerCase() === results.mvp_player.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }

        console.log(`Usuario ${prediction.user_id}: ${pointsEarned} puntos (${correctPredictions}/4 aciertos)`);

        // Actualizar points_earned en predicción
        await supabase
          .from("league_predictions")
          .update({ points_earned: pointsEarned })
          .eq("id", prediction.id);

        // Actualizar puntos del usuario
        const { data: userData } = await supabase
          .from("users")
          .select("points, predictions, correct, weekly_points, weekly_predictions, weekly_correct")
          .eq("id", prediction.user_id)
          .single();

        if (userData) {
          // Estadísticas globales
          const newPoints = (userData.points || 0) + pointsEarned;
          const newPredictions = (userData.predictions || 0) + 1;
          const newCorrect = (userData.correct || 0) + correctPredictions;

          // Estadísticas semanales ⭐
          const newWeeklyPoints = (userData.weekly_points || 0) + pointsEarned;
          const newWeeklyPredictions = (userData.weekly_predictions || 0) + 1;
          const newWeeklyCorrect = (userData.weekly_correct || 0) + correctPredictions;

          await supabase
            .from("users")
            .update({ 
              // Globales
              points: newPoints,
              predictions: newPredictions,
              correct: newCorrect,
              // Semanales ⭐
              weekly_points: newWeeklyPoints,
              weekly_predictions: newWeeklyPredictions,
              weekly_correct: newWeeklyCorrect
            })
            .eq("id", prediction.user_id);
            
          console.log(`✅ Usuario ${prediction.user_id}:`);
          console.log(`   Global: ${newPoints} pts, ${newCorrect} aciertos`);
          console.log(`   Semanal: ${newWeeklyPoints} pts, ${newWeeklyCorrect} aciertos`);
        }
      }

      // 4. Recargar datos
      const { data: updatedUsers } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      const { data: updatedLeagues } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)");

      onSuccess?.({
        users: updatedUsers || [],
        leagues: updatedLeagues || []
      });

    } catch (err) {
      console.error("Error al finalizar liga:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    makeLeaguePrediction,
    addLeague,
    finishLeague
  };
};