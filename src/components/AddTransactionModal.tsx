import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, FileText, Check, X, Plus, Loader2, Upload } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import { extractReceiptData } from '../services/ocrService';

export default function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Capture, 2: Review, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [type, setType] = useState<'Expense' | 'Income'>('Expense');
  const [mockData, setMockData] = useState({ storeName: '', amount: 0, category: 'Food', pocketId: '' });
  const [error, setError] = useState<string | null>(null);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const { addTransaction, categories, pockets } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize pocketId if not set
  React.useEffect(() => {
    if (!mockData.pocketId && pockets.length > 0) {
      setMockData(prev => ({ ...prev, pocketId: pockets[0].id }));
    }
  }, [pockets, mockData.pocketId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const data = await extractReceiptData(base64, file.type);
        
        setMockData({
          storeName: data.storeName,
          amount: Math.abs(data.amount),
          category: data.category,
          pocketId: pockets[0]?.id || ''
        });
        setType(data.type);
        setIsProcessing(false);
        setStep(2);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("OCR Error:", error);
      setIsProcessing(false);
      setError("Failed to scan receipt. Please try again or enter manually.");
    }
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (force = false) => {
    setError(null);
    if (!mockData.pocketId) {
      setError("Please select a pocket for this transaction.");
      return;
    }
    if (mockData.amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!mockData.storeName) {
      setError("Please enter a store or source name.");
      return;
    }

    // Balance check for expenses
    if (type === 'Expense' && !force) {
      const selectedPocket = pockets.find(p => p.id === mockData.pocketId);
      if (selectedPocket && selectedPocket.currentBalance < mockData.amount) {
        setShowBalanceWarning(true);
        return;
      }
    }

    const finalAmount = type === 'Expense' ? -Math.abs(mockData.amount) : Math.abs(mockData.amount);
    
    // Ensure we are passing the correct pocketId and amount
    addTransaction({ 
      ...mockData, 
      amount: finalAmount,
      category: type === 'Expense' ? mockData.category : 'Income',
      date: new Date().toISOString(), 
      source: step === 2 && mockData.storeName !== '' ? 'OCR' : 'Manual',
      pocketId: mockData.pocketId
    });
    setStep(3);
    setShowBalanceWarning(false);
    setTimeout(() => {
      setIsOpen(false);
      setStep(1);
      setMockData({ storeName: '', amount: 0, category: 'Food', pocketId: pockets[0]?.id || '' });
      setType('Expense');
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-navy text-white rounded-full shadow-lg shadow-navy/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-7 h-7 sm:w-8 sm:h-8" />
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative z-10 p-6 sm:p-8 shadow-2xl border-t sm:border border-gray-200 dark:border-zinc-800 max-h-[92vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" />
              
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors hidden sm:block"
              >
                <X className="w-5 h-5 opacity-50" />
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </motion.div>
              )}

              {step === 1 && (
                <div className="text-center space-y-6 pt-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">Log Transaction</h3>
                    <p className="text-sm opacity-60">Log your transactions to earn XP</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={handleScanClick} 
                      disabled={isProcessing}
                      className="flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-navy hover:bg-navy/5 dark:hover:bg-navy/10 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-navy/10 dark:bg-navy/30 flex items-center justify-center text-navy dark:text-blue-400 group-hover:scale-110 transition-transform">
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                      </div>
                      <div className="text-left">
                        <span className="block text-base font-bold">Scan Receipt</span>
                        <span className="block text-xs opacity-50">AI-powered OCR extraction</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setStep(2)} 
                      className="flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className="block text-base font-bold">Manual Entry</span>
                        <span className="block text-xs opacity-50">Enter details yourself</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 pt-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Review Details</h3>
                    <p className="text-sm opacity-60">Make sure everything is correct</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setType('Expense')}
                      className={cn(
                        "py-3 rounded-xl font-bold text-sm border-2 transition-all",
                        type === 'Expense' 
                          ? "bg-red-50 border-red-500 text-red-600 dark:bg-red-900/20" 
                          : "bg-gray-50 border-transparent opacity-50 dark:bg-zinc-800"
                      )}
                    >
                      Expense
                    </button>
                    <button 
                      onClick={() => setType('Income')}
                      className={cn(
                        "py-3 rounded-xl font-bold text-sm border-2 transition-all",
                        type === 'Income' 
                          ? "bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20" 
                          : "bg-gray-50 border-transparent opacity-50 dark:bg-zinc-800"
                      )}
                    >
                      Income
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Store / Source</label>
                      <input 
                        type="text" 
                        value={mockData.storeName} 
                        onChange={(e) => setMockData({...mockData, storeName: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none transition-all"
                        placeholder="e.g. Starbucks or Salary"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Amount (RM)</label>
                      <input 
                        type="number" 
                        value={mockData.amount || ''} 
                        onChange={(e) => setMockData({...mockData, amount: parseFloat(e.target.value) || 0})}
                        className={cn(
                          "w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none text-2xl font-black transition-all",
                          type === 'Expense' ? "text-red-500" : "text-green-500"
                        )}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">
                        {type === 'Expense' ? 'Deduct from Pocket' : 'Deposit to Pocket'}
                      </label>
                      {pockets.length > 0 ? (
                        <select 
                          value={mockData.pocketId}
                          onChange={(e) => setMockData({...mockData, pocketId: e.target.value})}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none transition-all appearance-none font-bold"
                        >
                          {pockets.map(pocket => (
                            <option key={pocket.id} value={pocket.id}>{pocket.name} (RM {pocket.currentBalance.toLocaleString()})</option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold">
                          No pockets found. Please create a pocket first.
                        </div>
                      )}
                    </div>

                    {type === 'Expense' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Category</label>
                        <select 
                          value={mockData.category}
                          onChange={(e) => setMockData({...mockData, category: e.target.value})}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none transition-all appearance-none font-bold"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => handleSave()} 
                      className="flex-[2] py-4 bg-navy text-white rounded-2xl font-bold shadow-lg shadow-navy/20 hover:bg-blue-900 transition-colors"
                    >
                      Confirm & Save
                    </button>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {showBalanceWarning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 p-8 flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Plus className="w-10 h-10 rotate-45" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">Insufficient Balance</h4>
                      <p className="text-sm opacity-60">
                        You're trying to spend RM {mockData.amount.toFixed(2)}, but this pocket only has RM {pockets.find(p => p.id === mockData.pocketId)?.currentBalance.toFixed(2)}.
                      </p>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                      <button 
                        onClick={() => handleSave(true)}
                        className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-colors"
                      >
                        Proceed Anyway
                      </button>
                      <button 
                        onClick={() => setShowBalanceWarning(false)}
                        className="w-full py-4 bg-gray-100 dark:bg-zinc-800 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {step === 3 && (
                <div className="py-12 text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20"
                  >
                    <Check className="w-12 h-12 text-white" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tight">Quest Complete!</h3>
                    <p className="text-green-600 dark:text-green-400 font-bold">+10 XP Earned</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
