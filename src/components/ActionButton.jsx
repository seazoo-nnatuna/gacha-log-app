import React from 'react';

function ActionButton({ text, onClick, type = "button", style = {} })
{
  return (
    <button 
      type={type}
      onClick={onClick}
      style={{
        backgroundColor: '#ffd700', // 基本の黄色
        color: '#000',
        border: 'none',
        borderRadius: '20px',       
        padding: '6px 16px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        ...style
      }}
    >
      {text !== 'ログアウト' && <span style={{ fontSize: '1rem' }}></span>} {/* ログアウトの時は矢印を出さない微調整 */}
      {text}
    </button>
  );
}

export default ActionButton;