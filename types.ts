
export interface User {
  id: string;
  username: string;
  password?: string;
  balance: number;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  timestamp: string;
}

export interface AppState {
  currentUser: User | null;
  allUsers: User[];
  transactions: Transaction[];
}
