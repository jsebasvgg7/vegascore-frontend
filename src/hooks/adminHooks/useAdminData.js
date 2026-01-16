// src/hooks/adminHooks/useAdminData.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export const useAdminData = () => {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [titles, setTitles] = useState([]);
  const [users, setUsers] = useState([]);
  const [crownHistory, setCrownHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        matchData, 
        leagueData, 
        awardData, 
        achievementData, 
        titleData, 
        userData, 
        historyData
      ] = await Promise.all([
        supabase.from('matches').select('*, predictions(*)'),
        supabase.from('leagues').select('*, league_predictions(*)'),
        supabase.from('awards').select('*, award_predictions(*)'),
        supabase.from('available_achievements').select('*'),
        supabase.from('available_titles').select('*'),
        supabase.from('users').select('*').order('monthly_points', { ascending: false }).limit(10),
        supabase.from('monthly_championship_history').select('*, users(name)').order('awarded_at', { ascending: false })
      ]);

      setMatches(matchData.data || []);
      setLeagues(leagueData.data || []);
      setAwards(awardData.data || []);
      setAchievements(achievementData.data || []);
      setTitles(titleData.data || []);
      setUsers(userData.data || []);
      setCrownHistory(historyData.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    matches,
    leagues,
    awards,
    achievements,
    titles,
    users,
    crownHistory,
    loading,
    loadData
  };
};