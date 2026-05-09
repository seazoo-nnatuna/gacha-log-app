import React from 'react';

function TypeTabs({ selectedType, setSelectedType, currentTheme }) 
{
  return (
    <div style={{ 
      display: 'flex', 
      borderBottom: `3px solid ${currentTheme.accent}`, 
      marginBottom: '20px',
      paddingLeft: '10px'
    }}>
      {['キャラ', '武器'].map((type) => {
        const isActive = selectedType === type;
        return (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '12px 30px',
              backgroundColor: isActive ? currentTheme.accent : 'rgba(0, 0, 0, 0.6)',
              color: isActive ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '12px 12px 0 0', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s',
              marginRight: '4px',
              position: 'relative',
              top: '3px',
              zIndex: isActive ? 2 : 1,
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}

export default TypeTabs;