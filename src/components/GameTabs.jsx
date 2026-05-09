import React from 'react';
import { GAME_THEMES } from '../constants/gameThemes';

function GameTabs({ selectedGame, setSelectedGame, currentTheme }) 
{
  return (
    <nav style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {Object.keys(GAME_THEMES).map((game) => (
        <button
          key={game}
          onClick={() => setSelectedGame(game)}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: selectedGame === game ? currentTheme.accent : 'rgba(255,255,255,0.1)',
            color: selectedGame === game ? '#000' : '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s',
            fontSize: '0.85rem'
          }}
        >
          {game}
        </button>
      ))}
    </nav>
  );
}

export default GameTabs;