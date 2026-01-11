import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/pagesStyles/Auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const login = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Intentar login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        console.error("Error de login:", signInError);
        
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Correo o contraseña incorrectos. Por favor intenta de nuevo.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Por favor verifica tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.");
        } else if (signInError.message.includes("User not found")) {
          setError("Esta cuenta no existe. Por favor regístrate primero.");
        } else {
          setError("Error al iniciar sesión. Por favor verifica tus credenciales.");
        }
        setLoading(false);
        return;
      }

      // Verificar que el usuario existe en la base de datos
      if (data?.user) {
        console.log("Usuario autenticado:", data.user.id);

        // Verificar si el perfil del usuario existe
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error al verificar perfil:", profileError);
          setError("Error al cargar tu perfil. Por favor intenta de nuevo.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // ✅ Si no existe el perfil, crearlo (usuarios antiguos o migrados)
        if (!profile) {
          console.log("📝 Perfil no encontrado, creando uno nuevo...");
          
          const userName = data.user.user_metadata?.name || 
                          data.user.user_metadata?.display_name ||
                          data.user.email?.split('@')[0] || 
                          "Usuario";
          
          const { error: createError } = await supabase
            .from("users")
            .insert({
              auth_id: data.user.id,
              name: userName,
              email: data.user.email,
              points: 0,
              predictions: 0,
              correct: 0,
              weekly_points: 0,
              weekly_predictions: 0,
              weekly_correct: 0,
              current_streak: 0,
              best_streak: 0
            });

          if (createError) {
            console.error("Error al crear perfil:", createError);
            
            // Si es duplicado, ignorar
            if (createError.code !== '23505') {
              setError("Error al crear tu perfil. Por favor contacta al soporte.");
              await supabase.auth.signOut();
              setLoading(false);
              return;
            }
          }

          console.log("✅ Perfil creado exitosamente");
        }

        // Login exitoso
        console.log("✅ Inicio de sesión exitoso, redirigiendo...");
        navigate("/app");
      }

    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>GlobalScore</h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '14px', 
          marginBottom: '20px',
          textAlign: 'center' 
        }}>
          Inicia sesión para comenzar a predecir
        </p>

        <form onSubmit={login} style={{ width: '100%' }}>
          <input
            type="email"
            placeholder="Tu Correo Electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="email"
            required
            style={{
              borderColor: error && email === "" ? '#EF4444' : undefined
            }}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="current-password"
              required
              style={{
                borderColor: error && password === "" ? '#EF4444' : undefined,
                paddingRight: '40px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            className="btn" 
            type="submit" 
            disabled={loading || !email || !password}
            style={{
              opacity: loading || !email || !password ? 0.6 : 1,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}/> 
                Iniciando sesión...
              </span>
            ) : "Entrar"}
          </button>
        </form>

        <div className="auth-alt">
          <Link to="/forgot-password">¿Olvidaste tu Contraseña?</Link>
          <Link to="/register" style={{ fontWeight: 'bold' }}>
            Crear Cuenta
          </Link>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          💡 <strong>¿Nuevo aquí?</strong> ¡Crea una cuenta para comenzar a predecir partidos!
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}