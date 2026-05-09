import React from 'react';
import ActionButton from './ActionButton';

function GachaForm({ selectedGame, formData, setFormData, handleSubmit, editingId, cancelEdit }) 
{
  // ゲームが選択されていない時の表示
  if (selectedGame === 'すべて') {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666', border: '2px dashed #333', borderRadius: '15px', marginBottom: '40px' }}>
        ゲームを選択すると記録が可能になります
      </div>
    );
  }

  // フォームの表示
  return (
    <section style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '25px',
      borderRadius: '15px',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '40px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1rem' }}>
        {editingId ? '編集中...' : '結果を記録'}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
        <div style={{ flex: '2', minWidth: '200px' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '5px' }}>獲得アイテム / キャラ</label>
          <input 
            type="text" 
            value={formData.item_name} 
            onChange={(e) => setFormData({...formData, item_name: e.target.value})} 
            placeholder="名前を入力" 
            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} 
            required 
          />
        </div>
        <div style={{ flex: '1', minWidth: '80px' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '5px' }}>連数</label>
          <input 
            type="number" 
            value={formData.pull_count} 
            onChange={(e) => setFormData({...formData, pull_count: parseInt(e.target.value)})} 
            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} 
          />
        </div>
        
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', 
          borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', width: '100%' 
        }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#fff' }}>
            <input 
              type="checkbox" 
              checked={formData.is_pickup}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              onChange={(e) => setFormData({...formData, is_pickup: e.target.checked})}
            />
            Pick Up
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{ background: 'none', color: '#aaa', border: 'none', cursor: 'pointer', padding: '0 10px' }}>
                キャンセル
              </button>
            )}
            <ActionButton type="submit" text={editingId ? '更新する' : '記録'} />
          </div>
        </div>
      </form>
    </section>
  );
}

export default GachaForm;