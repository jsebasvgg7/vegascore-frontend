// src/hooks/useMatches.js
import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useMatches = (currentUser) => {
  const [loading, setLoading] = useState(false);

  // Hacer predicción de un partido
  const makePrediction = useCallback(async (matchId, homeScore, awayScore, onSuccess, onError) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("predictions")
        .upsert({
          match_id: matchId,
          user_id: currentUser.id,
          home_score: homeScore,
          away_score: awayScore,
        }, {
          onConflict: 'match_id,user_id'
        });

      if (error) throw error;

      const { data: matchList } = await supabase
        .from("matches")
        .select("*, predictions(*)");

      onSuccess?.(matchList);
    } catch (err) {
      console.error("Error al guardar predicción:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Agregar nuevo partido
  const addMatch = useCallback(async (match, onSuccess, onError) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("matches").insert(match);
      if (error) throw error;

      const { data } = await supabase.from("matches").select("*, predictions(*)");
      onSuccess?.(data);
    } catch (err) {
      console.error("Error al agregar partido:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar partido y calcular puntos
  const finishMatch = useCallback(async (matchId, homeScore, awayScore, onSuccess, onError) => {
    setLoading(true);
    try {
      console.log(`🎯 Finalizando partido ${matchId}: ${homeScore}-${awayScore}`);

      // 1. Actualizar resultado
      const { error: updateError } = await supabase
        .from("matches")
        .update({ 
          result_home: homeScore, 
          result_away: awayScore, 
          status: "finished" 
        })
        .eq("id", matchId);

      if (updateError) throw updateError;

      // 2. Obtener partido con predicciones
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*, predictions(*)")
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      console.log(`📊 Partido encontrado con ${match.predictions.length} predicciones`);

      // 3. Calcular y distribuir puntos
      const resultDiff = Math.sign(homeScore - awayScore);
      let exactPredictions = 0;
      let correctResults = 0;

      for (const prediction of match.predictions) {
        const predDiff = Math.sign(prediction.home_score - prediction.away_score);
        let pointsEarned = 0;

        if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
          pointsEarned = 5;
          exactPredictions++;
          console.log(`✅ Usuario ${prediction.user_id}: Resultado exacto (+5 pts)`);
        } else if (resultDiff === predDiff) {
          pointsEarned = 3;
          correctResults++;
          console.log(`✅ Usuario ${prediction.user_id}: Acertó resultado (+3 pts)`);
        } else {
          console.log(`❌ Usuario ${prediction.user_id}: No acertó (0 pts)`);
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("points, predictions, correct")
          .eq("id", prediction.user_id)
          .single();

        if (userError) {
          console.error(`Error al obtener usuario ${prediction.user_id}:`, userError);
          continue;
        }

        const newPoints = (userData.points || 0) + pointsEarned;
        const newPredictions = (userData.predictions || 0) + 1;
        const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

        await supabase
          .from("users")
          .update({
            points: newPoints,
            predictions: newPredictions,
            correct: newCorrect
          })
          .eq("id", prediction.user_id);
      }

      // 4. Recargar datos actualizados
      const { data: updatedUsers } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      const { data: updatedMatches } = await supabase
        .from("matches")
        .select("*, predictions(*)");

      console.log("✅ Partido finalizado");

      onSuccess?.({
        users: updatedUsers || [],
        matches: updatedMatches || [],
        stats: { exactPredictions, correctResults }
      });

    } catch (err) {
      console.error("Error al finalizar partido:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    makePrediction,
    addMatch,
    finishMatch
  };
};