import { supabase } from '../utils/supabaseClientNode.js';

async function listAllTeams() {
  console.log('🔍 Obteniendo todos los equipos y ligas...\n');
  
  // Primero, veamos qué hay en la tabla
  const { data: matches, error, count } = await supabase
    .from('matches')
    .select('*', { count: 'exact' });
  
  console.log('Total de registros en matches:', count);
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Posibles causas:');
    console.log('   - La tabla no se llama "matches"');
    console.log('   - No hay partidos en la base de datos');
    console.log('   - Problemas de permisos (RLS)\n');
    return;
  }
  
  if (!matches || matches.length === 0) {
    console.log('⚠️  La tabla matches está vacía o no existe\n');
    console.log('💡 ¿Cómo se llama tu tabla de partidos?\n');
    return;
  }
  
  // Mostrar un ejemplo de partido
  console.log('📄 Ejemplo de partido:', JSON.stringify(matches[0], null, 2));
  
  const teams = new Set();
  const leagues = new Set();
  
  matches.forEach(match => {
    teams.add(match.home_team);
    teams.add(match.away_team);
    leagues.add(match.league);
  });
  
  console.log('\n📋 LIGAS ENCONTRADAS:\n');
  console.log('export const leagueMap = {');
  Array.from(leagues).sort().forEach(league => {
    const slug = league.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    console.log(`  '${league}': '${slug}',`);
  });
  console.log('};\n');
  
  console.log('\n📋 EQUIPOS ENCONTRADOS:\n');
  console.log('export const teamSlugMap = {');
  Array.from(teams).sort().forEach(team => {
    const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    console.log(`  '${team}': '${slug}',`);
  });
  console.log('};\n');
  
  console.log('✅ Total de equipos:', teams.size);
  console.log('✅ Total de ligas:', leagues.size);
}

listAllTeams();