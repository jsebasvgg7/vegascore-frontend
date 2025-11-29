// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Crear cuenta en auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 2. Crear perfil en users
    const { user } = data;

    await supabase.from("users").insert({
      auth_id: user.id,
      name: name,
    });

    alert("Cuenta creada. Verifica tu correo.");
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={register}>
        <h2>Crear Cuenta</h2>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn" disabled={loading}>
          {loading ? "Cargando..." : "Registrarse"}
        </button>

        <p className="auth-alt">
          ¿Ya tienes cuenta? <Link to="/">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}
