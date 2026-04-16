import { create } from 'zustand';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  getDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';

export type TransactionSource = 'Manual' | 'OCR';
export type PocketType = 'Spendable' | 'Saving';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  storeName: string;
  source: TransactionSource;
  pocketId?: string;
}

export interface Pocket {
  id: string;
  name: string;
  icon: string;
  goalAmount: number;
  currentBalance: number;
  type: PocketType;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  budget: number;
  color?: string;
}

export interface User {
  name: string;
  avatar: string;
  email: string;
  streak: number;
  highestStreak: number;
  points: number;
  questRerolls: number;
  totalTransactions: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  target: number;
  type: 'daily' | 'weekly';
  isCompleted: boolean;
  category: 'Scanning' | 'Awareness' | 'Saving' | 'Smart';
}

interface BudgetStore {
  user: User;
  pockets: Pocket[];
  transactions: Transaction[];
  categories: Category[];
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  darkMode: boolean;
  isSyncing: boolean;
  
  syncData: (userId: string) => () => void;
  setDarkMode: (darkMode: boolean) => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addPocket: (pocket: Omit<Pocket, 'id'>) => Promise<void>;
  updatePocket: (id: string, updates: Partial<Pocket>) => Promise<void>;
  deletePocket: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategoryBudget: (id: string, budget: number) => Promise<void>;
  rerollQuest: (questId: string) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  transferMoney: (fromPocketId: string, toPocketId: string, amount: number) => Promise<void>;
}

export const useStore = create<BudgetStore>((set, get) => ({
  user: {
    name: "Adventurer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    email: "",
    streak: 0,
    highestStreak: 0,
    points: 0,
    questRerolls: 3,
    totalTransactions: 0,
  },
  pockets: [],
  transactions: [],
  categories: [],
  dailyQuests: [],
  weeklyQuests: [],
  darkMode: false,
  isSyncing: false,

  syncData: (userId) => {
    set({ isSyncing: true });
    
    // Sync User Profile
    const userDocRef = doc(db, 'users', userId);
    const unsubUser = onSnapshot(userDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        set({ user: snapshot.data() as User });
      } else {
        // Initialize user if not exists
        const newUser: User = {
          name: auth.currentUser?.displayName || "Adventurer",
          avatar: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          email: auth.currentUser?.email || "",
          streak: 0,
          highestStreak: 0,
          points: 0,
          questRerolls: 3,
          totalTransactions: 0,
        };
        try {
          await setDoc(userDocRef, newUser);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${userId}`);
        }
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}`));

    // Sync Pockets
    const pocketsRef = collection(db, 'users', userId, 'pockets');
    const unsubPockets = onSnapshot(pocketsRef, (snapshot) => {
      const pockets = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Pocket));
      set({ pockets });
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/pockets`));

    // Sync Transactions
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const unsubTransactions = onSnapshot(transactionsRef, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ transactions });
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/transactions`));

    // Sync Categories
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const unsubCategories = onSnapshot(categoriesRef, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
      set({ categories });
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/categories`));

    // Sync Quests
    const questsRef = collection(db, 'users', userId, 'quests');
    const unsubQuests = onSnapshot(questsRef, async (snapshot) => {
      let allQuests = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Quest));
      
      if (snapshot.empty) {
        // Initialize default quests if none exist
        const defaultQuests: Omit<Quest, 'id'>[] = [
          { title: 'Scan 3 receipts', description: 'Scan 3 receipts today', xp: 50, progress: 0, target: 3, type: 'daily', isCompleted: false, category: 'Scanning' },
          { title: 'Budget Awareness', description: 'Stay within your daily spending limit', xp: 30, progress: 0, target: 1, type: 'daily', isCompleted: false, category: 'Awareness' },
          { title: 'Save RM 5', description: 'Save RM 5 today', xp: 40, progress: 0, target: 5, type: 'daily', isCompleted: false, category: 'Saving' },
          { title: 'Savings Builder', description: 'Save RM 50 in total this week', xp: 200, progress: 0, target: 50, type: 'weekly', isCompleted: false, category: 'Saving' },
        ];
        
        try {
          // Add them sequentially to avoid issues
          for (const q of defaultQuests) {
            await addDoc(questsRef, q);
          }
          // Note: The additions will trigger this snapshot listener again
          return; 
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${userId}/quests`);
        }
      }

      set({ 
        dailyQuests: allQuests.filter(q => q.type === 'daily'),
        weeklyQuests: allQuests.filter(q => q.type === 'weekly'),
        isSyncing: false
      });
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/quests`));

    return () => {
      unsubUser();
      unsubPockets();
      unsubTransactions();
      unsubCategories();
      unsubQuests();
    };
  },

  setDarkMode: (darkMode) => set({ darkMode }),
  
  updateUser: async (updates) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  },

  addTransaction: async (tx) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    try {
      const txRef = collection(db, 'users', userId, 'transactions');
      await addDoc(txRef, tx);

      // Update pocket balance
      if (tx.pocketId) {
        const pocket = get().pockets.find(p => p.id === tx.pocketId);
        if (pocket) {
          await updateDoc(doc(db, 'users', userId, 'pockets', tx.pocketId), {
            currentBalance: pocket.currentBalance + tx.amount
          });
        }
      }

      // Update user points and total transactions
      await updateDoc(doc(db, 'users', userId), {
        points: get().user.points + 10,
        totalTransactions: get().user.totalTransactions + 1
      });

      // Update quest progress if OCR
      if (tx.source === 'OCR') {
        const scanningQuests = [...get().dailyQuests, ...get().weeklyQuests]
          .filter(q => q.category === 'Scanning' && !q.isCompleted);
        
        for (const q of scanningQuests) {
          await updateDoc(doc(db, 'users', userId, 'quests', q.id), {
            progress: Math.min(q.target, q.progress + 1)
          });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/transactions`);
    }
  },

  deleteTransaction: async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/transactions/${id}`);
    }
  },

  addPocket: async (pocket) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'pockets'), pocket);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/pockets`);
    }
  },

  updatePocket: async (id, updates) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId, 'pockets', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/pockets/${id}`);
    }
  },

  deletePocket: async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'pockets', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/pockets/${id}`);
    }
  },

  transferMoney: async (fromPocketId, toPocketId, amount) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const fromPocket = get().pockets.find(p => p.id === fromPocketId);
    const toPocket = get().pockets.find(p => p.id === toPocketId);
    
    if (!fromPocket || !toPocket) return;
    
    try {
      // Use a transaction for atomic updates
      const fromRef = doc(db, 'users', userId, 'pockets', fromPocketId);
      const toRef = doc(db, 'users', userId, 'pockets', toPocketId);
      
      await runTransaction(db, async (transaction) => {
        const fromDoc = await transaction.get(fromRef);
        const toDoc = await transaction.get(toRef);
        
        if (!fromDoc.exists() || !toDoc.exists()) {
          throw new Error("Pocket does not exist!");
        }
        
        const newFromBalance = fromDoc.data().currentBalance - amount;
        const newToBalance = toDoc.data().currentBalance + amount;
        
        transaction.update(fromRef, { currentBalance: newFromBalance });
        transaction.update(toRef, { currentBalance: newToBalance });
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/pockets/transfer`);
    }
  },

  addCategory: async (category) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'categories'), category);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/categories`);
    }
  },

  updateCategory: async (id, updates) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId, 'categories', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/categories/${id}`);
    }
  },

  deleteCategory: async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'categories', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/categories/${id}`);
    }
  },

  updateCategoryBudget: async (id, budget) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId, 'categories', id), { budget });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/categories/${id}`);
    }
  },

  rerollQuest: async (questId) => {
    const userId = auth.currentUser?.uid;
    if (!userId || get().user.questRerolls <= 0) return;

    const allDailyPool: Omit<Quest, 'id' | 'progress' | 'isCompleted'>[] = [
      { title: 'Scan 3 receipts', description: 'Scan 3 receipts today', xp: 50, type: 'daily', target: 3, category: 'Scanning' },
      { title: 'Log every purchase', description: 'Log every purchase you make today', xp: 40, type: 'daily', target: 1, category: 'Scanning' },
      { title: 'Budget Guardian', description: 'Stay within your daily spending limit', xp: 30, type: 'daily', target: 1, category: 'Awareness' },
      { title: 'Save RM 5', description: 'Save RM 5 today', xp: 40, type: 'daily', target: 5, category: 'Saving' },
    ];

    const randomQuest = allDailyPool[Math.floor(Math.random() * allDailyPool.length)];
    const newQuest = {
      ...randomQuest,
      progress: 0,
      isCompleted: false
    };

    try {
      await updateDoc(doc(db, 'users', userId), { questRerolls: get().user.questRerolls - 1 });
      await setDoc(doc(db, 'users', userId, 'quests', questId), newQuest);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/quests/${questId}`);
    }
  },

  completeQuest: async (questId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const quest = [...get().dailyQuests, ...get().weeklyQuests].find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;

    try {
      await updateDoc(doc(db, 'users', userId, 'quests', questId), {
        isCompleted: true,
        progress: quest.target
      });
      await updateDoc(doc(db, 'users', userId), {
        points: get().user.points + quest.xp
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/quests/${questId}`);
    }
  },

  addPoints: async (points) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        points: get().user.points + points
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  },
}));
