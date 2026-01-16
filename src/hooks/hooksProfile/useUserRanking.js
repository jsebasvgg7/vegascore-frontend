import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export const useUserRanking = (currentUser) => {
  const [userRanking, setUserRanking] = useState({
    position: 0,
    totalUsers: 0,
    pointsToNext: 0,
    pointsToLeader: 0,
    pointsFromPrev: 0
  });

  const loadUserRanking = async () => {
    try {
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('id, points')
        .order('points', { ascending: false });

      if (error) throw error;
      if (!allUsers || allUsers.length === 0) return;

      const userIndex = allUsers.findIndex(user => user.id === currentUser?.id);
      const userPosition = userIndex !== -1 ? userIndex + 1 : 0;

      const leaderPoints = allUsers[0]?.points || 0;
      const userPoints = currentUser?.points || 0;
      const nextUser = userIndex > 0 ? allUsers[userIndex - 1] : null;
      const prevUser = userIndex < allUsers.length - 1 ? allUsers[userIndex + 1] : null;

      setUserRanking({
        position: userPosition,
        totalUsers: allUsers.length,
        pointsToLeader: leaderPoints - userPoints,
        pointsToNext: nextUser ? userPoints - nextUser.points : 0,
        pointsFromPrev: prevUser ? prevUser.points - userPoints : 0
      });

    } catch (err) {
      console.error('Error loading ranking:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadUserRanking();
    }
  }, [currentUser]);

  return { userRanking };
};