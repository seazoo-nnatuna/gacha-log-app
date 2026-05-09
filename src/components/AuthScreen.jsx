import React from 'react';

function AuthScreen({ isSignUp, setIsSignUp, handleAuth })
{
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

export default AuthScreen;