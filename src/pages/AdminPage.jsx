// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Shield, Plus, Edit2, Trash2, CheckCircle, X,
  Trophy, Target, Award, Calendar, Clock, Users, BarChart3,
  Zap, TrendingUp, Package, Filter, Search, AlertCircle
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useMatches } from '../hooks/useMatches'; // ✅ Importar hook
import AdminModal from '../components/AdminModal';
import AdminLeagueModal from '../components/adminComponents/AdminLeagueModal';
import AdminAwardModal from '../components/adminComponents/AdminAwardModal';
import FinishMatchModal from '../components/adminComponents/FinishMatchModal';
import AdminAchievementsModal from '../components/adminComponents/AdminAchievementsModal';
import Footer from '../components/Footer';
import AdminTitlesModal from '../components/adminComponents/AdminTitlesModal';
import FinishLeagueModal from '../components/adminComponents/FinishLeagueModal';
import FinishAwardModal from '../components/adminComponents/FinishAwardModal';
import { ToastContainer, useToast } from '../components/Toast';
import '../styles/adminStyles/AdminPage.css';

export default function AdminPage({ currentUser, onBack }) {
  const [activeSection, setActiveSection] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modales
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [itemToFinish, setItemToFinish] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const toast = useToast();

  // ✅ Usar el hook useMatches
  const { finishMatch: finishMatchFromHook, loading: matchLoading } = useMatches(currentUser);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchData, leagueData, awardData, achievementData, titleData] = await Promise.all([
        supabase.from('matches').select('*, predictions(*)'),
        supabase.from('leagues').select('*, league_predictions(*)'),
        supabase.from('awards').select('*, award_predictions(*)'),
        supabase.from('available_achievements').select('*'),
        supabase.from('available_titles').select('*')
      ]);

      setMatches(matchData.data || []);
      setLeagues(leagueData.data || []);
      setAwards(awardData.data || []);
      setAchievements(achievementData.data || []);
      setTitles(titleData.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLERS - MATCHES ==========
  const handleAddMatch = async (match) => {
    try {
      const { error } = await supabase.from('matches').insert(match);
      if (error) throw error;
      await loadData();
      toast.success(`✅ Partido ${match.home_team} vs ${match.away_team} agregado`, 4000);
      setShowMatchModal(false);
    } catch (err) {
      console.error('Error adding match:', err);
      toast.error('❌ Error al agregar el partido. Verifica los datos.');
    }
  };

  // ✅ USAR EL HOOK - Actualiza AMBOS rankings (Global + Semanal)
  const handleFinishMatch = async (matchId, homeScore, awayScore) => {
    try {
      await finishMatchFromHook(
        matchId, 
        homeScore, 
        awayScore,
        // onSuccess
        () => {
          loadData();
          toast.success(`⚽ Partido finalizado: ${homeScore} - ${awayScore}`, 4000);
          toast.success(`🔄 Rankings actualizados: Global + Semanal`, 3000);
          setShowFinishMatchModal(false);
          setItemToFinish(null);
        },
        // onError
        (error) => {
          toast.error(`❌ Error: ${error}`);
        }
      );
    } catch (err) {
      console.error('Error finishing match:', err);
      toast.error('❌ Error al finalizar el partido. Intenta de nuevo.');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return;
    
    try {
      const { error } = await supabase.from('matches').delete().eq('id', matchId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Partido eliminado correctamente', 3000);
    } catch (err) {
      console.error('Error deleting match:', err);
      toast.error('❌ Error al eliminar el partido');
    }
  };

  // ========== HANDLERS - LEAGUES ==========
  const handleAddLeague = async (league) => {
    try {
      const { error } = await supabase.from('leagues').insert(league);
      if (error) throw error;
      await loadData();
      toast.success(`🏆 Liga "${league.name}" agregada exitosamente`, 4000);
      setShowLeagueModal(false);
    } catch (err) {
      console.error('Error adding league:', err);
      toast.error('❌ Error al agregar la liga. Verifica los datos.');
    }
  };

  const handleFinishLeague = async (leagueId, results) => {
    try {
      await supabase
        .from('leagues')
        .update({ 
          status: 'finished',
          ...results
        })
        .eq('id', leagueId);

      await loadData();
      toast.success('🏆 Liga finalizada y resultados guardados', 4000);
      setShowFinishLeagueModal(false);
      setItemToFinish(null);
    } catch (err) {
      console.error('Error finishing league:', err);
      toast.error('❌ Error al finalizar la liga. Intenta de nuevo.');
    }
  };

  const handleDeleteLeague = async (leagueId) => {
    if (!confirm('¿Estás seguro de eliminar esta liga?')) return;
    
    try {
      const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Liga eliminada correctamente', 3000);
    } catch (err) {
      console.error('Error deleting league:', err);
      toast.error('❌ Error al eliminar la liga');
    }
  };

  // ========== HANDLERS - AWARDS ==========
  const handleAddAward = async (award) => {
    try {
      const { error } = await supabase.from('awards').insert(award);
      if (error) throw error;
      await loadData();
      toast.success(`🏅 Premio "${award.name}" agregado exitosamente`, 4000);
      setShowAwardModal(false);
    } catch (err) {
      console.error('Error adding award:', err);
      toast.error('❌ Error al agregar el premio. Verifica los datos.');
    }
  };

  const handleFinishAward = async (awardId, winner) => {
    try {
      await supabase
        .from('awards')
        .update({ status: 'finished', winner })
        .eq('id', awardId);

      await loadData();
      toast.success(`🏅 Premio finalizado. Ganador: ${winner}`, 4000);
      setShowFinishAwardModal(false);
      setItemToFinish(null);
    } catch (err) {
      console.error('Error finishing award:', err);
      toast.error('❌ Error al finalizar el premio. Intenta de nuevo.');
    }
  };

  const handleDeleteAward = async (awardId) => {
    if (!confirm('¿Estás seguro de eliminar este premio?')) return;
    
    try {
      const { error } = await supabase.from('awards').delete().eq('id', awardId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Premio eliminado correctamente', 3000);
    } catch (err) {
      console.error('Error deleting award:', err);
      toast.error('❌ Error al eliminar el premio');
    }
  };

  // ========== HANDLERS - ACHIEVEMENTS & TITLES ==========
  const handleSaveAchievement = async (achievement) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .upsert(achievement, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success(`⭐ Logro "${achievement.name}" guardado exitosamente`, 3000);
      setShowAchievementModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving achievement:', err);
      toast.error('❌ Error al guardar el logro');
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', achievementId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Logro eliminado correctamente', 3000);
      setShowAchievementModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error deleting achievement:', err);
      toast.error('❌ Error al eliminar el logro');
    }
  };

  const handleSaveTitle = async (title) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .upsert(title, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success(`👑 Título "${title.name}" guardado exitosamente`, 3000);
      setShowTitleModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving title:', err);
      toast.error('❌ Error al guardar el título');
    }
  };

  const handleDeleteTitle = async (titleId) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', titleId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Título eliminado correctamente', 3000);
      setShowTitleModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error deleting title:', err);
      toast.error('❌ Error al eliminar el título');
    }
  };

  // ========== FILTERS ==========
  const getFilteredItems = () => {
    let items = [];
    
    switch(activeSection) {
      case 'matches':
        items = matches;
        break;
      case 'leagues':
        items = leagues;
        break;
      case 'awards':
        items = awards;
        break;
      case 'achievements':
        items = achievements;
        break;
      case 'titles':
        items = titles;
        break;
      default:
        items = [];
    }

    if (searchTerm) {
      items = items.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all' && ['matches', 'leagues', 'awards'].includes(activeSection)) {
      items = items.filter(item => item.status === filterStatus);
    }

    return items;
  };

  // ========== STATS ==========
  const stats = {
    matches: {
      total: matches.length,
      pending: matches.filter(m => m.status === 'pending').length,
      finished: matches.filter(m => m.status === 'finished').length
    },
    leagues: {
      total: leagues.length,
      active: leagues.filter(l => l.status === 'active').length,
      finished: leagues.filter(l => l.status === 'finished').length
    },
    awards: {
      total: awards.length,
      active: awards.filter(a => a.status === 'active').length,
      finished: awards.filter(a => a.status === 'finished').length
    },
    achievements: {
      total: achievements.length
    },
    titles: {
      total: titles.length
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner-large"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-page-container">
          {/* Stats Overview - (código igual...) */}
          
          {/* Navigation Tabs - (código igual...) */}
          
          {/* Controls - (código igual...) */}
          
          {/* Content Area - (código igual...) */}
        </div>
        <Footer />
      </div>

      {/* Modales - (código igual...) */}
      
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}