
import { User, Transaction } from '../types';

const USERS_KEY = 'pointswap_users';
const TRANSACTIONS_KEY = 'pointswap_transactions';

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getStoredTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const exportAllData = () => {
  const data = {
    users: getStoredUsers(),
    transactions: getStoredTransactions(),
    exportDate: new Date().toISOString(),
    version: "1.1"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pointswap_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (jsonData: string): { users: User[], transactions: Transaction[] } | null => {
  try {
    const parsed = JSON.parse(jsonData);
    if (parsed.users && Array.isArray(parsed.users)) {
      saveUsers(parsed.users);
      saveTransactions(parsed.transactions || []);
      return { users: parsed.users, transactions: parsed.transactions || [] };
    }
  } catch (e) {
    console.error("Erreur d'importation", e);
  }
  return null;
};
