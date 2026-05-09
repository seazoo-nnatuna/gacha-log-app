import React from 'react';

function BillingModal({
  isOpen,               // ウィンドウが開いているかどうかの判定
  onClose,              // 閉じるボタンを押した時の処理
  selectedGame,         // 今選ばれているゲーム名
  currentTheme,         // 今のテーマカラー
  totalBilling,         // 合計課金額
  billingInput,         // フォームに入力中の金額
  setBillingInput,      // 入力中の金額を更新する関数
  handleBillingSubmit,  // 送信（追加・更新）ボタンを押した時の処理
  billingLogs,          // 課金履歴のリスト
  startBillingEdit,     // 編集ボタンを押した時の処理
  handleBillingDelete,  // 削除ボタンを押した時の処理
  editingBillingId,     // 今編集しているデータのID
  cancelBillingEdit     // 編集をキャンセルする処理
})
{
  // isOpen が false（閉じる状態）なら、何も表示しない（nullを返す）
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        border: `1px solid ${currentTheme.accent}`,
        borderRadius: '15px',
        padding: '30px',
        width: '85%',
        maxWidth: '350px',
        textAlign: 'center',
        boxShadow: `0 0 30px ${currentTheme.accent}44`
      }}>

        <h2 style={{ marginTop: 0, color: currentTheme.accent, fontSize: '1.2rem' }}>
          {selectedGame === 'すべて' ? '全ゲームの累計課金額' : `${selectedGame} の累計課金額`}
        </h2>
        
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '20px 0', color: '#fff' }}>
          ¥ {totalBilling.toLocaleString()}
        </div>
        
        {selectedGame !== 'すべて' ? (
          <form onSubmit={handleBillingSubmit} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            <input 
              type="number" 
              value={billingInput} 
              onChange={(e) => setBillingInput(e.target.value)} 
              placeholder="例: 12000" 
              required
              style={{ 
                padding: '10px', borderRadius: '6px', border: '1px solid #555', 
                background: '#222', color: '#fff', width: '120px', fontSize: '1rem'
              }}
            />
            <button type="submit" style={{ 
              padding: '10px 20px', backgroundColor: currentTheme.accent, color: '#000', 
              border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' 
            }}>
              {editingBillingId ? '更新' : '追加'}
            </button>
            {editingBillingId && (
              <button type="button" onClick={cancelBillingEdit} style={{ background: 'none', color: '#aaa', border: 'none', cursor: 'pointer' }}>
                キャンセル
              </button>
            )}
          </form>
        ) : (
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '20px' }}>
            ※課金額を追加・編集するには特定のゲームタブを選択してください
          </p>
        )}

        <div style={{ 
          maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', 
          borderTop: '1px solid #444', paddingTop: '10px', textAlign: 'left' 
        }}>
          {billingLogs.map(log => (
            <div key={log.id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '10px', borderBottom: '1px solid #333' 
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>
                  {new Date(log.created_at).toLocaleDateString()} {selectedGame === 'すべて' && `· ${log.game_name}`}
                </div>
                <div style={{ fontSize: '1.1rem', color: '#fff' }}>¥ {log.amount.toLocaleString()}</div>
              </div>
              
              {selectedGame !== 'すべて' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => startBillingEdit(log)} style={{ background: 'none', border: 'none', color: currentTheme.accent, cursor: 'pointer', fontSize: '0.8rem' }}>編集</button>
                  <button onClick={() => handleBillingDelete(log.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.8rem' }}>削除</button>
                </div>
              )}
            </div>
          ))}
          {billingLogs.length === 0 && <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>履歴はありません</div>}
        </div>

        <button 
          onClick={() => {
            onClose(); // App.jsxから渡された閉じる処理を実行
            cancelBillingEdit(); 
          }}
          style={{
            backgroundColor: '#444', color: '#fff', border: 'none',
            padding: '10px 30px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

export default BillingModal;