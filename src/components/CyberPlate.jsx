import React from 'react';

function CyberPlate({ title, children })
{
  return (
    <div style=
    {
      {
        // 高級感のあるダークグラデーション
        background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',   
        borderRadius: '8px',        
        overflow: 'hidden',         
        position: 'relative',
        marginBottom: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.6)' 
      }
    }>
      
      <div style=
      {
        {
        position: 'absolute', top: '5px', left: '10px',
        color: '#555', fontSize: '0.6rem', fontWeight: 'bold', fontStyle: 'italic'
        }
      }>
        ●
      </div>

      <div style=
      {
        {
            // ヘッダーを少しモダンに
            background: 'linear-gradient(90deg, rgba(80, 20, 20, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)', 
            padding: '12px 20px 10px 35px', 
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }
      }>
        <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#eee', letterSpacing: '1px' }}>{title}</span>
      </div>

      <div style={{ padding: '15px' }}>
        {children}
      </div>

    </div>
  );
}

export default CyberPlate;