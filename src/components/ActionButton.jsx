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
        padding: '8px 20px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        ...style // 呼び出し元から特別な色などを指定されたら上書きする
      }}
    >
      <span style={{ fontSize: '1.2rem' }}></span>
      {text}
    </button>
  );
}

export default ActionButton;