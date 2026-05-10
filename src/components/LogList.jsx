import React from 'react';
import CyberPlate from './CyberPlate'; // ← CyberPlate を使います

function LogList({ filteredLogs, currentTheme, startEdit, handleDelete }) 
{
  return (
    <>
      {/* 履歴リストの見出し */}
      <CyberPlate title="ガチャ履歴">
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredLogs.map((log) => (
            <div key={log.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)',
              padding: '15px 20px', borderRadius: '10px',
              borderLeft: `4px solid ${log.is_pickup ? '#FFD700' : '#4facfe'}`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#777', marginBottom: '4px' }}>
                  {new Date(log.created_at).toLocaleDateString()} · {log.game_name}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {log.item_name}
                  <span style={{ fontSize: '0.8rem', color: log.is_pickup ? '#FFD700' : '#aaa', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                    {log.pull_count}連 {log.is_pickup ? 'PICKUP' : '通常'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => startEdit(log)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>編集</button>
                <button onClick={() => handleDelete(log.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.8rem' }}>削除</button>
              </div>
            </div>
          ))}
          {/* 履歴が0件だった場合のメッセージ */}
          {filteredLogs.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>履歴はありません</div>
          )}
        </div>
      </CyberPlate>
    </>
  );
}

export default LogList;