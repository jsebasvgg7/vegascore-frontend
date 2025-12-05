const BUCKET_NAME = 'team-logos';

export const teamSlugMap = {
  'Man United': 'manchesterunited',
  'Liverpool': 'liverpool',
  'Arsenal': 'arsenal',
  'Chelsea': 'chelsea',
  'Man City': 'manchestercity',
  'Tottenham': 'tottenham',
  'Newcastle': 'newcastle',
  'Aston Villa': 'astonvilla',
  'West Ham': 'west-ham',
  'Brighton': 'brighton',
  'Leeds': 'leeds',
  'Sunderland': 'sunderland',
  'Everton': 'everton',
  'Brentford': 'brentford',
  'Wolves': 'wolves',
  'Fulham': 'fulham',
  'Crystal Palace': 'crystalpalace',
  'Bournem.': 'bournemouth',
  'Nottingham': 'nottingham_forest',
  'Burnley': 'burnley',
  'Real Madrid': 'realmadrid',
  'Barcelona': 'barcelona',
  'Atl. Madrid': 'atlmadrid',
  'Sevilla': 'sevilla',
  'Real Betis': 'betis',
  'Valencia': 'valencia',
  'Villarreal': 'villarreal',
  'Athletic Club': 'athletic',
  'Real Sociedad': 'realsociedad',
  'Celta Vigo': 'celta',
  'Espanyol': 'espanyol',
  'Mallorca': 'mallorca',
  'Rayo Valle': 'rayovallecano',
  'Getafe': 'getafe',
  'Alaves': 'alaves',
  'Elche': 'elche',
  'Girona': 'girona',
  'Levante': 'levante',
  'Real Oviedo': 'realoviedo',
  'Ozasuna': 'osasuna',
  'Inter Milan': 'inter',
  'AC Milan': 'milan',
  'Juventus': 'juventus',
  'Napoli': 'napoli',
  'AS Roma': 'roma',
  'Lazio': 'lazio',
  'Atalanta': 'atalanta',
  'Fiorentina': 'fiorentina',
  'Torino': 'torino',
  'Bologna': 'bologna',
  'Sassuolo': 'sassuolo',
  'Udinese': 'udinese',
  'Genoa': 'genoa',
  'Cagliari': 'cagliari',
  'Hellas Verona': 'hellasverona',
  'Lecce': 'lecce',
  'Parma': 'parma',
  'Pisa': 'pisa',
  'Como': 'como',
  'Bayern M.': 'bayernmunchen',
  'Dortmund': 'borussiadortmund',
  'RB Leipzig': 'rbleipzig',
  'Leverkusen': 'bayerleverkusen',
  'Ausburg': 'augsburg',
  'Borussia M.': 'bmonchengladbach',
  'Frankfurt': 'eintrachtfrankfurt',
  'Wolfsburg': 'wolfsburg',
  'Stuttgart': 'stuttgart',
  'Hoffenheim': 'hoffenheim',
  'Freiburg': 'freiburg',
  'Union Berlin': 'unionberlin',
  'Heidenheim': 'heidenheim',
  'St. Pauli': 'st_pauli',
  'Mainz': 'mainz05',
  'Hamburgo': 'hamburgo',
  'Werder Bremen': 'werderbremen',
  'Koln': 'koln',
  'Paris SG': 'psg',
  'Marseille': 'olimpiquemarseille',
  'Lyon': 'olimpiquelyon',
  'Monaco': 'monaco',
  'Lille': 'lille',
  'Rennes': 'rennes',
  'Nice': 'nice',
  'Nantes': 'nantes',
  'Strasbourg': 'strasbourg',
  'Angers': 'angers',
  'Auxerre': 'auxerre',
  'Toulouse': 'toulouse',
  'Havre': 'havre',
  'Brest': 'stadebretois',
  'Lorient': 'lorient',
  'Metz': 'metz',
  'Racing': 'racingstrasbourg',
  'Real Madrid CL': 'realmadrid',
  'Liverpool CL': 'liverpool',
  'Bayern M. CL': 'bayernmunchen',
  'PSG CL': 'psg',
  'Man City CL': 'manchestercity',
  'Chelsea CL': 'chelsea',
  'Barcelona CL': 'barcelona',
  'Juventus CL': 'juventus',
  'Dortmund CL': 'borussiadortmund',
  'Ajax CL': 'ajax',
  'Inter Milan CL': 'inter',
  'At. Madrid CL': 'atlmadrid',
  'Atalanta CL': 'atalanta',
  'Benfica CL': 'benfica',
  'Leverkusen CL': 'bayerleverkusen',
  'Sporting CL': 'sporting',
  'RB Leipzig CL': 'rbleipzig',
  'Pafos CL': 'pafos',
  'Slavia Praga CL': 'slavia_praga',
  'Napoli CL': 'napoli',
  'Kairat CL': 'kairat_almaty',
  'Galatasaray CL': 'galatasaray',
  'Marseille CL': 'olimpiquemarseille',
  'Copenhague CL': 'fc_copenhagen',
  'Eintracht CL': 'eintrachtfrankfurt',
  'Brujas CL': 'clubbrugge',
  'Union SG CL': 'union_saint_gilloise',
  'Villarreal CL': 'villarreal',
  'Monaco CL': 'monaco',
  'qabala CL': 'qabala',
  'Newcastle CL': 'newcastle',
  'Olimpiakos CL': 'olympiakos',
  'Psv CL': 'psv',
  'Tottenham CL': 'tottenham',
  'Arsenal CL': 'arsenal',
  'Athletic Club CL': 'athletic',
  'Bodo/Glimt CL': 'bodo_glimt',
};

export const leagueMap = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  'Champions League': 'champions-league',
  'Serie A': 'serie-a',
  'Bundesliga': 'bundesliga',
  'Ligue 1': 'ligue-1',
};

/**
 * Obtiene la URL pública del logo
 * @param {Object} supabase - Cliente de Supabase
 */
export function getTeamLogoUrl(supabase, leagueSlug, teamSlug) {
  const path = `leagues/${leagueSlug}/${teamSlug}.png`;
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Genera URL del logo basado en nombre de equipo y liga
 * @param {Object} supabase - Cliente de Supabase
 */
export function getLogoUrlByTeamName(supabase, teamName, leagueName) {
  const teamSlug = teamSlugMap[teamName];
  const leagueSlug = leagueMap[leagueName];
  
  if (!teamSlug || !leagueSlug) {
    console.warn(`⚠️ Logo no encontrado para: "${teamName}" en "${leagueName}"`);
    return null;
  }
  
  return getTeamLogoUrl(supabase, leagueSlug, teamSlug);
}