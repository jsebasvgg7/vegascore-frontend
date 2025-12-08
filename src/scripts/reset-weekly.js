// scripts/reset-weekly.js
// Este script se ejecuta desde GitHub Actions

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function resetWeeklyStats() {
  try {
    console.log('🔄 Iniciando reset semanal de estadísticas...');
    console.log('📅 Fecha:', new Date().toISOString());

    // Opción 1: Usar la función RPC (recomendada)
    const { error: rpcError } = await supabase.rpc('reset_weekly_stats');

    if (rpcError) {
      console.error('❌ Error usando RPC:', rpcError);
      throw rpcError;
    }

    /* Opción 2: Hacer UPDATE directo (alternativa)
    const { data, error } = await supabase
      .from('users')
      .update({
        weekly_points: 0,
        weekly_correct: 0,
        weekly_predictions: 0,
        last_weekly_reset: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Actualizar todos

    if (error) throw error;
    console.log(`✅ ${data?.length || 0} usuarios actualizados`);
    */

    // Verificar cuántos usuarios se resetearon
    const { data: users, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (countError) throw countError;

    console.log('✅ Reset completado exitosamente');
    console.log(`👥 Total de usuarios: ${users?.length || 0}`);
    console.log('🎉 Nuevo ciclo semanal iniciado');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    process.exit(1);
  }
}

resetWeeklyStats();