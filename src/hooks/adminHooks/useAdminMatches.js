// src/hooks/adminHooks/useAdminMatches.js
import { supabase } from '../../utils/supabaseClient';
import { useMatches } from '../useMatches';

export const useAdminMatches = (currentUser, loadData, toast) => {
  const { finishMatch } = useMatches(currentUser);

  const handleAddMatch = async (match) => {
    try {
      const { error } = await supabase.from('matches').insert(match);
      if (error) throw error;
      await loadData();
      toast.success(`✅ Partido ${match.home_team} vs ${match.away_team} agregado`, 4000);
      return { success: true };
    } catch (err) {
      console.error('Error adding match:', err);
      toast.error('❌ Error al agregar el partido. Verifica los datos.');
      throw err;
    }
  };

  const handleFinishMatch = async (matchId, homeScore, awayScore) => {
    try {
      await finishMatch(
        matchId,
        homeScore,
        awayScore,
        async () => {
          await loadData();
          toast.success(`⚽ Partido finalizado: ${homeScore} - ${awayScore}`, 4000);
        },
        (error) => {
          toast.error(`❌ Error: ${error}`);
          throw new Error(error);
        }
      );
    } catch (err) {
      console.error('Error finishing match:', err);
      throw err;
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
      throw err;
    }
  };

  return {
    handleAddMatch,
    handleFinishMatch,
    handleDeleteMatch
  };
};