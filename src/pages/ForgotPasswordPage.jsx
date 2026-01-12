import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/pagesStyles/Auth.css";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Por favor ingresa tu correo");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage(
        "¡Revisa tu correo! Te hemos enviado un enlace para restablecer tu contraseña"
      );
      setEmail("");
    } catch (err) {
      setError(err.message || "Ocurrió un error. Por favor intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo para recibir un enlace de recuperación</p>

        <form onSubmit={handleResetPassword}>
          <input
            type="email"
            placeholder="Tu Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="loading-spinner" /> 
                Enviando...
              </span>
            ) : "Enviar Enlace"}
          </button>
        </form>

        <div className="auth-alt">
          <Link to="/">Volver a Entrar</Link>
          <Link to="/register">Crear Cuenta</Link>
        </div>
      </div>
    </div>
  );
}