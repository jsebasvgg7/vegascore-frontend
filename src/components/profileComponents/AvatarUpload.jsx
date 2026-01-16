import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2, Crown } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../../styles/pagesStyles/ProfilePage.css';

export default function AvatarUpload({ currentUrl, userId, onUploadComplete, userLevel }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen debe ser menor a 10MB');
      return;
    }

    setUploading(true);

    try {
      // Crear preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Actualizar URL en la base de datos
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;
      
      onUploadComplete(publicUrl);

    } catch (error) {
      console.error('Error al subir el avatar:', error.message);
      alert('Error al subir el avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!preview) return;

    setUploading(true);
    try {

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;
      
      setPreview(null);
      onUploadComplete(null);
      
    } catch (error) {
      console.error('Error al eliminar el avatar:', error.message);
      alert('Error al eliminar el avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
        disabled={uploading}
      />
      
      {/* Nuevo contenedor para alinear Avatar y Botones lateralmente */}
      <div className="avatar-upload-horizontal-group">
        
        {/* Sección del Avatar (lado izquierdo) - CON BADGE DE NIVEL */}
        <div className="avatar-container-new">
          <div className="avatar-preview-wrapper" onClick={() => !uploading && fileInputRef.current?.click()}>
            {/* Muestra la imagen de preview o un placeholder */}
            {preview ? (
              <img src={preview} alt="Avatar Preview" className="avatar-preview-image" />
            ) : (
              <div className="avatar-placeholder-upload">
                <Camera size={24} />
              </div>
            )}
            
            {/* Overlay de carga */}
            {uploading && (
              <div className="avatar-loading-overlay">
                <Loader2 size={32} className="spinner" />
              </div>
            )}
            
            {/* Overlay de cámara para indicar que es clickeable */}
            {!uploading && (
              <div className="camera-overlay">
                <Camera size={20} />
              </div>
            )}
          </div>
          
          {/* Badge de nivel - SIEMPRE VISIBLE */}
          <div className="level-badge-floating">
            <Crown size={14} fill="currentColor" />
            <span>Lvl {userLevel || 1}</span>
          </div>
        </div>

        {/* Sección de Botones (lado derecho) */}
        <div className="avatar-actions-side">
          {/* Botón principal (Subir/Cambiar) */}
          <button
            className="avatar-btn primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Cambiar avatar"
          >
            {uploading ? (
              <Loader2 size={16} className="spinner" />
            ) : (
              <Upload size={16} />
            )}
          </button>
          
          {/* Botón de Eliminar (solo si hay una foto) */}
          {preview && (
            <button
              className="avatar-btn secondary"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              title="Eliminar avatar"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}