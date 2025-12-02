import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useAwards() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAwards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("awards")
        .select("*, award_predictions(*)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAwards(data || []);
    } catch (error) {
      console.error("Error loading awards:", error);
      setAwards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAwards();
  }, []);

  return { awards, loading, reload: loadAwards };
}