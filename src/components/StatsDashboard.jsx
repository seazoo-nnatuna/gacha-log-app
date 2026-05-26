import React from 'react';
import StatCard from './StatCard';

function StatsDashboard({ totalPulls, star5Count, averagePulls, pickupRate, pickupCount, surinukeCount }) 
{
  // Reactでは複数の要素を返す時に <></>（フラグメント）で囲むルールがある
  return (
    <>
      {/* 集計ダッシュボード */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '15px', 
        marginBottom: '15px'
      }}>
        <StatCard label="累計連数" value={totalPulls} color="#fff" />
        <StatCard label="星5獲得" value={star5Count} color="#FFD700" />
        <StatCard label="星5期待値" value={averagePulls} unit="連" color="#ff4fac" />
      </div>

      {/* 詳細なPU率パネル */}
      <div style={{
        background: 'rgba(59, 28, 88, 0.3)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>PU率</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>{pickupRate}%</div>
        <div style={{ fontSize: '0.7rem', marginTop: '5px' }}>
          (PU: {pickupCount} / すり抜け: {surinukeCount})
        </div>
      </div>
    </>
  );
}

export default StatsDashboard;