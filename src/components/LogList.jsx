import React from 'react';
import CyberPlate from './CyberPlate';

function LogList({ filteredLogs, currentTheme, startEdit, handleDelete }) 
{
  return (
    <>
      <CyberPlate title="ガチャ履歴">
        <div style={{ display: 'grid', gap: '8px' }}>
          {filteredLogs.map((log) => {
            const isPU = log.is_pickup;

            return (
              <div key={log.id} style={{
                display: 'flex',
                
                // PUの時は背景色をゴールドのグラデーションに変更
                background: isPU 
                  ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.02) 100%)' 
                  : 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
                
                padding: '10px 14px',
                borderRadius: '6px',
                
                // 全体を囲う枠線もPUの時は少しゴールドを混ぜる
                border: isPU 
                  ? '1px solid rgba(255, 215, 0, 0.2)' 
                  : '1px solid rgba(255,255,255,0.03)',
                  
                borderLeft: `3px solid ${isPU ? '#FFD700' : '#4facfe'}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                minHeight: '48px',
              }}>
                {/* 左側の情報ブロック */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                  
                  {/* ゲーム名/日付 & バッジ */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    
                    {/* 日付とゲーム名 */}
                    <div style={{ 
                      fontSize: '0.62rem', color: '#888', letterSpacing: '0.5px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                    }}>
                      {new Date(log.created_at).toLocaleDateString()} · {log.game_name}
                    </div>
                    
                    {/* バッジ */}
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: isPU ? '#FFD700' : '#aaa', 
                      background: isPU ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.05)', 
                      border: `1px solid ${isPU ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold',
                      letterSpacing: '0.5px',
                      flexShrink: 0,
                      display: 'inline-block' 
                    }}>
                      {log.pull_count}連 {isPU ? 'PICKUP' : '通常'}
                    </span>
                  </div>
                  
                  {/* 2行目: アイテム名 */}
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 'bold', 
                    color: isPU ? '#FFFDF0' : '#fff',     // PUの時は文字色も少しゴールドがかった白にする
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'left'
                  }}>
                    {log.item_name}
                  </div>
                </div>
                
                {/* 右側のボタンブロック */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '4px', 
                  marginLeft: '10px', 
                  alignItems: 'flex-end', 
                  flexShrink: 0 
                }}>
                  <button onClick={() => startEdit(log)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.75rem', padding: '0', textAlign: 'right' }}>編集</button>
                  <button onClick={() => handleDelete(log.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.75rem', padding: '0', textAlign: 'right' }}>削除</button>
                </div>
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px', fontSize: '0.9rem' }}>履歴はありません</div>
          )}
        </div>
      </CyberPlate>
    </>
  );
}

export default LogList;