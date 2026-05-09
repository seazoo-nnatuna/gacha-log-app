// src/hooks/useBilling.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// カスタムフックは必ず「use」から始まる名前にします
// App.jsx から「今のログイン状態(session)」と「選ばれているゲーム(selectedGame)」を受け取ります
export const useBilling = (session, selectedGame) =>
{
  const [billingInput, setBillingInput] = useState('');
  const [totalBilling, setTotalBilling] = useState(0);
  const [billingLogs, setBillingLogs] = useState([]);
  const [editingBillingId, setEditingBillingId] = useState(null);

  const fetchBilling = async () =>
  {
    let query = supabase.from('billing_logs').select('*').order('created_at', { ascending: false });

    if (selectedGame !== 'すべて') 
    {
      query = query.eq('game_name', selectedGame);
    }

    const { data, error } = await query;

    if (error)
    {
      console.error('課金取得エラー:', error);
    }
    else
    {
      setBillingLogs(data);
      const total = data.reduce((sum, log) => sum + log.amount, 0);
      setTotalBilling(total);
    }
  };

  useEffect(() =>
  {
    if (session)
    {
      fetchBilling();
    }
    else
    {
      setTotalBilling(0);
      setBillingLogs([]);
    }
  }, [session, selectedGame]);

  const handleBillingSubmit = async (e) =>
  {
    e.preventDefault();
    if (!billingInput || isNaN(billingInput))   return;

    const amount = parseInt(billingInput, 10);

    if (editingBillingId)
    {
      const { error } = await supabase.from('billing_logs').update({ amount }).eq('id', editingBillingId);
      if (error)
      {
        alert('更新エラー: ' + error.message);
      }
      else
      {
        setEditingBillingId(null);
        setBillingInput('');
        fetchBilling();
      }
    }
    else
    {
      const { error } = await supabase.from('billing_logs').insert([{ game_name: selectedGame, amount }]);
      if (error)
      {
        alert('エラーが発生しました: ' + error.message);
      }
      else
      {
        setBillingInput('');
        fetchBilling();
      }
    }
  };

  const handleBillingDelete = async (id) =>
  {
    if (!window.confirm('この課金記録を削除してもよろしいですか？'))    return;

    const { error } = await supabase.from('billing_logs').delete().eq('id', id);
    if (error)      alert('削除に失敗しました: ' + error.message);
    else            fetchBilling();
  };

  const startBillingEdit = (log) =>
  {
    setEditingBillingId(log.id);
    setBillingInput(log.amount.toString());
  };

  const cancelBillingEdit = () =>
  {
    setEditingBillingId(null);
    setBillingInput('');
  };

  // 最後に、App.jsxで使いたいデータや関数を「オブジェクト」として丸ごと返します
  return{
    billingInput,
    setBillingInput,
    totalBilling,
    billingLogs,
    editingBillingId,
    handleBillingSubmit,
    handleBillingDelete,
    startBillingEdit,
    cancelBillingEdit,
  };
};