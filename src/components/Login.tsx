import React from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Trophy, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-muji-bg dark:bg-charcoal flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-muji-border dark:border-zinc-800 text-center"
      >
        <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-navy/20">
          <Trophy className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter italic mb-2 text-slate-900 dark:text-white">BudgetQuest</h1>
        <p className="text-slate-500 dark:text-zinc-400 mb-8">
          Gamify your finances. Track spending, complete quests, and level up your financial life.
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-navy hover:bg-navy/90 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-navy/20"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="mt-6 text-xs text-slate-400 dark:text-zinc-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
