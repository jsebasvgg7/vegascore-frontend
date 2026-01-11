import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import "../styles/pagesStyles/Auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateName = (name) => {
    const regex = /^[a-zA-ZÀ-ÿ\s]{3,50}$/;
    return regex.test(name.trim());
  };

  const register = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (!validateName(name)) {
      setError("El nombre debe tener entre 3 y 50 caracteres y solo contener letras");
      return;
    }

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (!password) {
      setError("Por favor ingresa una contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      // 1. Verificar si el email ya existe en users
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error al verificar email:", checkError);
        setError("Error al verificar el correo. Por favor intenta de nuevo.");
        setLoading(false);
        return;
      }

      if (existingUser) {
        setError("Este correo ya está registrado. Por favor inicia sesión.");
        setLoading(false);
        return;
      }

      // 2. Crear cuenta de autenticación CON METADATA
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(), // ← GUARDAMOS EL NOMBRE EN METADATA
            display_name: name.trim()
          }
        }
      });

      if (signUpError) {
        console.error("Error de registro:", signUpError);
        
        if (signUpError.message.includes("already registered")) {
          setError("Este correo ya está registrado. Por favor inicia sesión.");
        } else if (signUpError.message.includes("Password")) {
          setError("La contraseña es muy débil. Usa al menos 6 caracteres.");
        } else {
          setError(`Error al registrarse: ${signUpError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setError("No se pudo crear la cuenta. Por favor intenta de nuevo.");
        setLoading(false);
        return;
      }

      console.log("✅ Usuario de autenticación creado:", authData.user.id);

      // 3. Crear perfil en la base de datos INMEDIATAMENTE
      console.log("📝 Creando perfil en base de datos...");
      
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          auth_id: authData.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          points: 0,
          predictions: 0,
          correct: 0,
          weekly_points: 0,
          weekly_predictions: 0,
          weekly_correct: 0,
          current_streak: 0,
          best_streak: 0
        });

      if (insertError) {
        console.error("Error al crear perfil:", insertError);
        
        // Si ya existe (duplicado), ignorar el error
        if (insertError.code === '23505') {
          console.log("⚠️ El perfil ya existe, continuando...");
        } else {
          // Si es otro error, eliminar el usuario de auth
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.error("Error signing out:", e);
          }
          
          setError("No se pudo crear el perfil. Por favor intenta de nuevo.");
          setLoading(false);
          return;
        }
      } else {
        console.log("✅ Perfil creado exitosamente");
      }

      // 4. Registro exitoso
      setSuccess(
        "¡Cuenta creada exitosamente! " +
        (authData.user.identities?.length === 0 
          ? "Ya puedes iniciar sesión." 
          : "Por favor revisa tu correo para verificar tu cuenta.")
      );

      // Limpiar formulario
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);

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
        <h2>Crear Cuenta</h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '14px', 
          marginBottom: '20px',
          textAlign: 'center' 
        }}>
          Únete a GlobalScore y comienza a predecir
        </p>

        <form onSubmit={register} style={{ width: '100%' }}>
          <input
            type="text"
            placeholder="Nombre Completo"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="name"
            required
            minLength={3}
            maxLength={50}
            style={{
              borderColor: error && !name.trim() ? '#EF4444' : undefined
            }}
          />

          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="email"
            required
            style={{
              borderColor: error && !email.trim() ? '#EF4444' : undefined
            }}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="new-password"
              required
              minLength={6}
              style={{
                borderColor: error && !password ? '#EF4444' : undefined,
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
                padding: '4px'
              }}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="new-password"
              required
              minLength={6}
              style={{
                borderColor: error && password !== confirmPassword ? '#EF4444' : undefined,
                paddingRight: '40px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {password && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--glass)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '12px'
            }}>
              Seguridad de la contraseña: {
                password.length < 6 ? '❌ Muy corta' :
                password.length < 8 ? '⚠️ Débil' :
                password.length < 12 ? '✅ Buena' :
                '🔒 Fuerte'
              }
            </div>
          )}

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

          {success && (
            <div style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10B981',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              ✅ {success}
            </div>
          )}

          <button 
            className="btn" 
            type="submit" 
            disabled={loading || !name || !email || !password || !confirmPassword}
            style={{
              opacity: loading || !name || !email || !password || !confirmPassword ? 0.6 : 1,
              cursor: loading || !name || !email || !password || !confirmPassword ? 'not-allowed' : 'pointer'
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
                Creando Cuenta...
              </span>
            ) : "Registrarse"}
          </button>
        </form>

        <div className="auth-alt">
          <span style={{ color: 'var(--text-secondary)' }}>¿Ya tienes cuenta?</span>
          <Link to="/" style={{ fontWeight: 'bold' }}>Iniciar Sesión</Link>
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
          🔒 Tus datos están seguros y nunca serán compartidos
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