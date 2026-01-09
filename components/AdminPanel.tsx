
import React, { useState, useMemo, useRef } from 'react';
import { User, Transaction } from '../types';
import { exportAllData, importData } from '../services/storageService';

interface AdminPanelProps {
  allUsers: User[];
  transactions: Transaction[];
  onUpdateUsers: (users: User[]) => void;
  onAddTransaction: (tx: Transaction) => void;
}

type AdminTab = 'points' | 'accounts' | 'history' | 'system';

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, transactions, onUpdateUsers, onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('points');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions]);

  const adjustPoints = (userId: string, amount: number) => {
    if (!userId) return showMsg("Sélectionnez un membre", "error");
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, balance: Math.max(0, u.balance + amount) } : u);
    const newTx: Transaction = {
      id: `admin-adj-${Date.now()}`,
      senderId: 'SYSTEM',
      senderName: '🛠️ ADMINISTRATION',
      receiverId: targetUser.id,
      receiverName: targetUser.username,
      amount: amount,
      timestamp: new Date().toISOString()
    };
    onUpdateUsers(updatedUsers);
    onAddTransaction(newTx);
    showMsg(`Points ajustés pour ${targetUser.username}`);
  };

  const handleInterTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !targetUserId || selectedUserId === targetUserId || customAmount <= 0) {
      showMsg("Données de transfert invalides", "error");
      return;
    }
    const fromUser = allUsers.find(u => u.id === selectedUserId);
    const toUser = allUsers.find(u => u.id === targetUserId);
    if (!fromUser || !toUser || fromUser.balance < customAmount) {
      showMsg("Erreur de transfert", "error");
      return;
    }
    const updatedUsers = allUsers.map(u => {
      if (u.id === fromUser.id) return { ...u, balance: u.balance - customAmount };
      if (u.id === toUser.id) return { ...u, balance: u.balance + customAmount };
      return u;
    });
    onUpdateUsers(updatedUsers);
    onAddTransaction({
      id: `admin-xfer-${Date.now()}`,
      senderId: fromUser.id,
      senderName: `${fromUser.username} (Admin)`,
      receiverId: toUser.id,
      receiverName: toUser.username,
      amount: customAmount,
      timestamp: new Date().toISOString()
    });
    setCustomAmount(0);
    showMsg("Transfert forcé réussi");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importData(event.target?.result as string);
      if (result) {
        window.location.reload(); // Rechargement brutal pour rafraîchir tout l'état de l'app
      } else {
        showMsg("Fichier invalide", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-1 overflow-x-auto">
        {[
          { id: 'points', label: 'Points', icon: '💰' },
          { id: 'accounts', label: 'Comptes', icon: '👤' },
          { id: 'history', label: 'Flux', icon: '🌍' },
          { id: 'system', label: 'Local/Backup', icon: '💾' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex-1 py-2 px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[300px]">
        {activeTab === 'points' && (
          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase text-gray-400">Contrôle des Points</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-gray-500 uppercase">Ajustement rapide</p>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border p-2 rounded-lg text-sm dark:text-white">
                  <option value="">Choisir un membre...</option>
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.username} ({u.balance} pts)</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => adjustPoints(selectedUserId, 500)} className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold py-2 rounded-lg border border-emerald-100">+500</button>
                  <button onClick={() => adjustPoints(selectedUserId, -500)} className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-bold py-2 rounded-lg border border-red-100">-500</button>
                </div>
              </div>
              <form onSubmit={handleInterTransfer} className="space-y-4 pt-4 md:pt-0">
                <p className="text-[11px] font-bold text-gray-500 uppercase">Arbitrage entre membres</p>
                <div className="grid grid-cols-2 gap-2">
                   <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border p-2 rounded-lg text-xs dark:text-white">
                     <option value="">De...</option>
                     {allUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                   </select>
                   <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border p-2 rounded-lg text-xs dark:text-white">
                     <option value="">À...</option>
                     {allUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                   </select>
                </div>
                <input type="number" placeholder="Montant" value={customAmount || ''} onChange={(e) => setCustomAmount(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-700 border p-2 rounded-lg text-sm dark:text-white"/>
                <button type="submit" className="w-full bg-gray-900 dark:bg-gray-600 text-white p-2 rounded-lg text-[10px] font-black uppercase">Appliquer le transfert</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-8 text-center py-8">
            <h4 className="text-sm font-black uppercase text-gray-400">Gestion de la Base de Données Locale</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Puisque ce site fonctionne localement, sauvegardez régulièrement vos données dans un fichier JSON pour éviter toute perte lors d'un nettoyage de navigateur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={exportAllData}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700"
              >
                <span>📤</span> Exporter JSON
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <span>📥</span> Importer JSON
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
            </div>
          </div>
        )}

        {/* ... Autres onglets (Accounts/History) restent identiques ou similaires ... */}
        {activeTab === 'accounts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {allUsers.map(u => (
                <div key={u.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{u.username}</p>
                    <p className="text-[10px] opacity-50">{u.balance} pts</p>
                  </div>
                  <button onClick={() => { if(confirm("Supprimer ?")) onUpdateUsers(allUsers.filter(x => x.id !== u.id))}} className="text-red-500 text-xs">Supprimer</button>
                </div>
             ))}
          </div>
        )}

        {activeTab === 'history' && (
           <div className="overflow-x-auto">
             <table className="w-full text-[10px] text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr><th className="p-2">Exp</th><th className="p-2">Dest</th><th className="p-2 text-right">Pts</th></tr>
                </thead>
                <tbody>
                  {sortedTransactions.slice(0, 50).map(tx => (
                    <tr key={tx.id} className="border-b dark:border-gray-700"><td className="p-2">{tx.senderName}</td><td className="p-2">{tx.receiverName}</td><td className="p-2 text-right font-bold">{tx.amount}</td></tr>
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {message && (
          <div className={`mt-6 p-3 rounded-xl text-center text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
