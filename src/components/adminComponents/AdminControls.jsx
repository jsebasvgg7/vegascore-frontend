// src/components/adminComponents/AdminControls.jsx
import React from 'react';
import { Search, Plus } from 'lucide-react';

export default function AdminControls({ 
  activeSection, 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus,
  onAddNew 
}) {
  return (
    <div className="admin-controls">
      <div className="search-filter-group">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder={`Buscar ${activeSection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {['matches', 'leagues', 'awards'].includes(activeSection) && (
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Todos
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'pending' || filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus(activeSection === 'matches' ? 'pending' : 'active')}
            >
              Activos
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'finished' ? 'active' : ''}`}
              onClick={() => setFilterStatus('finished')}
            >
              Finalizados
            </button>
          </div>
        )}
      </div>

      <button 
        className="add-new-btn"
        onClick={onAddNew}
      >
        <Plus size={20} />
        <span>Agregar Nuevo</span>
      </button>
    </div>
  );
}