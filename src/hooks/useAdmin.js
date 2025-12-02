import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useAdmin() {
  const [loading, setLoading] = useState(false);

  const createLeague = async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("leagues")
        .insert(data);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error creating league:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const createAward = async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("awards")
        .insert(data);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error creating award:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("matches")
        .insert(data);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error creating match:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createLeague,
    createAward,
    createMatch
  };
}