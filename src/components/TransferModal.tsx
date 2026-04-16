import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRightLeft, ArrowRight, Wallet, Shield, Save, Loader2 } from 'lucide-react';
import { useStore, Pocket } from '../lib/store';
import { cn } from '../lib/utils';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFromPocket?: Pocket | null;
}

export default function TransferModal({ isOpen, onClose, initialFromPocket }: TransferModalProps) {
  const { pockets, transferMoney } = useStore();
  const [fromPocketId, setFromPocketId] = useState(initialFromPocket?.id || pockets[0]?.id || '');
  const [toPocketId, setToPocketId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter pockets for "to" selection (excluding "from" pocket)
  const availableToPockets = pockets.filter(p => p.id !== fromPocketId);

  // Set default toPocket if not set
  React.useEffect(() => {
    if (!toPocketId && availableToPockets.length > 0) {
      setToPocketId(availableToPockets[0].id);
    }
  }, [fromPocketId, availableToPockets, toPocketId]);

  const handleTransfer = async () => {
    if (!fromPocketId || !toPocketId || amount <= 0) return;
    
    const fromPocket = pockets.find(p => p.id === fromPocketId);
    if (fromPocket && fromPocket.currentBalance < amount) {
      alert("Insufficient balance in the source pocket!");
      return;
    }

    setIsProcessing(true);
    try {
      await transferMoney(fromPocketId, toPocketId, amount);
      onClose();
      setAmount(0);
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 opacity-50" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-navy/10 dark:bg-navy/30 rounded-2xl flex items-center justify-center text-navy dark:text-blue-400 mx-auto">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Transfer Money</h3>
              <p className="text-sm opacity-60">Move funds between your pockets</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 ml-1">From</label>
                  <select 
                    value={fromPocketId}
                    onChange={(e) => setFromPocketId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold appearance-none"
                  >
                    {pockets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-6">
                  <ArrowRight className="w-4 h-4 opacity-30" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 ml-1">To</label>
                  <select 
                    value={toPocketId}
                    onChange={(e) => setToPocketId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold appearance-none"
                  >
                    {availableToPockets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 ml-1">Amount (RM)</label>
                <input 
                  type="number" 
                  value={amount || ''} 
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none text-2xl font-black transition-all text-center"
                  placeholder="0.00"
                />
              </div>

              <button 
                onClick={handleTransfer}
                disabled={isProcessing || amount <= 0 || !fromPocketId || !toPocketId}
                className="w-full py-4 bg-navy text-white rounded-2xl font-bold shadow-lg shadow-navy/20 hover:bg-blue-900 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Confirm Transfer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
