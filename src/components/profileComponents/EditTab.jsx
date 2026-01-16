// src/components/profileComponents/EditTab.jsx
import React from 'react';
import { Edit2, User, Trophy, Heart, Flag, Star, Save, X, Activity } from 'lucide-react';
import AvatarUpload from './AvatarUpload';

export default function EditTab({ 
  userData, 
  setUserData, 
  currentUser,
  loading,
  handleSave,
  handleAvatarUpload,
  loadUserData,
  setActiveTab
}) {
  return (
    <div className="tab-content-wrapper">
      <div className="section-header-modern">
        <Edit2 size={18} />
        <h3>Editar Perfil</h3>
      </div>

      <div className="edit-avatar-wrapper">
        <AvatarUpload
          currentUrl={userData.avatar_url}
          userId={currentUser.id}
          onUploadComplete={handleAvatarUpload}
          userLevel={userData.level}
        />
      </div>

      <div className="edit-form-modern">
        <div className="form-group-modern">
          <label className="form-label-modern">
            <User size={16} />
            <span>Nombre Completo</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            placeholder="Tu nombre"
          />
        </div>

        <div className="form-group-modern">
          <label className="form-label-modern">
            <Trophy size={16} />
            <span>Equipo Favorito</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.favorite_team}
            onChange={(e) => setUserData({ ...userData, favorite_team: e.target.value })}
            placeholder="Ej: Real Madrid"
          />
        </div>

        <div className="form-group-modern">
          <label className="form-label-modern">
            <Heart size={16} />
            <span>Jugador Favorito</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.favorite_player}
            onChange={(e) => setUserData({ ...userData, favorite_player: e.target.value })}
            placeholder="Ej: Lionel Messi"
          />
        </div>

        <div className="form-group-modern">
          <label className="form-label-modern">
            <User size={16} />
            <span>Género</span>
          </label>
          <select
            className="form-select-modern"
            value={userData.gender}
            onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
            <option value="Prefiero no decir">Prefiero no decir</option>
          </select>
        </div>

        <div className="form-group-modern">
          <label className="form-label-modern">
            <Flag size={16} />
            <span>Nacionalidad</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.nationality}
            onChange={(e) => setUserData({ ...userData, nationality: e.target.value })}
            placeholder="Ej: Colombia"
          />
        </div>

        <div className="form-group-modern full-width">
          <label className="form-label-modern">
            <Star size={16} />
            <span>Biografía</span>
          </label>
          <textarea
            className="form-textarea-modern"
            value={userData.bio}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            placeholder="Cuéntanos sobre ti..."
            rows={3}
          />
        </div>

        <div className="form-actions-modern">
          <button 
            className="save-button-modern"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Activity size={16} className="spinner" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
          <button 
            className="cancel-button-modern"
            onClick={() => {
              loadUserData();
              setActiveTab('overview');
            }}
          >
            <X size={16} />
            <span>Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  );
}