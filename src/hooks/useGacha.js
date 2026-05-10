// src/hooks/useGacha.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const useGacha = (session, selectedGame) =>
{
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState(
  {
    game_name: selectedGame !== 'すべて' ? selectedGame : 'ゼンレスゾーンゼロ',
    item_name: '',
    item_type: 'キャラ',
    pull_count: 0,
    rarity: 5,
    is_pickup: true
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedType, setSelectedType] = useState('キャラ');

  // データ取得
  const fetchLogs = async () =>
  {
    const { data, error } = await supabase
      .from('gacha_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error)      console.error('エラー:', error);
    else            setLogs(data);
  };

  // ログイン状態が変わった時の監視
  useEffect(() =>
  {
    if (session) fetchLogs();
    else setLogs([]);
  }, [session]);

  // ゲームタブが切り替わった時にフォームのゲーム名を自動更新する
  useEffect(() =>
  {
    if (selectedGame !== 'すべて')
    {
      setFormData(prev => ({ ...prev, game_name: selectedGame }));
    }
  }, [selectedGame]);

  // 送信・更新処理
  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    const submitData = { ...formData, item_type: selectedType };

    if (editingId)
    {
      const { error } = await supabase.from('gacha_logs').update(submitData).eq('id', editingId);
      if (error)
      {
        alert('更新エラー: ' + error.message);
      }
      else
      {
        alert('更新しました！');
        setEditingId(null);
        setFormData({ ...formData, item_name: '', pull_count: 0 });
        fetchLogs();
      }
    }
    else
    {
      const { error } = await supabase.from('gacha_logs').insert([submitData]);

      if (error)
      {
        alert('エラーが発生しました: ' + error.message);
      }
      else
      {
        alert('ガチャ結果を記録しました！');
        setFormData({ ...formData, item_name: '', pull_count: 0 });
        fetchLogs();
      }
    }
  };

  // 削除処理
  const handleDelete = async (id) =>
  {
    if (!window.confirm('この記録を削除してもよろしいですか？'))    return;

    const { error } = await supabase.from('gacha_logs').delete().eq('id', id);
    if (error)      alert('削除に失敗しました: ' + error.message);
    else            fetchLogs();
  };

  // 編集開始・キャンセル処理
  const startEdit = (log) =>
  {
    setEditingId(log.id);
    setFormData(
    {
      game_name: log.game_name,
      item_name: log.item_name,
      item_type: log.item_type || 'キャラ',
      pull_count: log.pull_count,
      rarity: log.rarity,
      is_pickup: log.is_pickup
    });
    
    // スクロール処理
    // 少しだけ時間を遅らせる（50ミリ秒）   Reactの画面更新が確実に終わってからスクロールさせる
    setTimeout(() =>
    {
      const formElement = document.getElementById('gacha-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

  };

  const cancelEdit = () =>
  {
    setEditingId(null);
    setFormData(
    {
      game_name: selectedGame !== 'すべて' ? selectedGame : 'ゼンレスゾーンゼロ',
      item_name: '',
      item_type: selectedType,
      pull_count: 0,
      rarity: 5,
      is_pickup: true
    });
  };

  // --- 集計ロジック ---
  const filteredLogs = logs.filter(log =>
  {
    const matchGame = selectedGame === 'すべて' || log.game_name === selectedGame;
    const type = log.item_type || 'キャラ';
    const matchType = type === selectedType;
    return matchGame && matchType;
  });

  const totalPulls = filteredLogs.reduce((sum, log) => sum + log.pull_count, 0);
  const star5Count = filteredLogs.filter(log => log.item_name.includes('★5') || log.rarity === 5).length;
  const averagePulls = star5Count > 0 ? (totalPulls / star5Count).toFixed(1) : 0;

  const star5Logs = filteredLogs.filter(log => log.rarity === 5);
  const pickupCount = star5Logs.filter(log => log.is_pickup === true).length;
  const surinukeCount = star5Logs.length - pickupCount;
  const pickupRate = star5Logs.length > 0 ? ((pickupCount / star5Logs.length) * 100).toFixed(1) : 0;

  return {
    formData, setFormData, editingId, selectedType, setSelectedType,
    handleSubmit, handleDelete, startEdit, cancelEdit,
    filteredLogs, totalPulls, star5Count, averagePulls, pickupRate, pickupCount, surinukeCount
  };
};