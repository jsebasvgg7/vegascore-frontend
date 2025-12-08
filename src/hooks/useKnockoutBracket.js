import { useMemo } from 'react';

export function useKnockoutBracket(groupPredictions) {
  return useMemo(() => {
    const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const qualified = {};
    const allThirds = [];

    // Calcular clasificados de cada grupo
    GROUPS.forEach(group => {
      const standings = calculateGroupStandings(group, groupPredictions[group]);
      qualified[group] = {
        first: standings[0]?.team || null,
        second: standings[1]?.team || null,
        third: standings[2]?.team || null
      };
      if (standings[2]) {
        allThirds.push({ ...standings[2], group });
      }
    });

    // Ordenar mejores terceros
    const bestThirds = allThirds
      .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8)
      .reduce((acc, team, idx) => {
        acc[team.group] = { ...team, position: idx + 1 };
        return acc;
      }, {});

    return { qualified, bestThirds };
  }, [groupPredictions]);
}

function calculateGroupStandings(group, groupData) {
  if (!groupData?.matches) return [];
  
  const GROUPS_DATA = {
    A: ['Mexico', 'South Africa', 'Korea Republic', 'Denmark*'],
    // ... resto de grupos
  };
  
  const teams = GROUPS_DATA[group];
  const table = teams.map(team => ({
    team, played: 0, won: 0, drawn: 0, lost: 0,
    gf: 0, ga: 0, gd: 0, points: 0
  }));

  const matches = [
    [teams[0], teams[1]], [teams[2], teams[3]],
    [teams[0], teams[2]], [teams[1], teams[3]],
    [teams[0], teams[3]], [teams[1], teams[2]]
  ];

  Object.entries(groupData.matches).forEach(([idx, pred]) => {
    if (!pred.homeScore || !pred.awayScore) return;
    
    const [home, away] = matches[idx];
    const homeIdx = teams.indexOf(home);
    const awayIdx = teams.indexOf(away);
    const hs = parseInt(pred.homeScore);
    const as = parseInt(pred.awayScore);
    
    table[homeIdx].played++;
    table[awayIdx].played++;
    table[homeIdx].gf += hs;
    table[homeIdx].ga += as;
    table[awayIdx].gf += as;
    table[awayIdx].ga += hs;
    
    if (hs > as) {
      table[homeIdx].won++;
      table[homeIdx].points += 3;
      table[awayIdx].lost++;
    } else if (hs < as) {
      table[awayIdx].won++;
      table[awayIdx].points += 3;
      table[homeIdx].lost++;
    } else {
      table[homeIdx].drawn++;
      table[awayIdx].drawn++;
      table[homeIdx].points++;
      table[awayIdx].points++;
    }
    
    table[homeIdx].gd = table[homeIdx].gf - table[homeIdx].ga;
    table[awayIdx].gd = table[awayIdx].gf - table[awayIdx].ga;
  });

  return table.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}