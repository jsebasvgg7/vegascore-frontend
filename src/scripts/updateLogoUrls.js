// src/scripts/updateLogoUrls.js
import { supabase } from '../utils/supabaseClientNode.js';
import { getLogoUrlByTeamName } from '../utils/logoHelper.js';

async function updateAllLogoUrls() {
  console.log('🚀 Actualizando URLs de logos en la base de datos...\n');
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, home_team, away_team, league');
  
  if (error) {
    console.error('❌ Error obteniendo partidos:', error);
    return;
  }
  
  console.log(`📊 Total de partidos: ${matches.length}\n`);
  
  let updated = 0;
  let skipped = 0;
  const missingLogos = new Set();
  
  for (const match of matches) {
    const homeLogoUrl = getLogoUrlByTeamName(match.home_team, match.league);
    const awayLogoUrl = getLogoUrlByTeamName(match.away_team, match.league);
    
    if (!homeLogoUrl || !awayLogoUrl) {
      console.log(`⚠️  Sin logo: ${match.home_team} vs ${match.away_team} (${match.league})`);
      if (!homeLogoUrl) missingLogos.add(`${match.home_team} (${match.league})`);
      if (!awayLogoUrl) missingLogos.add(`${match.away_team} (${match.league})`);
      skipped++;
      continue;
    }
    
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        home_team_logo_url: homeLogoUrl,
        away_team_logo_url: awayLogoUrl
      })
      .eq('id', match.id);
    
    if (updateError) {
      console.error(`❌ Error: ${updateError.message}`);
      skipped++;
    } else {
      console.log(`✅ ${match.home_team} vs ${match.away_team}`);
      updated++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✨ Completado!`);
  console.log(`   ✅ Actualizados: ${updated}`);
  console.log(`   ⚠️  Omitidos: ${skipped}`);
  console.log('='.repeat(50));
  
  if (missingLogos.size > 0) {
    console.log('\n📋 Equipos sin logo configurado:');
    missingLogos.forEach(team => console.log(`   - ${team}`));
    console.log('\n💡 Agrégalos a teamSlugMap en src/utils/logoHelper.js\n');
  }
}

updateAllLogoUrls();