import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VegaScorePage from "./pages/VegaScorePage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Header";

function AppContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) return;

      // Cargar perfil del usuario
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.user.id)
        .maybeSingle();

      setCurrentUser(profile);

      // Cargar todos los usuarios para el ranking
      const { data: userList } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      setUsers(userList || []);
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p style={{ color: "#fff" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  // Determinar si mostrar el Header
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";
  const showHeader = session && !isAuthPage;

  return (
    <>
      {/* Header solo en páginas autenticadas */}
      {showHeader && currentUser && (
        <Header
          currentUser={currentUser}
          users={users}
          onProfileClick={() => setShowProfile(true)}
        />
      )}

      {/* Modal de Perfil */}
      {showProfile && (
        <ProfilePage
          currentUser={currentUser}
          onBack={() => setShowProfile(false)}
        />
      )}

      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/"
          element={session ? <Navigate to="/app" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={session ? <Navigate to="/app" /> : <RegisterPage />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/app"
          element={session ? <VegaScorePage /> : <Navigate to="/" />}
        />
        <Route
          path="/ranking"
          element={session ? <RankingPage currentUser={currentUser} users={users} /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={session ? <AdminPage currentUser={currentUser} /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}