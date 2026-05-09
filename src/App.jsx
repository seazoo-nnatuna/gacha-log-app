import { useState, useEffect } from 'react'
import { supabase } from './supabase'

import StatCard from './components/StatCard'
import ActionButton from './components/ActionButton'
import BillingModal from './components/BillingModal'
import { GAME_THEMES } from './constants/gameThemes'

import AuthScreen from './components/AuthScreen'
import GachaForm from './components/GachaForm'
import CyberPlate from './components/CyberPlate'
import StatsDashboard from './components/StatsDashboard'
import LogList from './components/LogList'

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
      <AuthScreen 
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        handleAuth={handleAuth}
      />
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
      maxWidth: '480px',
      margin: '0 auto',           // 中央寄せ
      boxShadow: '0 0 30px rgba(0,0,0,0.8)', // アプリ画面の左右に影をつける
      position: 'relative'
    }}>
      
      {/* 上部の背景画像エリア */}
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

          {/* ▼ 集計ダッシュボードとPU率パネル */}
          <StatsDashboard 
            totalPulls={totalPulls}
            star5Count={star5Count}
            averagePulls={averagePulls}
            pickupRate={pickupRate}
            pickupCount={pickupCount}
            surinukeCount={surinukeCount}
          />

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
        
        {/* ▼ 入力フォームセクションをこれ1行に置き換え！ */}
        <GachaForm 
          selectedGame={selectedGame}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          editingId={editingId}
          cancelEdit={cancelEdit}
        />

        {/* ▼ 履歴リスト */}
        <LogList 
          filteredLogs={filteredLogs}
          currentTheme={currentTheme}
          startEdit={startEdit}
          handleDelete={handleDelete}
        />

      </div>
      
      {/* ▼課金モーダルウィンドウ */}
      <BillingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedGame={selectedGame}
        currentTheme={currentTheme}
        totalBilling={totalBilling}
        billingInput={billingInput}
        setBillingInput={setBillingInput}
        handleBillingSubmit={handleBillingSubmit}
        billingLogs={billingLogs}
        startBillingEdit={startBillingEdit}
        handleBillingDelete={handleBillingDelete}
        editingBillingId={editingBillingId}
        cancelBillingEdit={cancelBillingEdit}
      />
    </div>
  )
}

export default App