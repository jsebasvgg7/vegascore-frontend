// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

// Auth
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Layout principal
import VegaLayout from "./pages/layout/VegaLayout";

// Pages nuevas
import HomePage from "./pages/HomePage";
import RankingPage from "./pages/RankingPage";
import HistoricalPage from "./pages/HistoricalPage";
import ProfilePage from "./pages/ProfilePage";
import ConfigPage from "./pages/ConfigPage";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setLoading(false);
    });

    // Listener de cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p style={{ color: "#fff" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={!session ? <LoginPage /> : <Navigate to="/app/home" />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={!session ? <RegisterPage /> : <Navigate to="/app/home" />}
        />

        {/* RUTAS PROTEGIDAS */}
        <Route
          path="/app"
          element={session ? <VegaLayout /> : <Navigate to="/" />}
        >
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="historical" element={<HistoricalPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="config" element={<ConfigPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
