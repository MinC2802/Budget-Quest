import React, { useState } from 'react';
import { useStore, Pocket } from '../lib/store';
import { Wallet, Shield, Plane, Plus, MoreVertical, Info, Car, GraduationCap, Heart, ShoppingBag, Utensils, Briefcase, Home, Smartphone, Camera, Music, Gift, Edit2, Trash2, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddPocketModal from './AddPocketModal';
import TransferModal from './TransferModal';

export default function Pockets() {
  const { pockets, deletePocket } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingPocket, setEditingPocket] = useState<Pocket | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const spendablePockets = pockets.filter(p => p.type === 'Spendable');
  const savingPockets = pockets.filter(p => p.type === 'Saving');
  
  const totalSpendable = spendablePockets.reduce((acc, p) => acc + p.currentBalance, 0);
  const totalSaving = savingPockets.reduce((acc, p) => acc + p.currentBalance, 0);

  const handleEdit = (pocket: Pocket) => {
    setEditingPocket(pocket);
    setIsAddModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      await deletePocket(id);
      setActiveMenu(null);
    }
  };

  const getIcon = (iconName: string) => {
    const iconProps = { className: "w-6 h-6" };
    switch (iconName) {
      case 'Wallet': return <Wallet {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Plane': return <Plane {...iconProps} />;
      case 'Car': return <Car {...iconProps} />;
      case 'GraduationCap': return <GraduationCap {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
      case 'Utensils': return <Utensils {...iconProps} />;
      case 'Briefcase': return <Briefcase {...iconProps} />;
      case 'Home': return <Home {...iconProps} />;
      case 'Smartphone': return <Smartphone {...iconProps} />;
      case 'Camera': return <Camera {...iconProps} />;
      case 'Music': return <Music {...iconProps} />;
      case 'Gift': return <Gift {...iconProps} />;
      default: return <Wallet {...iconProps} />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Pockets</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:scale-105 transition-transform flex items-center gap-2"
            title="Transfer Money"
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-5 h-5 text-navy dark:text-blue-400" />
            <span className="hidden sm:inline text-xs font-bold">Transfer</span>
          </button>
          <button 
            onClick={() => {
              setEditingPocket(null);
              setIsAddModalOpen(true);
            }}
            className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4 sm:w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total Net Worth Card */}
      <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-navy text-white shadow-xl shadow-navy/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60">Total Net Worth</p>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
            <span className="text-lg sm:text-xl font-bold opacity-40 mr-1">RM</span>
            {(totalSpendable + totalSaving).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <AddPocketModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPocket(null);
        }} 
        pocket={editingPocket}
      />

      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      {/* Spendable Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">Ready to Spend</h3>
          </div>
          <p className="text-lg sm:text-xl font-bold tracking-tight opacity-80">RM {totalSpendable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {spendablePockets.map((pocket) => (
            <motion.div 
              key={pocket.id}
              whileHover={{ y: -2 }}
              className="p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm flex justify-between items-center group relative"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-navy/5 dark:bg-navy/20 flex items-center justify-center text-navy dark:text-blue-400 group-hover:scale-110 transition-transform">
                  {getIcon(pocket.icon)}
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base tracking-tight">{pocket.name}</h4>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-base sm:text-lg font-black tracking-tighter">RM {pocket.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === pocket.id ? null : pocket.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 opacity-40" />
                  </button>
                  
                  <AnimatePresence>
                    {activeMenu === pocket.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 z-20 overflow-hidden"
                        >
                          <button 
                            onClick={() => handleEdit(pocket)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(pocket.id)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Savings Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">Save Pockets</h3>
          </div>
          <p className="text-lg sm:text-xl font-bold tracking-tight opacity-80">RM {totalSaving.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {savingPockets.map((pocket) => {
            const progress = pocket.goalAmount > 0 ? (pocket.currentBalance / pocket.goalAmount) * 100 : 0;
            return (
              <motion.div 
                key={pocket.id}
                whileHover={{ y: -2 }}
                className="p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3 sm:space-y-4 group relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-mint/10 flex items-center justify-center text-mint group-hover:scale-110 transition-transform">
                      {getIcon(pocket.icon)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base tracking-tight">{pocket.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className="text-base sm:text-lg font-black tracking-tighter">RM {pocket.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[8px] sm:text-[9px] font-bold opacity-40 uppercase tracking-widest">Goal: RM {pocket.goalAmount.toLocaleString()}</p>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === pocket.id ? null : pocket.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 opacity-40" />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === pocket.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 z-20 overflow-hidden"
                            >
                              <button 
                                onClick={() => handleEdit(pocket)}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(pocket.id)}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                    <span className="opacity-40">Progress</span>
                    <span className="text-mint">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 sm:h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      className="h-full bg-mint rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
