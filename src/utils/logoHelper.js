// ============================================
// LOGO HELPER - Equipos, Ligas y Premios
// ============================================

const TEAM_LOGOS_BUCKET = 'team-logos';
const LEAGUE_LOGOS_BUCKET = 'league-logos';
const AWARD_LOGOS_BUCKET = 'award-logos';

// ============================================
// MAPEO DE EQUIPOS
// ============================================
export const teamSlugMap = {
  'MUN': 'manchesterunited',
  'LIV': 'liverpool',
  'ARS': 'arsenal',
  'CHE': 'chelsea',
  'MCI': 'manchestercity',
  'TOT': 'tottenham',
  'NEW': 'newcastle',
  'AVL': 'astonvilla',
  'WHU': 'westham',
  'BHA': 'brighton',
  'LEE': 'leeds',
  'SUN': 'sunderland',
  'EVE': 'everton',
  'BRE': 'brentford',
  'WOL': 'wolves',
  'FUL': 'fulham',
  'CRY': 'crystalpalace',
  'BOU': 'bournemouth',
  'NFO': 'nottingham_forest',
  'BUR': 'burnley',
  'RMA': 'realmadrid',
  'BAR': 'barcelona',
  'ATM': 'atlmadrid',
  'SEV': 'sevilla',
  'BET': 'betis',
  'VAL': 'valencia',
  'VIL': 'villarreal',
  'ATH': 'athletic',
  'RSO': 'realsociedad',
  'CEL': 'celta',
  'ESP': 'espanyol',
  'MLL': 'mallorca',
  'RAY': 'rayovallecano',
  'GET': 'getafe',
  'ALA': 'alaves',
  'ELC': 'elche',
  'GIR': 'girona',
  'LEV': 'levante',
  'OVI': 'realoviedo',
  'OSA': 'osasuna',
  'INT': 'inter',
  'MIL': 'milan',
  'JUV': 'juventus',
  'NAP': 'napoli',
  'ROM': 'roma',
  'LAZ': 'lazio',
  'ATA': 'atalanta',
  'FIO': 'fiorentina',
  'TOR': 'torino',
  'BOL': 'bologna',
  'SAS': 'sassuolo',
  'UDI': 'udinese',
  'GEN': 'genoa',
  'CAG': 'cagliari',
  'VER': 'hellasverona',
  'LEC': 'lecce',
  'PAR': 'parma',
  'PIS': 'pisa',
  'COM': 'como',
  'CRE': 'cremonese',
  'BAY': 'bayernmunchen',
  'DOR': 'borussiadortmund',
  'RBL': 'rbleipzig',
  'B04': 'bayerleverkusen',
  'AUG': 'augsburgo',
  'BMG': 'bmonchengladbach',
  'SGE': 'eintrachtfrankfurt',
  'WOB': 'wolfsburg',
  'VFB': 'stuttgart',
  'HOF': 'hoffenheim',
  'SCF': 'freiburg',
  'FCU': 'unionberlin',
  'HEI': 'heidenheim',
  'STP': 'st_pauli',
  'M05': 'mainz05',
  'HSV': 'hamburgo',
  'SVW': 'werderbremen',
  'KOE': 'koln',
  'PSG': 'psg',
  'OGM': 'olimpiquemarsella',
  'OLY': 'olimpiquelyon', 
  'MON': 'monaco',
  'LIL': 'lille',
  'REN': 'rennais',
  'NIC': 'nice',
  'NAN': 'nantes',
  'STR': 'strasbourg',
  'ANG': 'angers',
  'AUX': 'auxerre',
  'TOU': 'toulouse',
  'HAC': 'havre',
  'SBR': 'stadebretois',
  'LOR': 'lorient',
  'MET': 'metz',
  'RCS': 'racingstrasbourg',
  'PFC': 'paris_fc',
  'AJA': 'ajax',
  'BEN': 'benfica',
  'SCP': 'sporting',
  'PAF': 'pafos',
  'SLP': 'slavia_praga',
  'KAI': 'kairat_almaty',
  'GAL': 'galatasaray',
  'FCK': 'fc_copenhague',
  'EIN': 'eintrachtfrankfurt',
  'CLB': 'clubbrugge',
  'USG': 'union_saint_gilloise',
  'QAR': 'qarabag',
  'OLI': 'olympiacos',
  'PSV': 'psv',
  'BOD': 'bodo_glimt',
};

// ============================================
// MAPEO DE LIGAS (para equipos)
// ============================================
export const leagueMap = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  'Champions League': 'champions-league',
  'Serie A': 'serie-a',
  'Bundesliga': 'bundesliga',
  'Ligue 1': 'ligue-1',
};

// ============================================
// MAPEO DE LOGOS DE LIGAS (para LeagueCard)
// ============================================
export const leagueLogoMap = {
  'Premier League': 'inglaterra',
  'La Liga': 'espana',
  'Serie A': 'italia',
  'Bundesliga': 'alemania',
  'Ligue 1': 'francia',
  'Champions League': 'champions',
  'Europa League': 'europa',
  'Conference League': 'conference',
};

// ============================================
// MAPEO DE LOGOS DE PREMIOS (para AwardCard)
// ============================================
export const awardLogoMap = {
  'Ballon D Or': 'balondeor',
  'Bota De Or': 'botadeoro',
  'The Best': 'thebest',
  'Yashin': 'yashin',
  'Golden Boy': 'goldenboy',
  'Club Of The Year': 'club',
};

// ============================================
// FUNCIONES PARA LOGOS DE EQUIPOS
// ============================================

/**
 * Obtiene la URL pública del logo de un equipo
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} leagueSlug - Slug de la liga
 * @param {string} teamSlug - Slug del equipo
 * @returns {string} URL pública del logo
 */
export function getTeamLogoUrl(supabase, leagueSlug, teamSlug) {
  const path = `leagues/${leagueSlug}/${teamSlug}.png`;
  
  const { data } = supabase.storage
    .from(TEAM_LOGOS_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Genera URL del logo basado en nombre de equipo y liga
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} teamName - Nombre del equipo
 * @param {string} leagueName - Nombre de la liga
 * @returns {string|null} URL del logo o null si no se encuentra
 */
export function getLogoUrlByTeamName(supabase, teamName, leagueName) {
  const teamSlug = teamSlugMap[teamName];
  const leagueSlug = leagueMap[leagueName];
  
  if (!teamSlug || !leagueSlug) {
    console.warn(`⚠️ Logo de equipo no encontrado: "${teamName}" en "${leagueName}"`);
    return null;
  }
  
  return getTeamLogoUrl(supabase, leagueSlug, teamSlug);
}

// ============================================
// FUNCIONES PARA LOGOS DE LIGAS
// ============================================

/**
 * Obtiene la URL pública del logo de una liga
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} leagueSlug - Slug de la liga
 * @returns {string} URL pública del logo
 */
export function getLeagueLogoUrl(supabase, leagueSlug) {
  const path = `${leagueSlug}.png`;
  
  const { data } = supabase.storage
    .from(LEAGUE_LOGOS_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Genera URL del logo de liga basado en nombre
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} leagueName - Nombre de la liga
 * @returns {string|null} URL del logo o null si no se encuentra
 */
export function getLogoUrlByLeagueName(supabase, leagueName) {
  const leagueSlug = leagueLogoMap[leagueName];
  
  if (!leagueSlug) {
    console.warn(`⚠️ Logo de liga no encontrado: "${leagueName}"`);
    return null;
  }
  
  return getLeagueLogoUrl(supabase, leagueSlug);
}

// ============================================
// FUNCIONES PARA LOGOS DE PREMIOS
// ============================================

/**
 * Obtiene la URL pública del logo de un premio
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} awardSlug - Slug del premio
 * @returns {string} URL pública del logo
 */
export function getAwardLogoUrl(supabase, awardSlug) {
  const path = `${awardSlug}.png`;
  
  const { data } = supabase.storage
    .from(AWARD_LOGOS_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Genera URL del logo de premio basado en nombre
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} awardName - Nombre del premio
 * @returns {string|null} URL del logo o null si no se encuentra
 */
export function getLogoUrlByAwardName(supabase, awardName) {
  const awardSlug = awardLogoMap[awardName];
  
  if (!awardSlug) {
    console.warn(`⚠️ Logo de premio no encontrado: "${awardName}"`);
    return null;
  }
  
  return getAwardLogoUrl(supabase, awardSlug);
}