import React from 'react';
import ActionButton from './ActionButton';

function Header({ currentTheme, handleSignOut }) 
{
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
      <h1 style=
      {{
        fontSize: '1.5rem',
        letterSpacing: '2px',
        borderLeft: `4px solid ${currentTheme.accent}`,
        paddingLeft: '15px',
        color: '#fff'
      }}>
        ガチャデータ集計
      </h1>

      <ActionButton 
        text="ログアウト" 
        onClick={handleSignOut} 
        style={{ backgroundColor: '#444', color: '#fff' }} 
      />
      
    </header>
  );
}

export default Header;