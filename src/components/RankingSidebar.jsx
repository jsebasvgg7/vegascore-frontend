// src/components/RankingSidebar.jsx
import React from "react";
import { Medal, Crown, Award } from "lucide-react";

export default function RankingSidebar({ users }) {
  const getIcon = (index) => {
    if (index === 0) return <Crown size={18} color="#FFD700" />;
    if (index === 1) return <Medal size={18} color="#C0C0C0" />;
    if (index === 2) return <Medal size={18} color="#CD7F32" />;
    return <Award size={16} color="#999" />;
  };

  return (
    <div className="ranking card">
      <h3 className="ranking-title">
        <Trophy size={20} style={{ marginRight: '8px', display: 'inline' }} />
        Ranking Global
      </h3>

      <ul className="ranking-list">
        {users.map((u, index) => (
          <li key={u.id} className="ranking-item">
            <span className="rank-pos">
              {getIcon(index)}
              <span style={{ marginLeft: '6px' }}>#{index + 1}</span>
            </span>
            <span className="rank-name">{u.name}</span>
            <span className="rank-points">{u.points} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Importar Trophy aquí también
import { Trophy } from "lucide-react";