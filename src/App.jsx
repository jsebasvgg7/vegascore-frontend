// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VegaScorePage from "./pages/VegaScorePage";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/app" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={session ? <Navigate to="/app" /> : <RegisterPage />}
        />
        <Route
          path="/app"
          element={session ? <VegaScorePage /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
