import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const GAME_THEMES = {
  'すべて': { bg: '#1a1a1a', accent: '#ffffff' },
  'ゼンレスゾーンゼロ': { bg: '#eaff2b', accent: '#d0ff01',
    img: 'https://hqmakmtfaxfndxuqnbdz.supabase.co/storage/v1/object/public/BackGround/d9664f1281ca4dc8d057cbafb4df7ca9_754884677841569119.jpg'   }, // 紺・青ベース
  '崩壊：スターレイル': { bg: '#1c1e3a', accent: '#4facfe',
    img: 'https://hqmakmtfaxfndxuqnbdz.supabase.co/storage/v1/object/public/BackGround/412e118223d7dd96e68a2d057ba5717c_2106392138985937904.webp' }, // 黄色ベース
  'アークナイツ：エンドフィールド': { bg: '#2c3e50', accent: '#a5dec0',
    img: 'https://hqmakmtfaxfndxuqnbdz.supabase.co/storage/v1/object/public/BackGround/GjvV8BmaIAA9vQj.jpg' }, // 緑・白ベース
  'アークナイツ': { bg: '#2c3e50', accent: '#a5dec0',
    img: 'https://hqmakmtfaxfndxuqnbdz.supabase.co/storage/v1/object/public/BackGround/ErBEH7EXIAA-Bqg.jpg' }, // 緑・白ベース
};

function App() {
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]) // 取得したデータを保存する場所
  const [formData, setFormData] = useState({
    game_name: 'ゼンレスゾーンゼロ',
    item_name: '',
    item_type: 'キャラ',
    pull_count: 0,
    rarity: 5,
    is_pickup: true
  })
  const [selectedGame, setSelectedGame] = useState('すべて');
  const [isSignUp, setIsSignUp] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedType, setSelectedType] = useState('キャラ');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billingLogs, setBillingLogs] = useState([]); 
  const [editingBillingId, setEditingBillingId] = useState(null);


  //
  const [billingInput, setBillingInput] = useState(''); // フォームに入力中の金額
  const [totalBilling, setTotalBilling] = useState(0);  // 計算された累計課金額

  // ▼ 1. 取得関数を書き換え
  const fetchBilling = async () => {
    // select('*') にして、IDや作成日時もすべて取得する。新しい順に並べる
    let query = supabase.from('billing_logs').select('*').order('created_at', { ascending: false });

    if (selectedGame !== 'すべて') {
      query = query.eq('game_name', selectedGame);
    }

    const { data, error } = await query;

    if (error) {
      console.error('課金取得エラー:', error);
    } else {
      setBillingLogs(data); // ★ 取得したリストをそのまま保存
      const total = data.reduce((sum, log) => sum + log.amount, 0);
      setTotalBilling(total);
    }
  };

  // ▼ 2. ゲームが切り替わった時に課金額も自動で再取得する
  useEffect(() => {
    // ログインしていれば「すべて」の時でも計算を実行する
    if (session) {
      fetchBilling();
    } else {
      setTotalBilling(0);
    }
  }, [session, selectedGame]);

  // ▼ 課金額を保存・更新する処理
  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    if (!billingInput || isNaN(billingInput)) return;

    const amount = parseInt(billingInput, 10);

    if (editingBillingId) {
      // 【更新】の処理
      const { error } = await supabase.from('billing_logs').update({ amount }).eq('id', editingBillingId);
      if (error) alert('更新エラー: ' + error.message);
      else {
        setEditingBillingId(null);
        setBillingInput('');
        fetchBilling();
      }
    } else {
      // 【新規追加】の処理
      const { error } = await supabase.from('billing_logs').insert([{ game_name: selectedGame, amount }]);
      if (error) alert('エラーが発生しました: ' + error.message);
      else {
        setBillingInput('');
        fetchBilling();
      }
    }
  };

  // ▼ 課金データを削除する処理
  const handleBillingDelete = async (id) => {
    if (!confirm('この課金記録を削除してもよろしいですか？')) return;
    const { error } = await supabase.from('billing_logs').delete().eq('id', id);
    if (error) alert('削除に失敗しました: ' + error.message);
    else fetchBilling();
  };

  // ▼ 編集を開始する処理
  const startBillingEdit = (log) => {
    setEditingBillingId(log.id);
    setBillingInput(log.amount.toString()); // 入力欄に今の金額をセットする
  };

  // ▼ 編集をキャンセルする処理
  const cancelBillingEdit = () => {
    setEditingBillingId(null);
    setBillingInput('');
  };


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

    // 送信する直前に、現在開いているタブの種類（キャラ or 武器）を確実に合体させる
    const submitData = {
      ...formData,
      item_type: selectedType
    };    

    if (editingId) {
      // 【更新】の処理
      const { error } = await supabase
        .from('gacha_logs')
        .update(submitData)
        .eq('id', editingId);

      if (error) alert('更新エラー: ' + error.message);
      else {
        alert('更新しました！');
        setEditingId(null);
        setFormData({ ...formData, item_name: '', pull_count: 0 });
        fetchLogs();
      }
    } else {
      const { error } = await supabase.from('gacha_logs').insert([submitData])

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
  const filteredLogs = logs.filter(log => {
    const matchGame = selectedGame === 'すべて' || log.game_name === selectedGame;
    const type = log.item_type || 'キャラ'; // 過去のデータ(null)は「キャラ」扱い
    const matchType = type === selectedType;
    
    return matchGame && matchType;
  });    

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
      item_type: log.item_type || 'キャラ',
      pull_count: log.pull_count,
      rarity: log.rarity,
      is_pickup: log.is_pickup
    });
    // 画面上部へスクロールさせる（フォームが上にある場合）
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      game_name: selectedGame !== 'すべて' ? selectedGame : 'ゼンレスゾーンゼロ',
      item_name: '',
      item_type: selectedType,
      pull_count: 0,
      rarity: 5,
      is_pickup: true });
  };


return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: 'white',
      minHeight: '100vh',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',

      // ▼ ここから追加：全体を中央に配置し、影をつける
      maxWidth: '480px',          // ここも480pxに
      margin: '0 auto',           // 中央寄せ
      boxShadow: '0 0 30px rgba(0,0,0,0.8)', // アプリ画面の左右に影をつける
      position: 'relative'
    }}>
      
      {/* 2. 新しく追加した「上部の背景画像エリア」 */}
      <div style={{
        backgroundImage: currentTheme.img ? `url(${currentTheme.img})` : 'none',
        backgroundSize: 'contain', // 画像全体を収める
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center', // 画像を上部中央に配置
        position: 'relative',
      }}>
        
        {/* 背景を少し暗くして文字を読みやすくするフィルター */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', 
          zIndex: 0
        }}></div>

        {/* 3. 上部のコンテンツ（ヘッダーからPU率まで） */}
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 1 }}>

          {/* ヘッダーエリア */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '1.5rem', letterSpacing: '2px', borderLeft: `4px solid ${currentTheme.accent}`, paddingLeft: '15px' }}>
              ガチャデータ集計
            </h1>
          <ActionButton 
            text="ログアウト" 
            onClick={handleSignOut} 
            style={{ backgroundColor: '#444', color: '#fff' }} // ログアウトは目立たせたくないので色を上書き
          />
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

          {/* ▼ 板状になった「キャラ / 武器」切り替えタブ */}
          <div style={{ 
            display: 'flex', 
            // タブの下に敷く、テーマカラーの長いライン
            borderBottom: `3px solid ${currentTheme.accent}`, 
            marginBottom: '20px',
            paddingLeft: '10px' // 左に少し余白を開ける
          }}>
            {['キャラ', '武器'].map((type) => {
              const isActive = selectedType === type; // 選ばれているかどうか
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '12px 30px',
                    // 選ばれている時はテーマカラー、選ばれていない時は半透明の黒
                    backgroundColor: isActive ? currentTheme.accent : 'rgba(0, 0, 0, 0.6)',
                    color: isActive ? '#000' : '#aaa',
                    border: 'none',
                    // ★ここがポイント！ 左上と右上の角だけを丸くする (左上 右上 右下 左下)
                    borderRadius: '12px 12px 0 0', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    marginRight: '4px', // タブ同士のわずかな隙間
                    
                    // 下のライン(borderBottom)とシームレスに繋げるための微調整
                    position: 'relative',
                    top: '3px', // 下の枠線に被せるように数ピクセル下げる
                    zIndex: isActive ? 2 : 1, // アクティブなタブを一番手前に持ってくる
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>

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
            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>星5中 PU率</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>{pickupRate}%</div>
            <div style={{ fontSize: '0.7rem', marginTop: '5px' }}>
              (PU: {pickupCount} / すり抜け: {surinukeCount})
            </div>
          </div>

          {/* 課金額を確認するボタン */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button 
              onClick={() => setIsModalOpen(true)} // ★押すとウィンドウが開く(trueになる)
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${currentTheme.accent}`,
                color: currentTheme.accent,
                padding: '8px 24px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              💰 課金額を確認
            </button>
          </div>

        </div>
      </div>
      {/* --- 上部エリアここまで --- */}


      {/* 4. 下部エリア（フォームと履歴） */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
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
                <ActionButton 
                  type="submit" 
                  text={editingId ? '更新する' : '記録'} 
                />
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

        <CyberPlate>
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
        </div>
        </CyberPlate>
      </div>

      {/* ▼ ここに追加：課金確認用のモーダルウィンドウ */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', // 画面全体に固定
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // 背景を真っ黒の半透明にする
          zIndex: 9999, // 一番手前に表示する
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* ウィンドウのパネル本体 */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: `1px solid ${currentTheme.accent}`,
            borderRadius: '15px',
            padding: '30px',
            width: '85%',
            maxWidth: '350px', // パネルが大きくなりすぎないように制限
            textAlign: 'center',
            boxShadow: `0 0 30px ${currentTheme.accent}44` // テーマカラーでぼんやり光らせる
          }}>

            {/* タイトルの出し分け */}
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
                  {editingBillingId ? '更新' : '追加'} {/* ★編集中はボタンの名前を変える */}
                </button>
                {editingBillingId && (
                  <button type="button" onClick={cancelBillingEdit} style={{ background: 'none', color: '#aaa', border: 'none', cursor: 'pointer' }}>
                    キャンセル
                  </button>
                )}
              </form>
            ) : (
              <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '20px' }}>
                {/*※課金額を追加・編集するには特定のゲームタブを選択してください*/}
              </p>
            )}

            {/* ▼ ここを追加：課金履歴のリスト表示（スクロールできるようにする） */}
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
                  
                  {/* 「すべて」タブ以外の時だけ、編集・削除ボタンを表示する */}
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

            {/* 閉じるボタン */}
            <button 
              onClick={() => {
                setIsModalOpen(false);
                cancelBillingEdit(); // 閉じる時に編集状態もリセットしておく
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
      )}

    </div>
  )
}

// サイバー風のプレート部品
function CyberPlate({ title, children }) {
  return (
    <div style={{
      backgroundColor: '#3b3b3b', // プレート自体のベース色（暗いグレー）
      border: '2px solid #555',   // プレートの外枠
      borderRadius: '8px',        // 角を少し丸くする
      overflow: 'hidden',         // 中身が枠からはみ出ないようにする
      position: 'relative',
      marginBottom: '20px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.5)' // 浮き出ているような影
    }}>
      
      {/* 左上のスラッシュ装飾（疑似的にCSSで作成） */}
      <div style={{
        position: 'absolute', top: '5px', left: '10px',
        color: '#555', fontSize: '0.6rem', fontWeight: 'bold', fontStyle: 'italic'
      }}>
        ●
      </div>

      {/* ヘッダー部分（赤黒いグラデーション） */}
      <div style={{
        background: 'linear-gradient(90deg, #4a1c1c 0%, #1a1a1a 100%)', // 左から右へのグラデーション
        padding: '15px 20px 10px 40px', // 左側にスラッシュ用の余白を開ける
        borderBottom: '1px solid #333'
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#eee' }}>{title}</span>
      </div>

      {/* 中身のコンテンツ */}
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}


// ZZZ風の黄色いアクションボタン
function ActionButton({ text, onClick, type="button", style={} }) {
  return (
    <button 
      onClick={onClick}
      style={{
        backgroundColor: '#ffd700', // ZZZの特徴的な黄色
        color: '#000',              // 文字は黒
        border: 'none',
        borderRadius: '20px',       // かなり丸みを帯びた角
        padding: '8px 20px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        ...style
      }}>
      {text}
    </button>
  );
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