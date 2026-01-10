import React from "react";
import { Trophy, LogOut, User2, Award, Shield, Bell, Home, BarChart3, Moon, Sun } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "../styles/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const position = currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleHomeClick = () => {
    navigate("/app");
  };

  const handleRankingClick = () => {
    navigate("/ranking");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  const handleStatsClick = () => {
    navigate("/stats");
  };

  const handleWorldCupClick = () => {
    navigate("/worldcup");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Header Superior */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="icon-btn logout-btn" 
            onClick={handleLogout} 
            aria-label="Cerrar sesión"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="header-center">
          <h1 className="app-title">GlobalScore</h1>
        </div>

        <div className="header-right">
          <button 
            className="icon-btn notifications-btn" 
            onClick={handleNotificationsClick} 
            aria-label="Ver notificaciones"
            title="Notificaciones"
          >
            <Bell size={18} />
          </button>

          <button 
            className="icon-btn theme-btn" 
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Botones solo para desktop */}
          <button
            className="icon-btn worldcup-btn desktop-only"
            onClick={handleWorldCupClick}
            aria-label="Ver sección del Mundial"
            title="Mundial 2026"
          >
            <Trophy size={18} />
          </button>
          
          <button 
            className="icon-btn stats-btn desktop-only" 
            onClick={handleStatsClick}
            aria-label="Ver estadísticas"
            title="Ver Estadísticas"
          >
            <BarChart3 size={18} />
          </button>

          {currentUser?.is_admin && (
            <button 
              className="icon-btn admin-btn desktop-only" 
              onClick={handleAdminClick} 
              aria-label="Panel de administración"
              title="Panel de Administración"
            >
              <Shield size={18} />
            </button>
          )}

          <button 
            className="icon-btn ranking-btn desktop-only" 
            onClick={handleRankingClick} 
            aria-label="Ver ranking"
            title="Ver Ranking Global"
          >
            <Award size={18} />
          </button>

          <button 
            className="icon-btn profile-btn desktop-only" 
            onClick={handleProfileClick} 
            aria-label="Ver perfil"
            title="Ver Perfil"
          >
            <User2 size={18} />
          </button>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`bottom-nav-btn ${isActive('/app') ? 'active' : ''}`}
          onClick={handleHomeClick}
          aria-label="Inicio"
        >
          <Home size={24} />
        </button>

        <button 
          className={`bottom-nav-btn ${isActive('/ranking') ? 'active' : ''}`}
          onClick={handleRankingClick}
          aria-label="Ranking"
        >
          <Award size={24} />
        </button>
        
        <button 
          className={`bottom-nav-btn ${isActive('/worldcup') ? 'active' : ''}`}
          onClick={handleWorldCupClick}
          aria-label="Mundial"
        >
          <Trophy size={24} />
        </button>
        
        <button 
          className={`bottom-nav-btn ${isActive('/stats') ? 'active' : ''}`}
          onClick={handleStatsClick}
          aria-label="Estadísticas"
        >
          <BarChart3 size={24} />
        </button>

        {currentUser?.is_admin && (
          <button 
            className={`bottom-nav-btn ${isActive('/admin') ? 'active' : ''}`}
            onClick={handleAdminClick}
            aria-label="Admin"
          >
            <Shield size={24} />
          </button>
        )}

        <button 
          className={`bottom-nav-btn ${isActive('/profile') ? 'active' : ''}`}
          onClick={handleProfileClick}
          aria-label="Perfil"
        >
          <User2 size={24} />
        </button>
      </nav>
    </>
  );
}