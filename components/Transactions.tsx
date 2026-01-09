
import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  currentUserId: string;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, currentUserId }) => {
  // Memoization pour éviter de re-trier la liste à chaque rendu
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Derniers Flux
      </h3>

      <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="text-sm italic">Aucun mouvement pour le moment.</p>
          </div>
        ) : (
          sortedTransactions.map(tx => {
            const isOutgoing = tx.senderId === currentUserId;
            const isSystem = tx.senderId === 'SYSTEM';
            
            return (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-indigo-100 dark:hover:border-indigo-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSystem 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : isOutgoing ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  }`}>
                    {isSystem ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : isOutgoing ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                      {isSystem ? (
                        <span className="text-emerald-600 dark:text-emerald-400 truncate">Ajustement Admin</span>
                      ) : isOutgoing ? `Vers ${tx.receiverName}` : `De ${tx.senderName}`}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1 uppercase">
                      {new Date(tx.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-black whitespace-nowrap ml-4 ${isSystem ? 'text-emerald-600 dark:text-emerald-400' : isOutgoing ? 'text-gray-600 dark:text-gray-300' : 'text-green-600 dark:text-green-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Transactions;
