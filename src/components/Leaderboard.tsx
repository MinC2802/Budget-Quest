import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { UserPlus, Trophy, Flame, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import AddFriendModal from './AddFriendModal';

const FRIENDS = [
  { id: 'f1', name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', points: 2850, streak: 15, rank: 1 },
  { id: 'f2', name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', points: 2420, streak: 8, rank: 2 },
  { id: 'f3', name: 'Emma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', points: 1980, streak: 21, rank: 3 },
  { id: 'f4', name: 'You', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', points: 1250, streak: 5, rank: 4 },
  { id: 'f5', name: 'David', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', points: 1100, streak: 3, rank: 5 },
  { id: 'f6', name: 'Lisa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', points: 950, streak: 12, rank: 6 },
  { id: 'f7', name: 'Tom', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', points: 820, streak: 2, rank: 7 },
];

export default function Leaderboard() {
  const { user } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Update "You" with actual store data
  const players = FRIENDS.map(f => f.name === 'You' ? { ...f, points: user.points, streak: user.streak } : f)
    .sort((a, b) => b.points - a.points)
    .map((f, idx) => ({ ...f, rank: idx + 1 }));

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight">Leaderboard</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="p-3 bg-navy text-white rounded-2xl shadow-lg shadow-navy/20 hover:scale-105 transition-transform"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      <AddFriendModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Podium */}
      <div className="flex justify-center items-end gap-1.5 sm:gap-2 pt-10 pb-4">
        {/* 2nd Place */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2 sm:gap-3"
        >
          <div className="relative">
            <img src={top3[1].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-4 border-slate-300 dark:border-slate-700 shadow-lg" alt="" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-800 dark:text-slate-200">2</div>
          </div>
          <div className="text-center">
            <p className="font-bold text-xs sm:text-sm tracking-tight truncate w-16 sm:w-auto">{top3[1].name}</p>
            <p className="text-[10px] sm:text-xs font-black text-navy dark:text-blue-400">{top3[1].points} XP</p>
          </div>
          <div className="w-16 sm:w-20 h-20 sm:h-24 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-t-xl sm:rounded-t-2xl border-x border-t border-slate-200 dark:border-slate-700 shadow-sm" />
        </motion.div>

        {/* 1st Place */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-2 sm:gap-3"
        >
          <div className="relative">
            <Crown className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 fill-yellow-500 animate-bounce" />
            <img src={top3[0].avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border-4 border-yellow-500 shadow-xl shadow-yellow-500/20" alt="" />
            <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-white">1</div>
          </div>
          <div className="text-center">
            <p className="font-black text-sm sm:text-base tracking-tight truncate w-20 sm:w-auto">{top3[0].name}</p>
            <p className="text-xs sm:text-sm font-black text-navy dark:text-blue-400">{top3[0].points} XP</p>
          </div>
          <div className="w-20 sm:w-24 h-28 sm:h-32 bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/40 rounded-t-2xl sm:rounded-t-3xl border-x border-t border-yellow-200 dark:border-yellow-800 shadow-md" />
        </motion.div>

        {/* 3rd Place */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-2 sm:gap-3"
        >
          <div className="relative">
            <img src={top3[2].avatar} className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-4 border-orange-300 dark:border-orange-900/50 shadow-lg" alt="" />
            <div className="absolute -bottom-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-300 dark:bg-orange-800 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black text-orange-900 dark:text-orange-100">3</div>
          </div>
          <div className="text-center">
            <p className="font-bold text-[10px] sm:text-xs tracking-tight truncate w-14 sm:w-auto">{top3[2].name}</p>
            <p className="text-[9px] sm:text-[10px] font-black text-navy dark:text-blue-400">{top3[2].points} XP</p>
          </div>
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-900/30 rounded-t-lg sm:rounded-t-xl border-x border-t border-orange-200 dark:border-orange-800 shadow-sm" />
        </motion.div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {rest.map((player, idx) => (
          <motion.div 
            key={player.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "flex justify-between items-center p-4 rounded-3xl border transition-all",
              player.name === 'You' 
                ? "bg-navy/5 dark:bg-navy/20 border-navy/20 dark:border-navy/50 shadow-md scale-[1.02]" 
                : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 shadow-sm"
            )}
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-center font-black opacity-30 text-sm">{player.rank}</span>
              <img src={player.avatar} className="w-12 h-12 rounded-2xl border-2 border-gray-100 dark:border-zinc-800" alt="" />
              <div>
                <p className="font-bold text-base tracking-tight flex items-center gap-2">
                  {player.name}
                  {player.name === 'You' && <span className="text-[10px] bg-navy text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                </p>
                <div className="flex items-center gap-3 opacity-50">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span className="text-[10px] font-bold">{player.streak}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-black text-lg tracking-tight">{player.points}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Points</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-navy/30 flex items-center justify-center text-navy dark:text-blue-400">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
