import React from 'react';
import { useStore } from '../lib/store';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TransactionsProps {
  onBack: () => void;
}

export default function Transactions({ onBack }: TransactionsProps) {
  const { transactions } = useStore();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-black tracking-tight">All Transactions</h2>
      </div>

      <div className="space-y-3">
        {transactions.map((tx, idx) => (
          <motion.div 
            key={tx.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
            className="flex justify-between items-center p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-navy/20 transition-colors group"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {tx.amount > 0 ? '💰' : (tx.category === 'Food' ? '🍕' : tx.category === 'Transport' ? '🚗' : '🛍️')}
              </div>
              <div>
                <p className="font-bold text-base tracking-tight">{tx.storeName}</p>
                <p className="text-xs font-medium opacity-40">{tx.category} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-mono font-black text-lg",
                tx.amount < 0 ? "text-red-500" : "text-green-500"
              )}>
                {tx.amount < 0 ? '-' : '+'}RM{Math.abs(tx.amount).toFixed(2)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{tx.source}</p>
            </div>
          </motion.div>
        ))}
        
        {transactions.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <p className="font-bold">No transactions logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
