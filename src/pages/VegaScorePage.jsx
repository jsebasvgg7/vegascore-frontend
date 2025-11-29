// src/pages/VegaScorePage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MatchCard from '../components/MatchCard';
import RankingSidebar from '../components/RankingSidebar';
import UserModal from '../components/UserModal';
import AdminModal from '../components/AdminModal';
import { getStorage, setStorage } from '../utils/storage';

export default function VegaScorePage() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [matchesData, usersData, currentUserData] = await Promise.all([
        getStorage('vegascore-matches'),
        getStorage('vegascore-users'),
        getStorage('vegascore-currentUser')
      ]);

      if (matchesData) setMatches(JSON.parse(matchesData.value));
      if (usersData) setUsers(JSON.parse(usersData.value));
      if (currentUserData) setCurrentUser(JSON.parse(currentUserData.value));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (key, data) => {
    try {
      await setStorage(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const createUser = (newUser) => {
    if (users.some(u => u.name.toLowerCase() === newUser.name.toLowerCase())) {
      alert('Este usuario ya existe');
      return;
    }
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    saveData('vegascore-users', updatedUsers);
    saveData('vegascore-currentUser', newUser);
  };

  const selectUser = (user) => {
    setCurrentUser(user);
    saveData('vegascore-currentUser', user);
    setShowUserModal(false);
  };

  const addMatch = (match) => {
    const updatedMatches = [...matches, match];
    setMatches(updatedMatches);
    saveData('vegascore-matches', updatedMatches);
  };

  const makePrediction = (matchId, homeScore, awayScore) => {
    if (!currentUser) return alert('Por favor selecciona un usuario primero');

    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        const existingPredIndex = match.predictions.findIndex(p => p.userId === currentUser.id);
        const prediction = { userId: currentUser.id, userName: currentUser.name, homeScore, awayScore };
        if (existingPredIndex >= 0) {
          match.predictions[existingPredIndex] = prediction;
        } else {
          match.predictions.push(prediction);
        }
      }
      return match;
    });

    setMatches(updatedMatches);
    saveData('vegascore-matches', updatedMatches);
  };

  const setMatchResult = (matchId, homeScore, awayScore) => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        match.result = { homeScore, awayScore };
        match.status = 'finished';
      }
      return match;
    });

    setMatches(updatedMatches);
    saveData('vegascore-matches', updatedMatches);
    calculatePoints(updatedMatches);
  };

  const calculatePoints = (matchesData) => {
    const userPoints = {};
    users.forEach(user => { userPoints[user.id] = { points: 0, predictions: 0, correct: 0 }; });

    matchesData.forEach(match => {
      if (match.status === 'finished' && match.result) {
        match.predictions.forEach(pred => {
          if (userPoints[pred.userId]) {
            userPoints[pred.userId].predictions++;
            const resultOutcome = Math.sign(match.result.homeScore - match.result.awayScore);
            const predOutcome = Math.sign(pred.homeScore - pred.awayScore);

            if (pred.homeScore === match.result.homeScore && pred.awayScore === match.result.awayScore) {
              userPoints[pred.userId].points += 5;
              userPoints[pred.userId].correct++;
            } else if (resultOutcome === predOutcome && resultOutcome !== 0) {
              userPoints[pred.userId].points += 3;
              userPoints[pred.userId].correct++;
            } else if (resultOutcome === 0 && predOutcome === 0) {
              userPoints[pred.userId].points += 3;
              userPoints[pred.userId].correct++;
            }
          }
        });
      }
    });

    const updatedUsers = users.map(user => ({
      ...user,
      points: userPoints[user.id]?.points || 0,
      predictions: userPoints[user.id]?.predictions || 0,
      correct: userPoints[user.id]?.correct || 0
    }));

    setUsers(updatedUsers);
    saveData('vegascore-users', updatedUsers);
    if (currentUser) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
      setCurrentUser(updatedCurrentUser);
      saveData('vegascore-currentUser', updatedCurrentUser);
    }
  };

  const getUserPrediction = (match) => {
    if (!currentUser) return null;
    return match.predictions.find(p => p.userId === currentUser.id);
  };

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  const pendingMatches = matches.filter(m => m.status === 'pending').sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div>Cargando...</div></div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        currentUser={currentUser}
        onOpenUserModal={() => setShowUserModal(true)}
        onToggleSettings={() => setShowSettings(s => !s)}
        onOpenAdmin={() => setShowAdminModal(true)}
        users={users}
      />

      {showSettings && (
        <div className="bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex gap-3">
              <button onClick={() => setShowAdminModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Agregar Partido</button>
              <button onClick={() => {
                const matchId = prompt('ID del partido a finalizar:');
                if (matchId) {
                  const home = prompt('Goles equipo local:');
                  const away = prompt('Goles equipo visitante:');
                  if (home !== null && away !== null) setMatchResult(matchId, parseInt(home), parseInt(away));
                }
              }} className="bg-green-600 text-white px-4 py-2 rounded-lg">Finalizar Partido</button>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Partidos pendientes:</strong></p>
              {matches.filter(m => m.status === 'pending').map(m => (<p key={m.id}>• ID: {m.id} - {m.homeTeam} vs {m.awayTeam}</p>))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Próximos Partidos</h2>
            {pendingMatches.length === 0 ? <p>No hay partidos disponibles</p> : (
              <div className="space-y-4">
                {pendingMatches.map(match => (
                  <MatchCard key={match.id} match={match} userPred={getUserPrediction(match)} onPredict={makePrediction} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <RankingSidebar users={sortedUsers} />
        </div>
      </div>

      {showUserModal && <UserModal users={users} onSelect={selectUser} onCreate={createUser} onClose={() => setShowUserModal(false)} />}
      {showAdminModal && <AdminModal onAdd={addMatch} onClose={() => setShowAdminModal(false)} />}
    </div>
  );
}
