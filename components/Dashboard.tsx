
import React, { useState } from 'react';
import { User, Transaction } from '../types';
import PointsExchange from './PointsExchange';
import Transactions from './Transactions';
import UserList from './UserList';
import AdminPanel from './AdminPanel';

interface DashboardProps {
  currentUser: User;
  allUsers: User[];
  transactions: Transaction[];
  onUpdateUsers: (users: User[]) => void;
  onAddTransaction: (tx: Transaction) => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, 
  allUsers, 
  transactions, 
  onUpdateUsers, 
  onAddTransaction,
  onLogout,
  activeTab,
  setActiveTab
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const userTransactions = transactions.filter(tx => tx.senderId === currentUser.id || tx.receiverId === currentUser.id);

  const handleDeleteAccount = () => {
    onUpdateUsers(allUsers.filter(u => u.id !== currentUser.id));
    onLogout();
  };

  return (
    <div className="space-y-6">
      {activeTab === 'home' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Votre Solde</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black">{currentUser.balance.toLocaleString()}</h2>
              <span className="text-xl font-bold opacity-60">PTS</span>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">{currentUser.username[0].toUpperCase()}</div>
                <div>
                  <p className="text-sm font-bold">{currentUser.username}</p>
                  <p className="text-[10px] opacity-60 capitalize">{currentUser.isAdmin ? 'Admin' : 'Membre'}</p>
                </div>
              </div>
              <button onClick={() => setShowDeleteConfirm(true)} className="text-[9px] font-black opacity-40 hover:opacity-100">SUPPRIMER</button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm">
             <h3 className="font-black text-sm uppercase mb-4 opacity-50">Action Rapide</h3>
             <button onClick={() => setActiveTab('exchange')} className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl font-black text-sm flex items-center justify-between group">
               Transférer des points <span>→</span>
             </button>
          </div>
        </div>
      )}

      {activeTab === 'exchange' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <PointsExchange 
            currentUser={currentUser} 
            allUsers={allUsers} 
            onUpdateUsers={onUpdateUsers}
            onAddTransaction={onAddTransaction}
          />
        </div>
      )}

      {activeTab === 'members' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <UserList users={allUsers} currentUserId={currentUser.id} onSelectUser={() => setActiveTab('exchange')} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <Transactions transactions={userTransactions} currentUserId={currentUser.id} />
        </div>
      )}

      {activeTab === 'admin' && currentUser.isAdmin && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <AdminPanel allUsers={allUsers} transactions={transactions} onUpdateUsers={onUpdateUsers} onAddTransaction={onAddTransaction} />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black mb-2">Supprimer ?</h3>
            <p className="text-sm text-gray-500 mb-8">Attention, vos {currentUser.balance} points seront perdus définitivement.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDeleteAccount} className="bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-xs">Oui, supprimer</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl font-black uppercase text-xs text-gray-500">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
