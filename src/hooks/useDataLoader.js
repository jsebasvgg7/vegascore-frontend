// src/hooks/useDataLoader.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useDataLoader = () => {
  const [state, setState] = useState({
    currentUser: null,
    users: [],
    matches: [],
    leagues: [],
    awards: [],
    loading: true,
    error: null
  });

  const loadData = useCallback(async () => {
    try {
      // 1. Obtener usuario autenticado
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!authUser?.user) {
        window.location.href = "/";
        return;
      }

      console.log("Auth User ID:", authUser.user.id);

      // 2. Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error al cargar perfil:", profileError);
        throw new Error("Error al cargar tu perfil");
      }

      // Si no existe el perfil, crearlo
      let currentUserData = profile;
      if (!profile) {
        console.log("Perfil no encontrado, creando uno nuevo...");

        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            auth_id: authUser.user.id,
            name: authUser.user.email?.split('@')[0] || "Usuario",
            email: authUser.user.email,
            points: 0,
            predictions: 0,
            correct: 0
          })
          .select()
          .single();

        if (createError) {
          console.error("Error al crear perfil:", createError);
          throw new Error("No se pudo crear tu perfil");
        }

        console.log("Perfil creado:", newProfile);
        currentUserData = newProfile;
      } else {
        console.log("Perfil encontrado:", profile);
      }

      // 3. Cargar todos los datos en paralelo
      const [
        { data: userList },
        { data: matchList },
        { data: leagueList },
        { data: awardList }
      ] = await Promise.all([
        supabase.from("users").select("*").order("points", { ascending: false }),
        supabase.from("matches").select("*, predictions(*)"),
        supabase.from("leagues").select("*, league_predictions(*)"),
        supabase.from("awards").select("*, award_predictions(*)")
      ]);

      setState({
        currentUser: currentUserData,
        users: userList || [],
        matches: matchList || [],
        leagues: leagueList || [],
        awards: awardList || [],
        loading: false,
        error: null
      });

    } catch (err) {
      console.error("Error en loadData:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  }, []);

  // Actualizar datos específicos sin recargar todo
  const updateUsers = useCallback((users) => {
    setState(prev => ({ ...prev, users }));
    
    // Actualizar currentUser si está en la lista
    const updatedCurrentUser = users?.find(u => u.id === prev.currentUser?.id);
    if (updatedCurrentUser) {
      setState(prev => ({ ...prev, currentUser: updatedCurrentUser }));
    }
  }, []);

  const updateMatches = useCallback((matches) => {
    setState(prev => ({ ...prev, matches }));
  }, []);

  const updateLeagues = useCallback((leagues) => {
    setState(prev => ({ ...prev, leagues }));
  }, []);

  const updateAwards = useCallback((awards) => {
    setState(prev => ({ ...prev, awards }));
  }, []);

  // Recargar solo usuarios (útil después de operaciones de puntos)
  const reloadUsers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });
      
      updateUsers(data || []);
    } catch (err) {
      console.error("Error al recargar usuarios:", err);
    }
  }, [updateUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    loadData,
    updateUsers,
    updateMatches,
    updateLeagues,
    updateAwards,
    reloadUsers
  };
};