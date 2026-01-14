import React, { useState } from "react";
import { X, Plus, Calendar, Clock, Shield, Zap, Home, Plane } from "lucide-react";
import { getLogoUrlByTeamName, getLeagueLogoUrlDirect } from "../utils/logoHelper.js";
import { supabase } from "../utils/supabaseClient";
import "../styles/adminStyles/AdminModal.css";

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: "",
    league: "",
    home_team: "",
    away_team: "",
    home_team_logo: "🏠",
    away_team_logo: "✈️",
    date: "",
    time: "",
    deadLine: "",
    deadLine_time: ""
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Auto-generar las URLs de logos cuando se ingresen los nombres de equipos
    if (name === 'home_team' && value && form.league) {
      const logoUrl = getLogoUrlByTeamName(supabase, value, form.league);
      if (logoUrl) {
        setForm(prev => ({ ...prev, home_team_logo_url: logoUrl }));
      }
    }
    
    if (name === 'away_team' && value && form.league) {
      const logoUrl = getLogoUrlByTeamName(supabase, value, form.league);
      if (logoUrl) {
        setForm(prev => ({ ...prev, away_team_logo_url: logoUrl }));
      }
    }
    
    // Si cambia la liga, recalcular ambos logos de equipos Y el logo de la liga
    if (name === 'league' && value) {
      // Logo de la liga
      const leagueLogoUrl = getLeagueLogoUrlDirect(value);
      if (leagueLogoUrl) {
        setForm(prev => ({ ...prev, league_logo_url: leagueLogoUrl }));
      }
      
      // Logos de equipos
      if (form.home_team) {
        const homeLogo = getLogoUrlByTeamName(supabase, form.home_team, value);
        if (homeLogo) setForm(prev => ({ ...prev, home_team_logo_url: homeLogo }));
      }
      if (form.away_team) {
        const awayLogo = getLogoUrlByTeamName(supabase, form.away_team, value);
        if (awayLogo) setForm(prev => ({ ...prev, away_team_logo_url: awayLogo }));
      }
    }
  };

  const sendPushNotification = async (matchData) => {
    try {
      // Enviar notificación push a través de Edge Function
      const { error } = await supabase.functions.invoke('send-push', {
        body: {
          matchId: matchData.id,
          title: '🔥 ¡Nuevo partido disponible!',
          body: `${matchData.home_team} vs ${matchData.away_team} - ${matchData.league}`,
          url: `/matches/${matchData.id}`,
          league: matchData.league,
          date: matchData.date,
          time: matchData.time
        }
      });

      if (error) {
        console.error('Error enviando notificación push:', error);
      } else {
        console.log('✅ Notificación push enviada exitosamente');
      }
    } catch (error) {
      console.error('Error en sendPushNotification:', error);
    }
  };

  const submit = async () => {
    if (!form.id || !form.home_team || !form.away_team || !form.date || !form.time || !form.deadLine || !form.deadLine_time) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setSending(true);

    try {
      // Combinar fecha y hora del deadline en formato ISO
      const deadlineISO = `${form.deadLine}T${form.deadLine_time}:00`;

      // Generar URLs de logos automáticamente
      const homeLogoUrl = getLogoUrlByTeamName(supabase, form.home_team, form.league);
      const awayLogoUrl = getLogoUrlByTeamName(supabase, form.away_team, form.league);
      const leagueLogoUrl = getLeagueLogoUrlDirect(form.league);

      const matchData = {
        id: form.id,
        league: form.league,
        home_team: form.home_team,
        away_team: form.away_team,
        home_team_logo: form.home_team_logo,
        away_team_logo: form.away_team_logo,
        home_team_logo_url: homeLogoUrl,
        away_team_logo_url: awayLogoUrl,
        league_logo_url: leagueLogoUrl,
        date: form.date,
        time: form.time,
        deadline: deadlineISO,
        status: "pending",
      };

      // Agregar el partido
      onAdd(matchData);

      // Enviar notificación push (sin esperar)
      sendPushNotification(matchData);

      onClose();
    } catch (error) {
      console.error('Error al crear partido:', error);
      alert('Error al crear el partido');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop-premium">
      <div className="modal-premium">
        {/* Header con gradiente */}
        <div className="modal-header-premium">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="modal-title-premium">Agregar Nuevo Partido</h2>
              <p className="modal-subtitle-premium">Completa la información del partido</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Formulario con diseño mejorado */}
        <div className="modal-body-premium">
          {/* ID del partido */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Zap size={14} />
              <span>ID del Partido</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="id" 
              placeholder="Ej: match-001" 
              value={form.id}
              onChange={handleChange}
            />
            <span className="form-hint">Identificador único del partido</span>
          </div>

          {/* Liga */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Shield size={14} />
              <span>Liga o Competición</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="league" 
              placeholder="Ej: Premier League, La Liga, Champions League" 
              value={form.league}
              onChange={handleChange}
            />
            <span className="form-hint">Los logos se asignarán automáticamente según la liga</span>
          </div>

          {/* Vista previa del logo de la liga */}
          {form.league && form.league_logo_url && (
            <div className="logo-preview-section">
              <div className="logo-preview-item">
                <span className="logo-preview-label">Logo de la Liga:</span>
                <img src={form.league_logo_url} alt="League" className="logo-preview-img" />
              </div>
            </div>
          )}

          {/* Equipos en grid */}
          <div className="teams-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Home size={14} />
                <span>Equipo Local</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="home_team" 
                placeholder="MUN" 
                value={form.home_team}
                onChange={handleChange}
              />
              <span className="form-hint">Usa código de 3 letras (MUN, BAR, RMA)</span>
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Plane size={14} />
                <span>Equipo Visitante</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="away_team" 
                placeholder="LIV" 
                value={form.away_team}
                onChange={handleChange}
              />
              <span className="form-hint">Usa código de 3 letras (LIV, ARS, CHE)</span>
            </div>
          </div>

          {/* Vista previa de logos */}
          {form.home_team && form.away_team && form.league && (
            <div className="logo-preview-section">
              <div className="logo-preview-item">
                <span className="logo-preview-label">Logo Local:</span>
                {form.home_team_logo_url ? (
                  <img src={form.home_team_logo_url} alt="Home" className="logo-preview-img" />
                ) : (
                  <span className="logo-preview-emoji">{form.home_team_logo}</span>
                )}
              </div>
              <div className="logo-preview-item">
                <span className="logo-preview-label">Logo Visitante:</span>
                {form.away_team_logo_url ? (
                  <img src={form.away_team_logo_url} alt="Away" className="logo-preview-img" />
                ) : (
                  <span className="logo-preview-emoji">{form.away_team_logo}</span>
                )}
              </div>
            </div>
          )}

          {/* Fecha y hora del partido */}
          <div className="datetime-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Fecha del Partido</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="date" 
                type="date" 
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Clock size={14} />
                <span>Hora del Partido</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="time" 
                type="time" 
                value={form.time}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Fecha límite para predicciones */}
          <div className="datetime-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Fecha Límite Predicciones</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="deadLine" 
                type="date" 
                value={form.deadLine}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Clock size={14} />
                <span>Hora Límite Predicciones</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="deadLine_time" 
                type="time" 
                value={form.deadLine_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-hint" style={{ marginTop: '-10px', marginBottom: '10px' }}>
            Fecha y hora hasta la cual se pueden hacer predicciones
          </div>
        </div>

        {/* Footer con botones */}
        <div className="modal-footer-premium">
          <button className="modal-btn-premium secondary" onClick={onClose} disabled={sending}>
            Cancelar
          </button>
          <button className="modal-btn-premium primary" onClick={submit} disabled={sending}>
            <Plus size={18} />
            <span>{sending ? 'Enviando...' : 'Agregar Partido'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}