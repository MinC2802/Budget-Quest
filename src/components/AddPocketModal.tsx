import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, Shield, Plane, Save, Car, GraduationCap, Heart, ShoppingBag, Utensils, Briefcase, Home, Smartphone, Camera, Music, Gift } from 'lucide-react';
import { useStore, PocketType, Pocket } from '../lib/store';
import { cn } from '../lib/utils';

interface AddPocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocket?: Pocket | null;
}

export default function AddPocketModal({ isOpen, onClose, pocket }: AddPocketModalProps) {
  const { addPocket, updatePocket } = useStore();
  const [name, setName] = useState(pocket?.name || '');
  const [type, setType] = useState<PocketType>(pocket?.type || 'Spendable');
  const [icon, setIcon] = useState(pocket?.icon || 'Wallet');
  const [goalAmount, setGoalAmount] = useState(pocket?.goalAmount || 0);

  React.useEffect(() => {
    if (pocket) {
      setName(pocket.name);
      setType(pocket.type);
      setIcon(pocket.icon);
      setGoalAmount(pocket.goalAmount);
    } else {
      setName('');
      setType('Spendable');
      setIcon('Wallet');
      setGoalAmount(0);
    }
  }, [pocket, isOpen]);

  const handleSave = () => {
    if (!name) return;
    
    if (pocket) {
      updatePocket(pocket.id, {
        name,
        icon,
        goalAmount,
        type
      });
    } else {
      addPocket({
        name,
        icon,
        goalAmount,
        currentBalance: 0,
        type
      });
    }
    
    onClose();
  };

  const icons = [
    { name: 'Wallet', icon: Wallet },
    { name: 'Shield', icon: Shield },
    { name: 'Plane', icon: Plane },
    { name: 'Car', icon: Car },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Heart', icon: Heart },
    { name: 'ShoppingBag', icon: ShoppingBag },
    { name: 'Utensils', icon: Utensils },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Home', icon: Home },
    { name: 'Smartphone', icon: Smartphone },
    { name: 'Camera', icon: Camera },
    { name: 'Music', icon: Music },
    { name: 'Gift', icon: Gift },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden relative z-10 p-6 shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black tracking-tight">New Account</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5 opacity-50" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Account Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none transition-all"
                  placeholder="e.g. Holiday Fund"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setType('Spendable')}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                      type === 'Spendable' 
                        ? "border-navy bg-navy/5 text-navy dark:text-blue-400" 
                        : "border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 opacity-50"
                    )}
                  >
                    Spendable
                  </button>
                  <button 
                    onClick={() => setType('Saving')}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                      type === 'Saving' 
                        ? "border-mint bg-mint/10 text-mint" 
                        : "border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 opacity-50"
                    )}
                  >
                    Saving
                  </button>
                </div>
              </div>

              {type === 'Saving' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Goal Amount (RM)</label>
                  <input 
                    type="number" 
                    value={goalAmount || ''} 
                    onChange={(e) => setGoalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Select Icon</label>
                <div className="grid grid-cols-5 gap-3 p-2 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                  {icons.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button 
                        key={item.name}
                        onClick={() => setIcon(item.name)}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                          icon === item.name 
                            ? "bg-navy text-white shadow-lg shadow-navy/20 scale-110" 
                            : "text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={!name}
                className="w-full py-4 mt-4 bg-navy text-white rounded-2xl font-bold shadow-lg shadow-navy/20 hover:bg-blue-900 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {pocket ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
