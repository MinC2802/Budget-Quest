import React from 'react';
import { useStore } from '../lib/store';
import { Flame, TrendingUp, ChevronRight, Target, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  onViewAll?: () => void;
}

export default function Dashboard({ onViewAll }: DashboardProps) {
  const { user, pockets, transactions, weeklyQuests } = useStore();
  const totalBalance = pockets.reduce((acc, p) => acc + p.currentBalance, 0);
  
  const mainQuest = weeklyQuests[0] || { title: 'No active quest', progress: 0, target: 1, xp: 0 };
  const progressPercentage = Math.round((mainQuest.progress / mainQuest.target) * 100);

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <section className="flex justify-between items-start">
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-xs sm:text-sm font-medium opacity-60">Welcome back,</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name} 👋</h2>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 sm:gap-2 bg-orange-100 dark:bg-orange-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-800/50 shadow-sm"
        >
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-500" />
          <span className="font-bold text-xs sm:text-sm text-orange-600 dark:text-orange-400">{user.streak} Day Streak</span>
        </motion.div>
      </section>

      {/* Balance Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-navy/5 rounded-full blur-3xl group-hover:bg-navy/10 transition-colors" />
        
        <div className="relative z-10 space-y-5 sm:space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50">Total Net Worth</p>
            <h3 className="text-4xl sm:text-5xl font-black tracking-tighter">
              <span className="text-xl sm:text-2xl font-bold opacity-40 mr-1">RM</span>
              {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-navy/5 dark:bg-navy/20 border border-navy/10 dark:border-navy/30 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 sm:w-4 h-4 text-navy dark:text-blue-400" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-navy dark:text-blue-400">{mainQuest.title}</span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-navy dark:text-blue-400">{progressPercentage}%</span>
            </div>
            <div className="h-2.5 sm:h-3 w-full bg-navy/10 dark:bg-navy/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-navy rounded-full" 
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] sm:text-xs font-medium opacity-70 italic">
                {mainQuest.target - mainQuest.progress} more to earn {mainQuest.xp} XP!
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-navy dark:text-blue-400">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-50">Points</p>
            <p className="text-base sm:text-lg font-black">{user.points}</p>
          </div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-50">Rank</p>
            <p className="text-base sm:text-lg font-black">#4</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-40"/> 
            Recent Transactions
          </h4>
          <button 
            onClick={onViewAll}
            className="text-[10px] sm:text-xs font-bold text-navy dark:text-blue-400 flex items-center gap-1"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="space-y-2.5 sm:space-y-3">
          {transactions.slice(0, 4).map((tx, idx) => (
            <motion.div 
              key={tx.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex justify-between items-center p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-navy/20 dark:hover:border-navy/30 transition-colors group"
            >
              <div className="flex gap-3 sm:gap-4 items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform">
                  {tx.amount > 0 ? '💰' : (tx.category === 'Food' ? '🍕' : tx.category === 'Transport' ? '🚗' : '🛍️')}
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base tracking-tight">{tx.storeName}</p>
                  <p className="text-[10px] sm:text-xs font-medium opacity-40">{tx.category} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-mono font-black text-base sm:text-lg",
                  tx.amount < 0 ? "text-red-500" : "text-green-500"
                )}>
                  {tx.amount < 0 ? '-' : '+'}RM{Math.abs(tx.amount).toFixed(2)}
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-30">{tx.source}</p>
              </div>
            </motion.div>
          ))}
          
          {transactions.length === 0 && (
            <div className="py-10 text-center space-y-2 opacity-40">
              <p className="text-sm font-medium">No transactions yet.</p>
              <p className="text-xs">Start your first quest by adding a receipt!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
