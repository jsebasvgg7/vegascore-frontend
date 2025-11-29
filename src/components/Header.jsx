// src/components/Header.jsx
import React from 'react';
import { Trophy, Settings } from '../icons';

export default function Header({ currentUser, onOpenUserModal, onToggleSettings, onOpenAdmin, users }) {
  const userPosition = currentUser ? (users.findIndex(u => u.id === currentUser.id) + 1) : 0;

  return (
    <header className="bg-gray-800 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-xl p-3"><Trophy className="w-8 h-8 text-gray-800" /></div>
          <div>
            <h1 className="text-xl font-bold">Predicciones de Fútbol</h1>
            <p className="text-gray-400 text-sm">Compite y demuestra tu conocimiento</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <button onClick={onOpenUserModal} className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 rounded-xl px-4 py-2">
              <div className="bg-white rounded-full p-2"><span className="text-gray-800">👤</span></div>
              <div className="text-left">
                <div className="font-semibold">{currentUser.name}</div>
                <div className="text-sm text-gray-400">{currentUser.points} pts • #{userPosition} de {users.length}</div>
              </div>
            </button>
          ) : (
            <button onClick={onOpenUserModal} className="bg-orange-500 px-6 py-2 rounded-lg">Seleccionar Usuario</button>
          )}

          <button onClick={onToggleSettings} className="bg-gray-700 p-3 rounded-xl"><Settings className="w-6 h-6" /></button>
        </div>
      </div>
    </header>
  );
}
