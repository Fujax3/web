
import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction } from './types';
import { getStoredUsers, saveUsers, getStoredTransactions, saveTransactions } from './services/storageService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'exchange' | 'members' | 'history' | 'admin'>('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    setUsers(getStoredUsers());
    setTransactions(getStoredTransactions());

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    if (currentUser) {
      const refreshed = updatedUsers.find(u => u.id === currentUser.id);
      if (refreshed) setCurrentUser(refreshed);
      else setCurrentUser(null);
    }
  };

  const handleAddTransaction = useCallback((newTransaction: Transaction) => {
    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const triggerInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => setInstallPrompt(null));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* Installation Android-Style Popup */}
      {installPrompt && (
        <div className="fixed top-6 inset-x-6 z-[100] bg-indigo-600 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/20 animate-in slide-in-from-top-10 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">📦</div>
            <div>
              <p className="text-sm font-black">Installer l'Application ?</p>
              <p className="text-[11px] opacity-70">Accédez à PointSwap hors-ligne</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setInstallPrompt(null)} className="text-[10px] font-black uppercase px-3">Non</button>
             <button onClick={triggerInstall} className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black shadow-lg">OUI</button>
          </div>
        </div>
      )}

      {/* Header Minimaliste (Retrait OFFLINE-READY selon consigne) */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl h-16 flex items-center justify-between px-6 sticky top-0 z-50 border-b dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-indigo-500/20 shadow-lg">P</div>
          <span className="font-black text-sm tracking-tight dark:text-white uppercase">POINTSWAP</span>
        </div>
        
        <div className="flex items-center gap-5">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-xl">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {currentUser && (
            <button onClick={() => setCurrentUser(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30">
              Quitter
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto pb-24 p-5">
        {!currentUser ? (
          <Auth onLogin={setCurrentUser} users={users} onUpdateUsers={handleUpdateUsers} />
        ) : (
          <Dashboard 
            currentUser={currentUser} 
            allUsers={users} 
            transactions={transactions}
            onUpdateUsers={handleUpdateUsers}
            onAddTransaction={handleAddTransaction}
            onLogout={() => setCurrentUser(null)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Bottom Navigation Immersive */}
      {currentUser && (
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border-t dark:border-gray-700 h-20 px-6 flex items-center justify-between z-50 pb-safe shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon="🏠" label="Home" />
          <NavItem active={activeTab === 'exchange'} onClick={() => setActiveTab('exchange')} icon="💸" label="Envoi" />
          <NavItem active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon="👥" label="Membres" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon="🕒" label="Flux" />
          {currentUser.isAdmin && <NavItem active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon="⚙️" label="Admin" />}
        </nav>
      )}

      {/* Footer text removed as per request */}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center flex-1 gap-1.5 transition-all">
    <div className={`text-2xl transition-all duration-300 ${active ? 'scale-110' : 'opacity-30 grayscale blur-[0.5px]'}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 opacity-50'}`}>{label}</span>
    {active && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-in zoom-in-0"></div>}
  </button>
);

export default App;
