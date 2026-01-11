import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import { ThemeProvider } from "./context/ThemeContext";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import StatsPage from "./pages/StatsPage";
import WorldCupPage from "./pages/WorldCupPage";
import { PageLoader } from "./components/LoadingStates";

export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (loading && initialLoad) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }

    return () => {
      document.body.classList.remove('loading');
    };
  }, [loading, initialLoad]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data?.session || null);
      
      if (data?.session) {
        loadUserData(data.session.user.id);
      } else {
        setLoading(false);
        setInitialLoad(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setSession(session);
        if (session) {
          loadUserData(session.user.id);
        } else {
          setLoading(false);
          setCurrentUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Reemplaza la función loadUserData en App.jsx con esta versión corregida:

const loadUserData = async (authId) => {
  try {
    console.log("🔍 Loading user data for auth_id:", authId);

    // 1. Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Profile error:", profileError);
      
      if (profileError.code === 'PGRST116' || 
          profileError.message.includes('permission') ||
          profileError.message.includes('not found')) {
        console.log("🚪 Signing out due to profile error");
        await supabase.auth.signOut();
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
        setInitialLoad(false);
        return;
      }
      throw profileError;
    }

    // 2. Si no existe el perfil, crearlo
    if (!profile) {
      console.log("📝 Profile not found, creating new profile...");
      
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser?.user) {
        console.error("❌ Auth user not found:", authError);
        await supabase.auth.signOut();
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      // ✅ USAR EL NOMBRE DE USER_METADATA SI EXISTE
      const userName = authUser.user.user_metadata?.name || 
                       authUser.user.user_metadata?.display_name ||
                       authUser.user.email?.split('@')[0] || 
                       "Usuario";

      console.log("👤 Nombre para el perfil:", userName);

      // Crear perfil con el nombre correcto
      const { data: newProfile, error: createError } = await supabase
        .from("users")
        .insert({
          auth_id: authId,
          name: userName, // ← NOMBRE CORRECTO
          email: authUser.user.email,
          points: 0,
          predictions: 0,
          correct: 0,
          weekly_points: 0,
          weekly_predictions: 0,
          weekly_correct: 0,
          current_streak: 0,
          best_streak: 0
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Create profile error:", createError);
        
        // Si el error es duplicado, intentar obtener el perfil existente
        if (createError.code === '23505') { // Código de duplicado en PostgreSQL
          console.log("⚠️ Perfil duplicado detectado, intentando obtener...");
          
          const { data: existingProfile } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", authId)
            .single();

          if (existingProfile) {
            console.log("✅ Perfil existente encontrado");
            setCurrentUser(existingProfile);
            
            // Continuar con la carga de usuarios
            const { data: userList } = await supabase
              .from("users")
              .select("*")
              .order("points", { ascending: false });
            setUsers(userList || []);
            
            setTimeout(() => {
              setLoading(false);
              setInitialLoad(false);
            }, 300);
            return;
          }
        }
        
        console.log("🚪 Signing out due to profile creation failure");
        await supabase.auth.signOut();
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      console.log("✅ New profile created:", newProfile);
      setCurrentUser(newProfile);
    } else {
      console.log("✅ Profile loaded:", profile);
      setCurrentUser(profile);
    }

    // 3. Cargar lista de usuarios para el ranking
    const { data: userList, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("points", { ascending: false });

    if (usersError) {
      console.error("⚠️ Error loading users list:", usersError);
    } else {
      setUsers(userList || []);
    }

  } catch (err) {
    console.error("💥 Unexpected error loading user data:", err);
    
    console.log("🚪 Signing out due to unexpected error");
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
  } finally {
    setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 300);
  }
};

  if (loading && initialLoad) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        {session && currentUser && (
          <Header
            currentUser={currentUser}
            users={users}
            onProfileClick={() => setShowProfile(!showProfile)}
          />
        )}

        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/"
            element={session ? <Navigate to="/app" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={session ? <Navigate to="/app" replace /> : <RegisterPage />}
          />
          <Route
            path="/forgot-password"
            element={session ? <Navigate to="/app" replace /> : <ForgotPasswordPage />}
          />
          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          {/* Rutas protegidas */}
          <Route
            path="/app"
            element={session ? <DashboardPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/notifications"
            element={session ? <NotificationsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/ranking"
            element={session ? <RankingPage currentUser={currentUser} users={users} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin"
            element={session ? <AdminPage currentUser={currentUser} users={users} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={session ? <ProfilePage currentUser={currentUser} onBack={() => window.history.back()} /> : <Navigate to="/" replace />}
          />
          <Route 
            path="/stats"
            element={session ? <StatsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/worldcup"
            element={session ? <WorldCupPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}