import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Target, Settings, Mail, User as UserIcon, RefreshCw, X, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeToggle from './ThemeToggle';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const { user, updateUser, rerollQuest, darkMode } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  ];

  const handleSave = () => {
    updateUser({ name, email });
    setIsEditing(false);
    // Scroll to top or show success
  };

  const handleAvatarSelect = (avatar: string) => {
    updateUser({ avatar });
    setIsAvatarModalOpen(false);
  };

  const scrollToSettings = () => {
    const settingsSection = document.getElementById('account-settings');
    if (settingsSection) {
      settingsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-navy to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src={user.avatar} 
            className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white dark:border-zinc-800 shadow-2xl cursor-pointer hover:scale-105 transition-transform" 
            alt="Profile Avatar" 
            onClick={() => setIsAvatarModalOpen(true)}
          />
          <button 
            onClick={scrollToSettings}
            className="absolute bottom-0 right-0 p-2 bg-navy text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name}</h2>
          <p className="text-[10px] sm:text-xs font-bold text-navy dark:text-blue-400 uppercase tracking-widest">
            Amongst top 15% of users
          </p>
        </div>
      </section>

      {/* Gamified Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 opacity-50">
            <Trophy className="w-3.5 h-3.5 sm:w-4 h-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Total Points</span>
          </div>
          <p className="text-xl sm:text-2xl font-black">{user.points.toLocaleString()}</p>
        </div>
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 opacity-50">
            <Target className="w-3.5 h-3.5 sm:w-4 h-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Quests Done</span>
          </div>
          <p className="text-xl sm:text-2xl font-black">{user.totalTransactions || 0}</p>
        </div>
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 opacity-50">
            <Flame className="w-3.5 h-3.5 sm:w-4 h-4 text-orange-500" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Current Streak</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-orange-500">{user.streak} Days</p>
        </div>
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 opacity-50">
            <Trophy className="w-3.5 h-3.5 sm:w-4 h-4 text-yellow-500" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Best Streak</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-yellow-500">{user.highestStreak} Days</p>
        </div>
      </div>

      {/* Account Settings */}
      <section id="account-settings" className="space-y-4 scroll-mt-24">
        <h3 className="text-lg sm:text-xl font-black tracking-tight px-1">Account Settings</h3>
        <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-navy dark:text-blue-400">
                <RefreshCw className="w-4 h-4 sm:w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">Appearance</p>
                <p className="text-[9px] sm:text-[10px] opacity-50 uppercase tracking-widest">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 h-4 opacity-30" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 sm:p-4 pl-10 sm:pl-12 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none transition-all text-sm sm:text-base"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 h-4 opacity-30" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 sm:p-4 pl-10 sm:pl-12 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none transition-all text-sm sm:text-base"
                  placeholder="Your email"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-3.5 sm:py-4 bg-navy text-white rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-navy/20 hover:bg-blue-900 transition-all text-sm sm:text-base"
            >
              Save Changes
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full mt-4 py-3.5 sm:py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl sm:rounded-2xl font-bold border border-red-100 dark:border-red-900/20 flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </section>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black tracking-tight">Choose Avatar</h3>
                <button onClick={() => setIsAvatarModalOpen(false)} className="p-2 opacity-50"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {avatars.map((avatar, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={cn(
                      "relative rounded-2xl overflow-hidden border-4 transition-all hover:scale-110",
                      user.avatar === avatar ? "border-navy" : "border-transparent"
                    )}
                  >
                    <img src={avatar} alt={`Avatar ${i}`} className="w-full h-full" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
