// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const useAuth = () =>
{
  const [session, setSession] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // ログイン状態の監視
  useEffect(() =>
  {
    supabase.auth.getSession().then(({ data: { session } }) =>
    {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
    {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ログイン・新規登録処理
  const handleAuth = async (e) =>
  {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (isSignUp)
    {
      const { error } = await supabase.auth.signUp(
      { 
        email, 
        password,
        options: { emailRedirectTo: window.location.origin }
      });

      if (error)    alert("登録失敗: " + error.message);
      else          alert("確認メールを送りました（認証OFFならそのままログインできます）");
    }
    else
    {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error)    alert("ログイン失敗: " + error.message);
    }
  };

  // ログアウト処理
  const handleSignOut = async () =>
  {
    await supabase.auth.signOut();
  };

  return {
    session,
    isSignUp,
    setIsSignUp,
    handleAuth,
    handleSignOut
  };
};