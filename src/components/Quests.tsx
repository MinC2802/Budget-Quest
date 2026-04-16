import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, RotateCcw, CheckCircle2, Circle, Star, Calendar, Target } from 'lucide-react';
import { useStore, Quest } from '../lib/store';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';

function QuestCard({ 
  quest, 
  user, 
  rerollQuest, 
  completeQuest 
}: { 
  quest: Quest; 
  user: any; 
  rerollQuest: (id: string) => void; 
  completeQuest: (id: string) => void; 
  key?: string;
}) {
  const progressPercentage = (quest.progress / quest.target) * 100;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-3xl border-2 transition-all relative overflow-hidden",
        quest.isCompleted 
          ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30" 
          : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            quest.isCompleted ? "bg-green-100 text-green-600" : "bg-navy/10 text-navy"
          )}>
            {quest.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="font-bold text-base">{quest.title}</h4>
            <p className="text-xs opacity-60">{quest.description}</p>
          </div>
        </div>
        
        {!quest.isCompleted && quest.type === 'daily' && (
          <button 
            onClick={() => rerollQuest(quest.id)}
            disabled={user.questRerolls <= 0}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30"
            title="Reroll Quest"
          >
            <RotateCcw className="w-4 h-4 opacity-50" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
          <span>Progress</span>
          <span>{quest.progress} / {quest.target}</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            className={cn(
              "h-full rounded-full",
              quest.isCompleted ? "bg-green-500" : "bg-navy"
            )}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold">
          <Star className="w-3 h-3 fill-current" />
          {quest.xp} XP
        </div>
        
        {!quest.isCompleted && quest.progress >= quest.target && (
          <button 
            onClick={() => completeQuest(quest.id)}
            className="px-4 py-1.5 bg-navy text-white text-xs font-bold rounded-full shadow-lg shadow-navy/20 hover:scale-105 active:scale-95 transition-all"
          >
            Claim Reward
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function Quests() {
  const { dailyQuests, weeklyQuests, user, rerollQuest, completeQuest, syncData } = useStore();

  const hasNoQuests = dailyQuests.length === 0 && weeklyQuests.length === 0;

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-[2.5rem] bg-navy text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-xl tracking-tight italic">Season 1: The Beginning</h4>
              <p className="text-xs opacity-70">Ends in 14 days</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
              <span>Season Progress</span>
              <span>{user.points} / 5000 XP</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full" 
                style={{ width: `${(user.points / 5000) * 100}%` }} 
              />
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter italic">QUESTS</h2>
          <p className="text-sm opacity-60">Complete tasks to level up your finances</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Rerolls Left</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full",
                  i < user.questRerolls ? "bg-navy" : "bg-gray-200 dark:bg-zinc-800"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      {hasNoQuests ? (
        <div className="py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-navy/5 dark:bg-navy/20 rounded-3xl flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-navy/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No Quests Found</h3>
            <p className="text-sm opacity-60 max-w-[200px] mx-auto">Looks like your quest board is empty. Ready to start your adventure?</p>
          </div>
          <button 
            onClick={() => auth.currentUser && syncData(auth.currentUser.uid)}
            className="px-8 py-4 bg-navy text-white rounded-2xl font-bold shadow-lg shadow-navy/20 hover:scale-105 active:scale-95 transition-all"
          >
            Generate Quests
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-navy">
              <Zap className="w-5 h-5 fill-current" />
              <h3 className="font-black text-lg tracking-tight uppercase italic">Daily Quests</h3>
              <div className="h-px flex-1 bg-navy/10" />
            </div>
            
            <div className="grid gap-4">
              {dailyQuests.map(quest => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  user={user} 
                  rerollQuest={rerollQuest} 
                  completeQuest={completeQuest} 
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Calendar className="w-5 h-5" />
              <h3 className="font-black text-lg tracking-tight uppercase italic">Weekly Challenges</h3>
              <div className="h-px flex-1 bg-blue-600/10" />
            </div>
            
            <div className="grid gap-4">
              {weeklyQuests.map(quest => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  user={user} 
                  rerollQuest={rerollQuest} 
                  completeQuest={completeQuest} 
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
