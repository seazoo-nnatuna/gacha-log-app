import { useState } from 'react';
import { useAuth } from './hooks/useAuth'
import { GAME_THEMES } from './constants/gameThemes'
import { useBilling } from './hooks/useBilling';
import { useGacha } from './hooks/useGacha';

import StatCard from './components/StatCard'
import ActionButton from './components/ActionButton'
import BillingModal from './components/BillingModal'

import AuthScreen from './components/AuthScreen'
import GachaForm from './components/GachaForm'
import CyberPlate from './components/CyberPlate'
import StatsDashboard from './components/StatsDashboard'
import LogList from './components/LogList'

import Header from './components/Header'
import GameTabs from './components/GameTabs'
import TypeTabs from './components/TypeTabs'


function App()
{
  const [selectedGame, setSelectedGame] = useState('すべて');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 認証ロジックを呼び出し
  const
  {
    session, isSignUp, setIsSignUp, handleAuth, handleSignOut
  } = useAuth();

  // 課金ロジックの呼び出し
  const
  {
    billingInput, setBillingInput, totalBilling, billingLogs, editingBillingId,
    handleBillingSubmit, handleBillingDelete, startBillingEdit, cancelBillingEdit
  } = useBilling(session, selectedGame);

  // ガチャロジックの呼び出し
  const
  {
    formData, setFormData, editingId, selectedType, setSelectedType,
    handleSubmit, handleDelete, startEdit, cancelEdit,
    filteredLogs, totalPulls, star5Count, averagePulls, pickupRate, pickupCount, surinukeCount
  } = useGacha(session, selectedGame);

  // 現在選ばれているゲームのテーマを取得
  const currentTheme = GAME_THEMES[selectedGame] || GAME_THEMES['すべて'];

  // ログインしていない時の表示
  if (!session)
  {
    return <AuthScreen isSignUp={isSignUp} setIsSignUp={setIsSignUp} handleAuth={handleAuth} />;
  }

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

        {/* 上部のコンテンツ（ヘッダーからPU率まで） */}
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 1 }}>

          <Header currentTheme={currentTheme} handleSignOut={handleSignOut} />
          <GameTabs selectedGame={selectedGame} setSelectedGame={setSelectedGame} currentTheme={currentTheme} />
          <TypeTabs selectedType={selectedType} setSelectedType={setSelectedType} currentTheme={currentTheme} />

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