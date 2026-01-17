import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import LoadingDots from "../components/LoadingSpinner";
import "../styles/pagesStyles/Auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    if (!name.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (!validateName(name)) {
      setError("El nombre debe tener entre 3 y 50 caracteres");
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

    setLoading(true);

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error al verificar email:", checkError);
        setError("Error al verificar el correo");
        setLoading(false);
        return;
      }

      if (existingUser) {
        setError("Este correo ya está registrado");
        setLoading(false);
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            display_name: name.trim()
          }
        }
      });

      if (signUpError) {
        console.error("Error de registro:", signUpError);
        
        if (signUpError.message.includes("already registered")) {
          setError("Este correo ya está registrado");
        } else if (signUpError.message.includes("Password")) {
          setError("La contraseña es muy débil");
        } else {
          setError(`Error al registrarse: ${signUpError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setError("No se pudo crear la cuenta");
        setLoading(false);
        return;
      }

      console.log("✅ Usuario de autenticación creado:", authData.user.id);
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

      if (insertError && insertError.code !== '23505') {
        console.error("Error al crear perfil:", insertError);
        
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error("Error signing out:", e);
        }
        
        setError("No se pudo crear el perfil");
        setLoading(false);
        return;
      }

      console.log("✅ Perfil creado exitosamente");

      setSuccess(
        "¡Cuenta creada exitosamente! " +
        (authData.user.identities?.length === 0 
          ? "Ya puedes iniciar sesión." 
          : "Revisa tu correo para verificar tu cuenta.")
      );

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Crear cuenta</h2>
        <p>Crea tu cuenta y predice!!</p>

        <form onSubmit={register}>
          <input
            type="text"
            placeholder="Nombre"
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
          />

          <input
            type="email"
            placeholder="Correo electronico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="email"
            required
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="new-password"
              required
              minLength={6}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {password && (
            <div className="password-strength">
              Seguridad: {
                password.length < 6 ? '❌ Muy corta' :
                password.length < 8 ? '⚠️ Débil' :
                password.length < 12 ? '✅ Buena' :
                '🔒 Fuerte'
              }
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button 
            className="btn" 
            type="submit" 
            disabled={loading || !name || !email || !password}
          >
            {loading ? (
              <span className="btn-loading">
                <LoadingDots />
                <span>Creando cuenta...</span>
              </span>
            ) : "Registrarse"}
          </button>
        </form>

        <div className="auth-alt">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/">Entrar</Link>
        </div>

        <div className="info-box">
          🔒 Tus datos están seguros y protegidos
        </div>
      </div>
    </div>
  );
}