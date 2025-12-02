// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VegaScorePage from "./pages/VegaScorePage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";

// Wrapper para pasar navigate a los componentes
function AppRoutes() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const initSession = async () => {
      try {
        console.log("🔍 Iniciando carga de sesión...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error al obtener sesión:", error);
          setLoading(false);
          return;
        }

        console.log("✅ Sesión obtenida:", session ? "Usuario conectado" : "Sin sesión");
        setSession(session);
        
        // Si hay sesión, cargar datos del usuario
        if (session?.user) {
          console.log("🔍 Buscando perfil para user ID:", session.user.id);
          
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", session.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("❌ Error al cargar usuario:", userError);
          } else if (userData) {
            console.log("✅ Usuario encontrado:", userData.name, "- Admin:", userData.is_admin);
            setCurrentUser(userData);
          } else {
            console.warn("⚠️ No se encontró perfil de usuario");
          }
        }
      } catch (err) {
        console.error("❌ Error en initSession:", err);
      } finally {
        console.log("✅ Carga de sesión completada");
        setLoading(false);
      }
    };

    initSession();

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          console.log("🔍 Recargando perfil de usuario...");
          const { data: userData, error } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("❌ Error recargando usuario:", error);
          } else if (userData) {
            console.log("✅ Usuario recargado:", userData.name);
            setCurrentUser(userData);
          }
        } else {
          console.log("🔓 Sesión cerrada");
          setCurrentUser(null);
        }
      }
    );

    // Limpiar el listener al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "16px" }}>
            <div className="spinner-large" style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f4f6",
              borderTopColor: "#60519b",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }}></div>
          </div>
          <p style={{ color: "#fff", margin: 0 }}>Cargando...</p>
        </div>
      </div>
    );
  }

  console.log("🎯 Estado actual - Session:", !!session, "User:", !!currentUser);

  return (
    <Routes>
      {/* Si está logueado → redirigir a /app */}
      <Route
        path="/"
        element={session ? <Navigate to="/app" replace /> : <LoginPage />}
      />

      {/* Si está logueado → no mostrar registro */}
      <Route
        path="/register"
        element={session ? <Navigate to="/app" replace /> : <RegisterPage />}
      />

      {/* Página principal protegida */}
      <Route
        path="/app"
        element={
          session ? (
            <VegaScorePage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Página de Ranking */}
      <Route
        path="/ranking"
        element={
          session ? (
            <RankingPage 
              currentUser={currentUser} 
              onBack={() => navigate('/app')} 
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Página de Admin - Solo para administradores */}
      <Route
        path="/admin"
        element={
          session ? (
            currentUser?.is_admin ? (
              <AdminPage 
                currentUser={currentUser} 
                onBack={() => navigate('/app')} 
              />
            ) : (
              <Navigate to="/app" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Ruta catch-all para URLs no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}