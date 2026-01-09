
import React from 'react';
import { User } from '../types';

interface UserListProps {
  users: User[];
  currentUserId: string;
  onSelectUser: (username: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onSelectUser }) => {
  // Trier par solde décroissant, puis par nom
  const sortedUsers = [...users].sort((a, b) => {
    if (b.balance !== a.balance) return b.balance - a.balance;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Membres ({users.length})
      </h3>

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin">
        {sortedUsers.map(user => (
          <button 
            key={user.id} 
            onClick={() => user.id !== currentUserId && onSelectUser(user.username)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
              user.id === currentUserId 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 cursor-default' 
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase transition-colors ${
                user.id === currentUserId 
                ? 'bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
              }`}>
                {user.username.substring(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  {user.username} 
                  {user.id === currentUserId && <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium ml-1">VOUS</span>}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {user.id === currentUserId ? 'Votre compte' : 'Cliquez pour envoyer'}
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              {user.balance.toLocaleString()} pts
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserList;
