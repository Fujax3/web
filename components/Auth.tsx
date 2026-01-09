
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  users: User[];
  onUpdateUsers: (users: User[]) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, users, onUpdateUsers }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (isRegistering) {
      const existing = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (existing) {
        setError('Ce nom d\'utilisateur est déjà pris.');
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        username: cleanUsername,
        password,
        balance: 100, // Bonus de bienvenue
        isAdmin: cleanUsername.toLowerCase() === 'admin', // Le pseudo "admin" devient admin
        createdAt: new Date().toISOString()
      };

      onUpdateUsers([...users, newUser]);
      onLogin(newUser);
    } else {
      const user = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Identifiants incorrects.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex justify-center mb-6">
           <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-black">P</div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {isRegistering ? 'Créer un compte' : 'Bienvenue sur PointSwap'}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
            {isRegistering ? 'Rejoignez la communauté d\'échange' : 'Connectez-vous pour gérer vos points'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom d'utilisateur</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="Ex: jean_dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            {isRegistering ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold"
          >
            {isRegistering ? 'Déjà un compte ? Connectez-vous' : 'Pas encore de compte ? Inscrivez-vous'}
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            <strong>Astuce :</strong> Le pseudo "admin" possède les droits d'administration.
          </p>
      </div>
    </div>
  );
};

export default Auth;
