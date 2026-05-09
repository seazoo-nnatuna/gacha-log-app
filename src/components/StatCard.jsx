import React from 'react';

function StatCard({ label, value, unit = "", color })
{
  return (
    <div style=
    {
      { 
        // 「斜めの微細なグラデーション」
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)', 
        backdropFilter: 'blur(10px)', // すりガラス効果
        padding: '12px', 
        borderRadius: '8px', 
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)', // 上のフチだけ少し光らせ立体感を出す
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }
    }>

      <div style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '5px', fontWeight: 'bold' }}>
        {label}
      </div>

      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: color, textShadow: `0 0 10px ${color}66` }}>
        {value}<span style={{ fontSize: '0.8rem', marginLeft: '2px' }}>{unit}</span>
      </div>

    </div>
  );
}

export default StatCard;