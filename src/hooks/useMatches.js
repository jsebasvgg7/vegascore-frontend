import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*, predictions(*)")
        .order("date", { ascending: true });
      
      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error loading matches:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return { matches, loading, reload: loadMatches };
}
