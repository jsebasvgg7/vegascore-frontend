// src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

// Hooks personalizados
import { useAdminData } from '../hooks/adminHooks/useAdminData';
import { useAdminMatches } from '../hooks/adminHooks/useAdminMatches';
import { useAdminLeagues } from '../hooks/adminHooks/useAdminLeagues';
import { useAdminAwards } from '../hooks/adminHooks/useAdminAwards';
import { useAdminAchievements } from '../hooks/adminHooks/useAdminAchievements';
import { useAdminCrowns } from '../hooks/adminHooks/useAdminCrowns'; // ⬅️ NUEVO

// Utils
import { getFilteredItems, calculateStats } from '../utils/adminFilters';

// Componentes
import AdminStatsOverview from '../components/adminComponents/AdminStatsOverview';
import AdminNavigationTabs from '../components/adminComponents/AdminNavigationTabs';
import AdminControls from '../components/adminComponents/AdminControls';
import AdminMatchesList from '../components/adminComponents/AdminMatchesList';
import AdminLeaguesList from '../components/adminComponents/AdminLeaguesList';
import AdminAwardsList from '../components/adminComponents/AdminAwardsList';
import AdminAchievementsList from '../components/adminComponents/AdminAchievementsList';
import AdminTitlesList from '../components/adminComponents/AdminTitlesList';
import AdminCrownsSection from '../components/adminComponents/AdminCrownsSection';
import AdminModalsContainer from '../components/adminComponents/AdminModalsContainer';
import Footer from '../components/Footer';
import { ToastContainer, useToast } from '../components/Toast';

import '../styles/adminStyles/AdminPage.css';

export default function AdminPage({ currentUser }) {
  // Estados de UI
  const [activeSection, setActiveSection] = useState('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados de modales
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [showCrownModal, setShowCrownModal] = useState(false);
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [itemToFinish, setItemToFinish] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const toast = useToast();

  // Cargar datos
  const {
    matches,
    leagues,
    awards,
    achievements,
    titles,
    users,
    crownHistory,
    loading,
    loadData
  } = useAdminData();

  // Hooks de funcionalidad
  const { handleAddMatch, handleFinishMatch, handleDeleteMatch } = useAdminMatches(
    currentUser,
    loadData,
    toast
  );

  const { handleAddLeague, handleFinishLeague, handleDeleteLeague } = useAdminLeagues(
    loadData,
    toast
  );

  const { handleAddAward, handleFinishAward, handleDeleteAward } = useAdminAwards(
    loadData,
    toast
  );

  const { 
    handleSaveAchievement, 
    handleDeleteAchievement, 
    handleSaveTitle, 
    handleDeleteTitle 
  } = useAdminAchievements(loadData, toast);

  // ⬇️ NUEVO: Hook para coronas
  const { handleAwardCrown, handleResetMonthlyStats } = useAdminCrowns(loadData, toast);

  // Handlers
  const handleAddNew = () => {
    if (activeSection === 'matches') setShowMatchModal(true);
    if (activeSection === 'leagues') setShowLeagueModal(true);
    if (activeSection === 'awards') setShowAwardModal(true);
    if (activeSection === 'achievements') setShowAchievementModal(true);
    if (activeSection === 'titles') setShowTitleModal(true);
    if (activeSection === 'crowns') setShowCrownModal(true);
  };

  // Calcular datos filtrados y stats
  const filteredItems = getFilteredItems(
    activeSection,
    searchTerm,
    filterStatus,
    { matches, leagues, awards, achievements, titles, users, crownHistory }
  );

  const stats = calculateStats({ 
    matches, 
    leagues, 
    awards, 
    achievements, 
    titles, 
    crownHistory 
  });

  const currentMonth = new Date().toISOString().slice(0, 7);

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
          {/* Stats Overview */}
          <AdminStatsOverview stats={stats} />

          {/* Navigation Tabs */}
          <AdminNavigationTabs 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            stats={stats}
          />

          {/* Controls */}
          <AdminControls
            activeSection={activeSection}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onAddNew={handleAddNew}
          />

          {/* Content Area */}
          <div className="admin-content-area">
            {activeSection === 'matches' && (
              <AdminMatchesList
                matches={Array.isArray(filteredItems) ? filteredItems : []}
                onFinish={(match) => {
                  setItemToFinish(match);
                  setShowFinishMatchModal(true);
                }}
                onDelete={handleDeleteMatch}
              />
            )}

            {activeSection === 'leagues' && (
              <AdminLeaguesList
                leagues={Array.isArray(filteredItems) ? filteredItems : []}
                onFinish={(league) => {
                  setItemToFinish(league);
                  setShowFinishLeagueModal(true);
                }}
                onDelete={handleDeleteLeague}
              />
            )}

            {activeSection === 'awards' && (
              <AdminAwardsList
                awards={Array.isArray(filteredItems) ? filteredItems : []}
                onFinish={(award) => {
                  setItemToFinish(award);
                  setShowFinishAwardModal(true);
                }}
                onDelete={handleDeleteAward}
              />
            )}

            {activeSection === 'achievements' && (
              <AdminAchievementsList
                achievements={Array.isArray(filteredItems) ? filteredItems : []}
                onEdit={(achievement) => {
                  setEditingItem(achievement);
                  setShowAchievementModal(true);
                }}
                onDelete={handleDeleteAchievement}
              />
            )}

            {activeSection === 'titles' && (
              <AdminTitlesList
                titles={Array.isArray(filteredItems) ? filteredItems : []}
                onEdit={(title) => {
                  setEditingItem(title);
                  setShowTitleModal(true);
                }}
                onDelete={handleDeleteTitle}
              />
            )}

            {activeSection === 'crowns' && (
              <AdminCrownsSection
                top10={filteredItems.top10}
                history={filteredItems.history}
                onResetStats={handleResetMonthlyStats}
              />
            )}

            {/* Empty State */}
            {((Array.isArray(filteredItems) && filteredItems.length === 0) || 
              (!Array.isArray(filteredItems) && activeSection !== 'crowns')) && (
              <div className="admin-empty-state">
                <AlertCircle size={48} />
                <p>No hay {activeSection} para mostrar</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Modales */}
      <AdminModalsContainer
        // Match modals
        showMatchModal={showMatchModal}
        setShowMatchModal={setShowMatchModal}
        handleAddMatch={handleAddMatch}
        showFinishMatchModal={showFinishMatchModal}
        setShowFinishMatchModal={setShowFinishMatchModal}
        handleFinishMatch={handleFinishMatch}
        
        // League modals
        showLeagueModal={showLeagueModal}
        setShowLeagueModal={setShowLeagueModal}
        handleAddLeague={handleAddLeague}
        showFinishLeagueModal={showFinishLeagueModal}
        setShowFinishLeagueModal={setShowFinishLeagueModal}
        handleFinishLeague={handleFinishLeague}
        
        // Award modals
        showAwardModal={showAwardModal}
        setShowAwardModal={setShowAwardModal}
        handleAddAward={handleAddAward}
        showFinishAwardModal={showFinishAwardModal}
        setShowFinishAwardModal={setShowFinishAwardModal}
        handleFinishAward={handleFinishAward}
        
        // Achievement modals
        showAchievementModal={showAchievementModal}
        setShowAchievementModal={setShowAchievementModal}
        handleSaveAchievement={handleSaveAchievement}
        handleDeleteAchievement={handleDeleteAchievement}
        
        // Title modals
        showTitleModal={showTitleModal}
        setShowTitleModal={setShowTitleModal}
        handleSaveTitle={handleSaveTitle}
        handleDeleteTitle={handleDeleteTitle}
        
        // Crown modal - ⬇️ ACTUALIZADO
        showCrownModal={showCrownModal}
        setShowCrownModal={setShowCrownModal}
        handleAwardCrown={handleAwardCrown}
        
        // Shared states
        itemToFinish={itemToFinish}
        setItemToFinish={setItemToFinish}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        users={users}
        currentMonth={currentMonth}
        currentUser={currentUser}
      />

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}