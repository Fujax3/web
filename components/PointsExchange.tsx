
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';

interface PointsExchangeProps {
  currentUser: User;
  allUsers: User[];
  onUpdateUsers: (users: User[]) => void;
  onAddTransaction: (tx: Transaction) => void;
  selectedRecipient?: string;
}

const PointsExchange: React.FC<PointsExchangeProps> = ({ 
  currentUser, 
  allUsers, 
  onUpdateUsers, 
  onAddTransaction,
  selectedRecipient
}) => {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Synchronise si on sélectionne depuis la liste des membres globale
  useEffect(() => {
    if (selectedRecipient) {
      const user = allUsers.find(u => u.username === selectedRecipient);
      if (user) {
        setRecipientId(user.id);
      }
    }
  }, [selectedRecipient, allUsers]);

  const handleSendPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!recipientId) {
      setStatus({ type: 'error', text: 'Veuillez choisir un destinataire.' });
      return;
    }

    if (amount <= 0) {
      setStatus({ type: 'error', text: 'Le montant doit être supérieur à 0.' });
      return;
    }

    if (amount > currentUser.balance) {
      setStatus({ type: 'error', text: 'Solde insuffisant.' });
      return;
    }

    const recipient = allUsers.find(u => u.id === recipientId);

    if (!recipient || recipient.id === currentUser.id) {
      setStatus({ type: 'error', text: 'Destinataire invalide.' });
      return;
    }

    setLoading(true);

    const updatedUsers = allUsers.map(u => {
      if (u.id === currentUser.id) return { ...u, balance: u.balance - amount };
      if (u.id === recipient.id) return { ...u, balance: u.balance + amount };
      return u;
    });

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      senderId: currentUser.id,
      senderName: currentUser.username,
      receiverId: recipient.id,
      receiverName: recipient.username,
      amount,
      timestamp: new Date().toISOString()
    };

    onUpdateUsers(updatedUsers);
    onAddTransaction(newTransaction);
    
    setLoading(false);
    setStatus({ type: 'success', text: `${amount} pts envoyés à ${recipient.username} !` });
    setRecipientId('');
    setAmount(0);

    setTimeout(() => setStatus(null), 5000);
  };

  // Filtrer les autres utilisateurs pour la liste
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Envoyer des points
      </h3>

      <form onSubmit={handleSendPoints} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Choisir le destinataire</label>
          <select 
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white cursor-pointer"
          >
            <option value="">-- Sélectionner un membre --</option>
            {otherUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          {otherUsers.length === 0 && (
            <p className="text-[10px] text-orange-500 mt-1 italic">Aucun autre membre disponible pour le moment.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Montant à transférer</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="0"
              min="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-xs">PTS</span>
          </div>
        </div>

        {status && (
          <div className={`p-3 rounded-lg text-sm transition-all duration-300 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'}`}>
            {status.text}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading || otherUsers.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Traitement...' : 'Confirmer le transfert'}
        </button>
      </form>
    </div>
  );
};

export default PointsExchange;
