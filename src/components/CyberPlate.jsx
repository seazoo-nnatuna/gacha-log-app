import React from 'react';

function CyberPlate({ title, children }) 
{
  return (
    <div style={{
      backgroundColor: '#3b3b3b', 
      border: '2px solid #555',   
      borderRadius: '8px',        
      overflow: 'hidden',         
      position: 'relative',
      marginBottom: '20px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.5)' 
    }}>
      <div style={{
        position: 'absolute', top: '5px', left: '10px',
        color: '#555', fontSize: '0.6rem', fontWeight: 'bold', fontStyle: 'italic'
      }}>
        ●
      </div>
      <div style={{
        background: 'linear-gradient(90deg, #4a1c1c 0%, #1a1a1a 100%)', 
        padding: '15px 20px 10px 40px', 
        borderBottom: '1px solid #333'
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#eee' }}>{title}</span>
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

export default CyberPlate;