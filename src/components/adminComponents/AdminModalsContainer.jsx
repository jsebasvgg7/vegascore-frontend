// src/components/adminComponents/AdminModalsContainer.jsx
import React from 'react';
import AdminModal from './AdminModal';
import AdminLeagueModal from './AdminLeagueModal';
import AdminAwardModal from './AdminAwardModal';
import FinishMatchModal from './FinishMatchModal';
import AdminAchievementsModal from './AdminAchievementsModal';
import AdminTitlesModal from './AdminTitlesModal';
import FinishLeagueModal from './FinishLeagueModal';
import FinishAwardModal from './FinishAwardModal';
import AdminCrownModal from './AdminCrownModal';

export default function AdminModalsContainer({
  // Match modals
  showMatchModal,
  setShowMatchModal,
  handleAddMatch,
  showFinishMatchModal,
  setShowFinishMatchModal,
  handleFinishMatch,
  
  // League modals
  showLeagueModal,
  setShowLeagueModal,
  handleAddLeague,
  showFinishLeagueModal,
  setShowFinishLeagueModal,
  handleFinishLeague,
  
  // Award modals
  showAwardModal,
  setShowAwardModal,
  handleAddAward,
  showFinishAwardModal,
  setShowFinishAwardModal,
  handleFinishAward,
  
  // Achievement modals
  showAchievementModal,
  setShowAchievementModal,
  handleSaveAchievement,
  handleDeleteAchievement,
  
  // Title modals
  showTitleModal,
  setShowTitleModal,
  handleSaveTitle,
  handleDeleteTitle,
  
  // Crown modal
  showCrownModal,
  setShowCrownModal,
  handleAwardCrown,
  
  // Shared states
  itemToFinish,
  setItemToFinish,
  editingItem,
  setEditingItem,
  users,
  currentMonth
}) {
  return (
    <>
      {/* Match Modals */}
      {showMatchModal && (
        <AdminModal 
          onAdd={handleAddMatch} 
          onClose={() => setShowMatchModal(false)} 
        />
      )}

      {showFinishMatchModal && itemToFinish && (
        <FinishMatchModal 
          match={itemToFinish}
          onFinish={handleFinishMatch}
          onClose={() => {
            setShowFinishMatchModal(false);
            setItemToFinish(null);
          }}
        />
      )}

      {/* League Modals */}
      {showLeagueModal && (
        <AdminLeagueModal 
          onAdd={handleAddLeague} 
          onClose={() => setShowLeagueModal(false)} 
        />
      )}

      {showFinishLeagueModal && itemToFinish && (
        <FinishLeagueModal 
          league={itemToFinish}
          onFinish={handleFinishLeague}
          onClose={() => {
            setShowFinishLeagueModal(false);
            setItemToFinish(null);
          }}
        />
      )}

      {/* Award Modals */}
      {showAwardModal && (
        <AdminAwardModal 
          onAdd={handleAddAward}
          onClose={() => setShowAwardModal(false)}
        />
      )}

      {showFinishAwardModal && itemToFinish && (
        <FinishAwardModal 
          award={itemToFinish}
          onFinish={handleFinishAward}
          onClose={() => {
            setShowFinishAwardModal(false);
            setItemToFinish(null);
          }}
        />
      )}

      {/* Achievement Modal */}
      {showAchievementModal && (
        <AdminAchievementsModal
          onClose={() => {
            setShowAchievementModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveAchievement}
          onDelete={handleDeleteAchievement}
          existingAchievement={editingItem}
        />
      )}

      {/* Title Modal */}
      {showTitleModal && (
        <AdminTitlesModal
          onClose={() => {
            setShowTitleModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveTitle}
          onDelete={handleDeleteTitle}
          existingTitle={editingItem}
        />
      )}

      {/* Crown Modal */}
      {showCrownModal && (
        <AdminCrownModal 
          onClose={() => setShowCrownModal(false)}
          onAward={handleAwardCrown}
          currentTopUser={users[0]}
          currentMonth={currentMonth}
        />
      )}
    </>
  );
}