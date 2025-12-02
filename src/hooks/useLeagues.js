import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useLeagues() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeagues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLeagues(data || []);
    } catch (error) {
      console.error("Error loading leagues:", error);
      setLeagues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeagues();
  }, []);

  return { leagues, loading, reload: loadLeagues };
}
