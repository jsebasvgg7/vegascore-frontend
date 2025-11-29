// src/components/RequireAuth.jsx
import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div>Cargando...</div>;
  if (!session) return <Navigate to="/login" />;

  return children;
}
