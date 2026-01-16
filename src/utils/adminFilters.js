// src/utils/adminFilters.js

export const getFilteredItems = (
  activeSection,
  searchTerm,
  filterStatus,
  { matches, leagues, awards, achievements, titles, users, crownHistory }
) => {
  let items = [];
  
  switch(activeSection) {
    case 'matches':
      items = matches;
      break;
    case 'leagues':
      items = leagues;
      break;
    case 'awards':
      items = awards;
      break;
    case 'achievements':
      items = achievements;
      break;
    case 'titles':
      items = titles;
      break;
    case 'crowns':
      return { 
        top10: users.filter(u => JSON.stringify(u).toLowerCase().includes(searchTerm.toLowerCase())), 
        history: crownHistory 
      };
    default:
      items = [];
  }

  if (searchTerm) {
    items = items.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterStatus !== 'all' && ['matches', 'leagues', 'awards'].includes(activeSection)) {
    items = items.filter(item => item.status === filterStatus);
  }

  return items;
};

export const calculateStats = ({ matches, leagues, awards, achievements, titles, crownHistory }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return {
    matches: {
      total: matches.length,
      pending: matches.filter(m => m.status === 'pending').length,
      finished: matches.filter(m => m.status === 'finished').length
    },
    leagues: {
      total: leagues.length,
      active: leagues.filter(l => l.status === 'active').length,
      finished: leagues.filter(l => l.status === 'finished').length
    },
    awards: {
      total: awards.length,
      active: awards.filter(a => a.status === 'active').length,
      finished: awards.filter(a => a.status === 'finished').length
    },
    achievements: {
      total: achievements.length
    },
    titles: {
      total: titles.length
    },
    crowns: {
      total: crownHistory.length,
      thisMonth: crownHistory.filter(h => h.month_year === currentMonth).length
    }
  };
};