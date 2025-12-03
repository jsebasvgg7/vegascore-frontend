// src/components/Header.jsx
import React, { useState } from "react";
import { Trophy, LogOut, User2, Award, Shield, Info, X } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) {
  const navigate = useNavigate();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const position = currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleRankingClick = () => {
    navigate("/ranking");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="logo-box">
            <Trophy size={28} />
          </div>
          <div className="title-wrap">
            <h1 className="app-title">GlobalScore</h1>
            <div className="app-sub">Inicio</div>
          </div>
        </div>

        <div className="header-right">
          {/* Botón de Instrucciones */}
          <button 
            className="icon-btn install-btn" 
            onClick={() => setShowInstallGuide(true)} 
            aria-label="Instrucciones de instalación"
            title="¿Cómo instalar la app?"
          >
            <Info size={18} />
          </button>

          {/* Botón de admin */}
          {currentUser?.is_admin && (
            <button 
              className="icon-btn admin-btn" 
              onClick={handleAdminClick} 
              aria-label="Panel de administración"
              title="Panel de Administración"
            >
              <Shield size={18} />
            </button>
          )}

          {/* Botón de ranking */}
          <button 
            className="icon-btn ranking-btn" 
            onClick={handleRankingClick} 
            aria-label="Ver ranking"
            title="Ver Ranking Global"
          >
            <Award size={18} />
            {position > 0 && <span className="position-badge">#{position}</span>}
          </button>

          {/* Botón de perfil */}
          <button 
            className="icon-btn profile-btn" 
            onClick={onProfileClick} 
            aria-label="Ver perfil"
            title="Ver Perfil"
          >
            <User2 size={18} />
          </button>

          {/* Botón de logout */}
          <button 
            className="icon-btn" 
            onClick={handleLogout} 
            aria-label="Cerrar sesión"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Modal de Instrucciones */}
      {showInstallGuide && (
        <div className="install-guide-overlay" onClick={() => setShowInstallGuide(false)}>
          <div className="install-guide-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="install-guide-close" 
              onClick={() => setShowInstallGuide(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="install-guide-header">
              <div className="install-guide-icon">
                <Trophy size={32} />
              </div>
              <h2>Instala GlobalScore en tu dispositivo</h2>
              <p>Accede más rápido y disfruta de una experiencia como app nativa</p>
            </div>

            <div className="install-guide-content">
              {/* Instrucciones para Android/Chrome */}
              <div className="install-section">
                <div className="install-section-title">
                  <span className="platform-badge android">Android / Chrome</span>
                </div>
                <ol className="install-steps">
                  <li>
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <strong>Abre el menú del navegador</strong>
                      <p>Toca los tres puntos (⋮) en la esquina superior derecha</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <strong>Selecciona "Agregar a pantalla de inicio"</strong>
                      <p>o "Instalar aplicación"</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <strong>Confirma la instalación</strong>
                      <p>Toca "Agregar" o "Instalar"</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Instrucciones para iOS/Safari */}
              <div className="install-section">
                <div className="install-section-title">
                  <span className="platform-badge ios">iOS / Safari</span>
                </div>
                <ol className="install-steps">
                  <li>
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <strong>Toca el botón de compartir</strong>
                      <p>Icono de compartir (□↑) en la parte inferior</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <strong>Desplázate y selecciona</strong>
                      <p>"Agregar a pantalla de inicio"</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <strong>Confirma</strong>
                      <p>Toca "Agregar" en la esquina superior derecha</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="install-guide-footer">
              <div className="install-tip">
                <Info size={16} />
                <span>Una vez instalada, encontrarás GlobalScore en tu pantalla de inicio como cualquier otra app</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}