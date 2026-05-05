import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const GAME_THEMES = {
  'すべて': { bg: '#1a1a1a', accent: '#ffffff' },
  'ゼンレスゾーンゼロ': { bg: '#eaff2b', accent: '#d0ff01' }, // 黄色ベース
  '崩壊：スターレイル': { bg: '#1c1e3a', accent: '#4facfe' }, // 紺・青ベース
  'アークナイツ：エンドフィールド': { bg: '#2c3e50', accent: '#a5dec0' },            // 緑・白ベース
  'アークナイツ': { bg: '#2c3e50', accent: '#a5dec0' }            // 緑・白ベース
};

function App() {
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]) // 取得したデータを保存する場所
  const [formData, setFormData] = useState({
    game_name: 'ゼンレスゾーンゼロ',
    item_name: '',
    pull_count: 0,
    rarity: 5,
    is_pickup: true
  })
  const [selectedGame, setSelectedGame] = useState('すべて');
  const [isSignUp, setIsSignUp] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 現在選ばれているゲームのテーマを取得
  const currentTheme = GAME_THEMES[selectedGame] || GAME_THEMES['すべて'];


  // --- 1. ログイン状態の監視 ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  // --- データを取得する関数 ---
  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('gacha_logs')
      .select('*')
      .order('created_at', { ascending: false }) // 新しい順に並べる

    if (error) console.error('エラー:', error)
    else setLogs(data)
  }

  // --- 修正版：データの自動読み込み設定 ---
  useEffect(() => {
    // session（ログイン状態）がある時だけデータを読み込む
    if (session) {
      fetchLogs();
    } else {
      // ログアウトした時はリストを空にする（安全のため）
      setLogs([]);
    }
  }, [session]); // session が変わる（ログイン・ログアウトする）たびに実行する
  /*
  useEffect(() => {
    fetchLogs()
  }, [])
  */

  useEffect(() => {
    // 「すべて」以外のゲームが選ばれた時だけ、フォームのゲーム名も書き換える
    if (selectedGame !== 'すべて') {
      setFormData(prev => ({
        ...prev,
        game_name: selectedGame
      }));
    }
  }, [selectedGame]); // selectedGame が変わるたびに実行される

  const handleAuth = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    console.log("ボタンが押されました");

    if (isSignUp) {
        // 【新規登録】の処理
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            // 先ほど設定した「Confirm Email」がOFFなら、これですぐログイン状態になります
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) {
          alert("登録失敗: " + error.message);
        } else {
          alert("確認メールを送りました（認証OFFならそのままログインできます）");
        }
      } else {
        // 【ここをチェック！】ログインの処理
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert("ログイン失敗: " + error.message);
        } else {
          console.log("ログイン成功！", data);
      // 成功すれば、useEffectの監視によって自動的に session が更新され、画面が切り替わります
        }
      }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingId) {
      // 【更新】の処理
      const { error } = await supabase
        .from('gacha_logs')
        .update(formData)
        .eq('id', editingId);

      if (error) alert('更新エラー: ' + error.message);
      else {
        alert('更新しました！');
        setEditingId(null);
        setFormData({ ...formData, item_name: '', pull_count: 0 });
        fetchLogs();
      }
    } else {
      const { error } = await supabase.from('gacha_logs').insert([formData])

      if (error) {
        alert('エラーが発生しました: ' + error.message)
      } else {
        alert('ガチャ結果を記録しました！')
        setFormData({ ...formData, item_name: '', pull_count: 0 })
        fetchLogs() // 保存に成功したらリストを更新する
      }
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


  // --- PU率の集計ロジック ---
  // 1. 星5（レア度5）のデータだけを抽出
  const star5Logs = filteredLogs.filter(log => log.rarity === 5);

  // 2. 星5の中で、PU（is_pickupがtrue）を引いた数
  const pickupCount = star5Logs.filter(log => log.is_pickup === true).length;

  // 3. 星5の中で、すり抜け（is_pickupがfalse）を引いた数
  const surinukeCount = star5Logs.length - pickupCount;

  // 4. PU率（星5を引いたとき、どれくらいの確率でPUだったか）
  const pickupRate = star5Logs.length > 0 
    ? ((pickupCount / star5Logs.length) * 100).toFixed(1) 
    : 0;



  // --- 4. 表示の切り替え ---
  // ログインしていない時
  if (!session) {
    return (
      <div style={{backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#333', padding: '30px', borderRadius: '10px', width: '300px' }}>
          <h2 style={{ textAlign: 'center' }}>
            {isSignUp ? '新規アカウント作成' : 'ガチャ管理ログイン'}
          </h2>
          
          <form onSubmit={handleAuth}>
            <input name="email" type="email" placeholder="メールアドレス" required style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} />
            <input name="password" type="password" placeholder="パスワード" required style={{ width: '100%', marginBottom: '20px', padding: '8px', boxSizing: 'border-box' }} />
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#FFD700', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {isSignUp ? '新規登録' : 'ログイン'}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            style={{ width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#FFD700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'ログイン画面へ戻る' : '初めての方はこちら（新規登録）'}
          </button>
        </div>
      </div>
    );
  }

  const startEdit = (log) => {
    setEditingId(log.id);
    setFormData({
      game_name: log.game_name,
      item_name: log.item_name,
      pull_count: log.pull_count,
      rarity: log.rarity,
      is_pickup: log.is_pickup
    });
    // 画面上部へスクロールさせる（フォームが上にある場合）
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ game_name: selectedGame !== 'すべて' ? selectedGame : 'ゼンレスゾーンゼロ', item_name: '', pull_count: 0, rarity: 5, is_pickup: true });
  };

return (
    <div style={{
        padding: '20px',
        background: `radial-gradient(circle at top left, ${currentTheme.bg}, #000)`,
        transition: 'all 0.8s ease',
        color: 'white',
        minHeight: '100vh',
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto' // 中央寄せ
      }}>

    {/* ヘッダーエリア */}
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
      <h1 style={{ fontSize: '1.5rem', letterSpacing: '2px', borderLeft: `4px solid ${currentTheme.accent}`, paddingLeft: '15px' }}>
        ガチャデータ集計
      </h1>
      <button onClick={handleSignOut} style={{ 
        background: 'transparent', border: '1px solid #666', color: '#ccc', 
        padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' 
      }}>ログアウト</button>
    </header>


    {/* ゲーム選択タブ */}
        <nav style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.keys(GAME_THEMES).map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: selectedGame === game ? currentTheme.accent : 'rgba(255,255,255,0.1)',
                color: selectedGame === game ? '#000' : '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                fontSize: '0.85rem'
              }}
            >
              {game}
            </button>
          ))}
        </nav>


    {/* 集計ダッシュボード */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px'
      }}>
        
      <StatCard label="累計連数" value={totalPulls} color="#fff" />
      <StatCard label="星5獲得" value={star5Count} color="#FFD700" />
      <StatCard label="星5期待値" value={averagePulls} unit="連" color="#ff4fac" />
      <StatCard label="PU率" value={pickupRate} unit="%" color="#4facfe" />
    </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1-1-1', gap: '10px', marginBottom: '20px' }}>
        {/* 既存の合計連数などのカード... */}
        <div style={{
          background: 'rgba(59, 28, 88, 0.3)', // 半透明
          backdropFilter: 'blur(12px)',           // 背景をぼかす
          border: '1px solid rgba(255, 255, 255, 0.2)', // 薄い枠線を追加
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#aaa' }}>星5中 PU率</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>{pickupRate}%</div>
          <div style={{ fontSize: '0.7rem', marginTop: '5px' }}>
            (PU: {pickupCount} / すり抜け: {surinukeCount})
          </div>
        </div>
      </div>

  {/* 入力フォームセクション */}
      {selectedGame !== 'すべて' ? (
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
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            alignItems: 'center' }}>

            {/*獲得アイテム*/}
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

            {/*連数*/}
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
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '20px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '15px' }}>

              {/*pick Up*/}
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
              <button type="submit" style={{ 
                padding: '12px 30px', 
                backgroundColor: currentTheme.accent, 
                color: '#000', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)' // 少し立体感
              }}>
                {editingId ? '更新する' : '結果を記録'}
              </button>
            </div>
          </div>
        </form>
      </section>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', border: '2px dashed #333', borderRadius: '15px', marginBottom: '40px' }}>
          ゲームを選択すると記録が可能になります
        </div>
      )}

      {/* 履歴リスト */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '12px', height: '12px', backgroundColor: currentTheme.accent, borderRadius: '50%' }}></span>
        LOGS
      </h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredLogs.map((log) => (
          <div key={log.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            padding: '15px 20px',
            borderRadius: '10px',
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
      </div>
    </div>
  )
}


// 小型コンポーネント（コードがスッキリします）
function StatCard({ label, value, unit = "", color }) {
  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      padding: '15px', 
      borderRadius: '12px', 
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '5px', fontWeight: 'bold' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color }}>
        {value}<span style={{ fontSize: '0.9rem', marginLeft: '2px' }}>{unit}</span>
      </div>
    </div>
  );
}

export default App