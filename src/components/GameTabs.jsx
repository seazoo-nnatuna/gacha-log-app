import React from 'react';
import { GAME_THEMES } from '../constants/gameThemes';

function GameTabs({ selectedGame, setSelectedGame, currentTheme }) {
  return (
    <nav style={{ marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {Object.keys(GAME_THEMES).map((game) => (
        <button
          key={game}
          onClick={() => setSelectedGame(game)}
          style={{
            padding: '6px 14px', // ★上下10px→6px、左右20px→14pxにスッキリ
            borderRadius: '20px', // ★カプセル型にしてスタイリッシュに
            border: selectedGame === game ? `1px solid ${currentTheme.accent}` : '1px solid rgba(255,255,255,0.2)',
            backgroundColor: selectedGame === game ? `${currentTheme.accent}22` : 'transparent', // うっすら光る背景に
            color: selectedGame === game ? currentTheme.accent : '#aaa',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            fontSize: '0.75rem',
            letterSpacing: '0.5px'
          }}
        >
          {game}
        </button>
      ))}
    </nav>
  );
}

export default GameTabs;