// src/hooks/useAwards.js
import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useAwards = (currentUser) => {
  const [loading, setLoading] = useState(false);

  // Hacer predicción de premio
  const makeAwardPrediction = useCallback(async (awardId, predictedWinner, onSuccess, onError) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("award_predictions")
        .upsert({
          award_id: awardId,
          user_id: currentUser.id,
          predicted_winner: predictedWinner,
        }, {
          onConflict: 'award_id,user_id'
        });

      if (error) throw error;

      const { data: awardList } = await supabase
        .from("awards")
        .select("*, award_predictions(*)");

      onSuccess?.(awardList);
    } catch (err) {
      console.error("Error al guardar predicción de premio:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Agregar nuevo premio
  const addAward = useCallback(async (award, onSuccess, onError) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("awards").insert(award);
      if (error) throw error;

      const { data } = await supabase.from("awards").select("*, award_predictions(*)");
      onSuccess?.(data);
    } catch (err) {
      console.error("Error al agregar premio:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar premio y calcular puntos
  const finishAward = useCallback(async (awardId, winner, onSuccess, onError) => {
    setLoading(true);
    try {
      console.log(`🏅 Finalizando premio ${awardId} - ganador: ${winner}`);

      // 1. Actualizar premio
      const { error: updateError } = await supabase
        .from("awards")
        .update({ status: "finished", winner })
        .eq("id", awardId);

      if (updateError) throw updateError;

      // 2. Obtener premio con predicciones
      const { data: award, error: awardError } = await supabase
        .from("awards")
        .select("*, award_predictions(*)")
        .eq("id", awardId)
        .single();

      if (awardError) throw awardError;

      // 3. Repartir puntos (10 puntos por acierto)
      for (const prediction of award.award_predictions) {
        let pointsEarned = 0;

        if (prediction.predicted_winner?.toLowerCase() === winner.toLowerCase()) {
          pointsEarned = 10;
        }

        // Actualizar points_earned en predicción
        await supabase
          .from("award_predictions")
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
          const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

          // Estadísticas semanales ⭐
          const newWeeklyPoints = (userData.weekly_points || 0) + pointsEarned;
          const newWeeklyPredictions = (userData.weekly_predictions || 0) + 1;
          const newWeeklyCorrect = (userData.weekly_correct || 0) + (pointsEarned > 0 ? 1 : 0);

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
          console.log(`   Global: ${newPoints} pts, ${newCorrect}/${newPredictions}`);
          console.log(`   Semanal: ${newWeeklyPoints} pts, ${newWeeklyCorrect}/${newWeeklyPredictions}`);
        }
      }

      // 4. Recargar datos
      const { data: updatedUsers } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      const { data: updatedAwards } = await supabase
        .from("awards")
        .select("*, award_predictions(*)");

      onSuccess?.({
        users: updatedUsers || [],
        awards: updatedAwards || []
      });

    } catch (err) {
      console.error("Error al finalizar premio:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    makeAwardPrediction,
    addAward,
    finishAward
  };
};