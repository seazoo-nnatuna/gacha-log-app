import React from 'react';

function StatCard({ label, value, unit = "", color })
{
  return (
    <div style=
    {{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      padding: '15px', 
      borderRadius: '12px', 
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '5px', fontWeight: 'bold' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color }}>
        {value}<span style={{ fontSize: '0.9rem', marginLeft: '2px' }}>{unit}</span>
      </div>
    </div>
  );
}

export default StatCard;