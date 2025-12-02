import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Obtener datos del usuario desde la tabla users
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!userData) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Obtener predicciones del usuario
      const { data: predictions, error: predError } = await supabase
        .from("predictions")
        .select(`
          *,
          matches:match_id (
            home_team,
            away_team,
            result_home,
            result_away,
            status
          )
        `)
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      if (predError) throw predError;

      // Formatear datos para el historial
      const formattedHistory = predictions?.map(pred => ({
        id: pred.id,
        match_name: `${pred.matches.home_team} vs ${pred.matches.away_team}`,
        created_at: pred.created_at,
        correct: pred.matches.status === 'finished' && 
                 pred.home_score === pred.matches.result_home && 
                 pred.away_score === pred.matches.result_away,
        points: pred.points_earned || 0
      })) || [];

      setHistory(formattedHistory);
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return { history, loading, reload: loadHistory };
}