// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, Filter, Calendar, Trophy, CheckCircle2, 
  Clock, Target, Award, BellRing, BellOff
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Footers from '../components/Footer';
import '../styles/pagesStyles/NotificationsPage.css';

export default function NotificationsPage({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  useEffect(() => {
    loadNotifications();
    checkPushPermission();
  }, []);

  const checkPushPermission = async () => {
    setCheckingPermission(true);
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
    setCheckingPermission(false);
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifs = matches.map(match => {
        const isNew = match.status === 'pending';
        const isFinished = match.status === 'finished';
        
        return {
          id: match.id,
          type: isNew ? 'new' : 'finished',
          title: isNew ? '¡Nuevo partido disponible!' : '¡Partido finalizado!',
          description: `${match.home_team} vs ${match.away_team}`,
          league: match.league,
          date: match.date,
          time: match.time,
          result: isFinished ? `${match.result_home || 0} - ${match.result_away || 0}` : null,
          created_at: match.created_at,
          icon: isNew ? <Trophy size={20} /> : <CheckCircle2 size={20} />
        };
      });

      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    alert('Has bloqueado las notificaciones. Por favor, actívalas en la configuración de tu navegador.');
    return false;
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers no soportados');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return null;
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    try {
      const registration = await registerServiceWorker();
      if (!registration) {
        alert('Error al registrar Service Worker');
        return null;
      }

      const permitted = await requestNotificationPermission();
      if (!permitted) return null;

      const vapidPublicKey = 'BBxgmAtEOHeYNi1tJQcrWzL_Q-6_Mj16ECGgQSL6JPX0i9XyL5V5LFJHjNdde_TTRxAUXJHSYNtUOvXcAsYS_Xs';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Guardar suscripción en Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: currentUser.id,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('✅ Suscrito a notificaciones push');
      return subscription;

    } catch (error) {
      console.error('Error en suscripción push:', error);
      return null;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', currentUser.id);

      console.log('❌ Desuscrito de notificaciones push');
    } catch (error) {
      console.error('Error al desuscribirse:', error);
    }
  };

  const handleTogglePush = async () => {
    if (pushEnabled) {
      await unsubscribeFromPush();
      setPushEnabled(false);
      alert('Notificaciones desactivadas');
    } else {
      const subscription = await subscribeToPush();
      if (subscription) {
        setPushEnabled(true);
        alert('¡Notificaciones activadas! 🔔\nTe avisaremos de nuevos partidos.');
      }
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-title-section">
          <Bell size={32} className="bell-icon" />
          <div>
            <h1 className="page-title">Notificaciones</h1>
            <p className="page-subtitle">Mantente al día con todos los partidos</p>
          </div>
        </div>
        
        {/* Botón para activar/desactivar push notifications */}
        {!checkingPermission && (
          <button 
            className={`push-toggle-btn ${pushEnabled ? 'enabled' : ''}`}
            onClick={handleTogglePush}
          >
            {pushEnabled ? <BellRing size={20} /> : <BellOff size={20} />}
            <span>{pushEnabled ? 'Activadas' : 'Activar'}</span>
          </button>
        )}
      </div>

      <div className="notifications-container">
        {/* Banner informativo si las notificaciones están desactivadas */}
        {!pushEnabled && !checkingPermission && (
          <div className="push-info-banner">
            <div className="banner-icon-circle">
              <BellRing size={24} />
            </div>
            <div className="banner-text">
              <h4>Activa las notificaciones push</h4>
              <p>Recibe alertas cuando haya nuevos partidos o resultados</p>
            </div>
            <button onClick={handleTogglePush} className="activate-btn">
              Activar
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="notifications-filters">
          <button 
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Filter size={16} />
            <span>Todas</span>
            <span className="chip-count">{notifications.length}</span>
          </button>

          <button 
            className={`filter-chip ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            <Trophy size={16} />
            <span>Nuevas</span>
            <span className="chip-count">
              {notifications.filter(n => n.type === 'new').length}
            </span>
          </button>

          <button 
            className={`filter-chip ${filter === 'finished' ? 'active' : ''}`}
            onClick={() => setFilter('finished')}
          >
            <CheckCircle2 size={16} />
            <span>Finalizadas</span>
            <span className="chip-count">
              {notifications.filter(n => n.type === 'finished').length}
            </span>
          </button>
        </div>

        {/* Lista de Notificaciones */}
        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">
              <div className="spinner-ring"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={64} />
              <h3>No hay notificaciones</h3>
              <p>Cuando haya novedades, aparecerán aquí</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notification-card ${notif.type}`}
              >
                <div className={`notif-icon-wrapper ${notif.type}`}>
                  {notif.icon}
                </div>

                <div className="notif-content">
                  <div className="notif-header">
                    <h4 className="notif-title">{notif.title}</h4>
                  </div>

                  <p className="notif-description">{notif.description}</p>

                  <div className="notif-details">
                    <div className="detail-item">
                      <Award size={14} />
                      <span>{notif.league}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>{notif.date}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{notif.time}</span>
                    </div>
                  </div>

                  {notif.result && (
                    <div className="notif-result">
                      <Target size={16} />
                      <span className="result-score">{notif.result}</span>
                    </div>
                  )}
                </div>

                <div className={`notif-badge ${notif.type}`}>
                  {notif.type === 'new' ? 'Nuevo' : 'Finalizado'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footers />
    </div>
  );
}