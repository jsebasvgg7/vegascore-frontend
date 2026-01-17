// src/hooks/adminHooks/useAdminCrowns.js
import { supabase } from '../../utils/supabaseClient';

export const useAdminCrowns = (loadData, toast) => {
  const handleAwardCrown = async (winnerId, monthLabel, currentUserId) => {
    try {
      // Llamar a la función de Supabase para otorgar la corona
      const { data, error } = await supabase.rpc('award_monthly_championship', {
        winner_user_id: winnerId,
        month_label: monthLabel,
        awarded_by_user_id: currentUserId
      });

      if (error) throw error;

      await loadData();
      toast.success(
        `👑 Corona otorgada exitosamente a ${data.winner_name} para ${monthLabel}`,
        4000
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error awarding crown:', err);
      
      // Mensajes de error específicos
      if (err.message.includes('Ya existe un campeón')) {
        toast.error('⚠️ Ya se otorgó una corona para este mes');
      } else if (err.message.includes('Usuario no encontrado')) {
        toast.error('❌ Usuario no encontrado');
      } else {
        toast.error('❌ Error al otorgar la corona. Intenta de nuevo.');
      }
      
      throw err;
    }
  };

  const handleResetMonthlyStats = async () => {
    if (!confirm('⚠️ ¿Estás seguro de resetear las estadísticas mensuales de TODOS los usuarios? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('reset_all_monthly_stats');

      if (error) throw error;

      await loadData();
      toast.success(
        `🔄 Estadísticas mensuales reseteadas. ${data.users_reset} usuarios actualizados.`,
        4000
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error resetting monthly stats:', err);
      toast.error('❌ Error al resetear estadísticas. Intenta de nuevo.');
      throw err;
    }
  };

  return {
    handleAwardCrown,
    handleResetMonthlyStats
  };
};