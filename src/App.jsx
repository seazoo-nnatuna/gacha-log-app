import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [logs, setLogs] = useState([]) // 取得したデータを保存する場所
  const [formData, setFormData] = useState({
    game_name: 'ゼンレスゾーンゼロ',
    item_name: '',
    pull_count: 0,
    rarity: 5,
    is_pickup: true
  })
  const [selectedGame, setSelectedGame] = useState('すべて');

  // --- データを取得する関数 ---
  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('gacha_logs')
      .select('*')
      .order('created_at', { ascending: false }) // 新しい順に並べる

    if (error) console.error('エラー:', error)
    else setLogs(data)
  }

  // --- 画面が開いた時に一度だけデータを読み込む ---
  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('gacha_logs').insert([formData])

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      alert('ガチャ結果を記録しました！')
      setFormData({ ...formData, item_name: '', pull_count: 0 })
      fetchLogs() // 保存に成功したらリストを更新する
    }
  }

  // --- 削除用の関数 ---
  const handleDelete = async (id) => {
    // 間違えて押しちゃった時のための確認
    if (!confirm('この記録を削除してもよろしいですか？')) return

    const { error } = await supabase
      .from('gacha_logs')
      .delete()
      .eq('id', id) // 「このIDのデータを消して」という指定

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      fetchLogs() // 消し終わったら、最新の状態を読み込み直す
    }
  }

  // --- 集計ロジック ---
  // 現在の選択に合わせて絞り込まれたログ
  const filteredLogs = logs.filter(log => 
    selectedGame === 'すべて' || log.game_name === selectedGame
  );    

  // 1. 全体の合計連数
  const totalPulls = filteredLogs.reduce((sum, log) => sum + log.pull_count, 0);

  // 2. 星5（レア度5）の数
  const star5Count = filteredLogs.filter(log => log.item_name.includes('★5') || log.rarity === 5).length; // 条件は既存のコードに合わせてください

  // 3. 星5の期待値（平均何連で引けているか）
  const averagePulls = star5Count > 0 ? (totalPulls / star5Count).toFixed(1) : 0;  

return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>ガチャ統計分析</h1>

      {/* --- ここから追加 --- */}
      {['すべて', 'ゼンレスゾーンゼロ', '崩壊：スターレイル', 'アークナイツ：エンドフィールド', 'アークナイツ'].map((game) => (
        <button
          key={game}
          onClick={() => setSelectedGame(game)}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            marginBottom: '10px',
            borderRadius: '20px',
            border: 'none',
            // 現在選ばれているボタンだけ色を変える
            backgroundColor: selectedGame === game ? '#FFD700' : '#444',
            color: selectedGame === game ? '#000' : '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {game}
        </button>
      ))}
      {/* --- ここまで追加 --- */}


      {/* 集計パネル */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px',
        backgroundColor: '#2a2a2a',
        padding: '20px',
        borderRadius: '12px'
      }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>累計連数</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>{totalPulls}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>星5獲得数</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>{star5Count}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>星5平均(期待値)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF5722' }}>{averagePulls}<span style={{fontSize: '1rem'}}>連</span></div>
        </div>
      </div>
      
      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block' }}>ゲーム</label>
          <select value={formData.game_name} onChange={(e) => setFormData({...formData, game_name: e.target.value})} style={{ padding: '8px' }}>
            <option>ゼンレスゾーンゼロ</option>
            <option>崩壊：スターレイル</option>
            <option>アークナイツ：エンドフィールド</option>
            <option>アークナイツ</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block' }}>当たったもの</label>
          <input type="text" value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} placeholder="エレンなど" style={{ padding: '8px' }} required />
        </div>
        <div>
          <label style={{ display: 'block' }}>連数</label>
          <input type="number" value={formData.pull_count} onChange={(e) => setFormData({...formData, pull_count: parseInt(e.target.value)})} style={{ padding: '8px', width: '60px' }} />
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          保存
        </button>
      </form>

      {/* 履歴一覧 */}
      <h2>ガチャ履歴</h2>
      <div style={{ display: 'grid', gap: '10px' }}>
        {logs
          .filter(log => {
                // 「すべて」が選ばれているなら全部通す
                if (selectedGame === 'すべて') return true;
                // そうでなければ、ログのゲーム名と選んだボタンの名前が一致するものだけ通す
                return log.game_name === selectedGame;
              })
          .map((log) => (
          <div key={log.id} style={{ position: 'relative',　backgroundColor: '#333', padding: '15px', borderRadius: '8px', borderLeft: log.game_name === 'ゼンレスゾーンゼロ' ? '5px solid #FFD700' : '5px solid #00BFFF' }}>


      {/* 削除ボタン */}
            <button 
              onClick={() => handleDelete(log.id)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'transparent',
                border: '1px solid #ff4d4f',
                color: '#ff4d4f',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '0.8rem',
                padding: '2px 8px'
              }}
            >
              削除
            </button>

            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(log.created_at).toLocaleString()}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {log.item_name} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>({log.pull_count}連目)</span>
            </div>
            <div style={{ color: '#eee' }}>{log.game_name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App