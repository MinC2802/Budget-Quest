import React, { useState } from 'react';
import { useStore, Category as CategoryType } from '../lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download, TrendingUp, Calendar, Filter, Edit2, Check, X, Plus, ChevronLeft, Folder, MoreVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Category() {
  const { transactions, categories, addCategory, deleteCategory, updateCategory } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCat, setNewCat] = useState({ name: '', budget: 500, icon: '📁' });
  const [editCat, setEditCat] = useState({ name: '', budget: 500, icon: '📁' });

  const emojis = ['🍕', '🚗', '🛍️', '💊', '🎮', '🏠', '🎬', '☕', '👕', '📚', '💪', '✈️', '🎁', '🐾', '💡', '🛠️', '📱', '🎨', '🌳', '🚲'];

  const getCategoryIcon = (icon: string) => {
    const legacyMap: Record<string, string> = {
      'Utensils': '🍕',
      'Car': '🚗',
      'ShoppingBag': '🛍️',
      'Shopping': '🛍️',
      'Transport': '🚗',
      'Food': '🍕',
      'Health': '💊',
      'Entertainment': '🎮'
    };
    return legacyMap[icon] || icon;
  };

  const handleAddCategory = () => {
    if (!newCat.name) return;
    addCategory({
      ...newCat,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    });
    setIsAdding(false);
    setNewCat({ name: '', budget: 500, icon: '📁' });
  };

  const handleUpdateCategory = () => {
    if (!selectedCategory || !editCat.name) return;
    updateCategory(selectedCategory.id, editCat);
    setSelectedCategory({ ...selectedCategory, ...editCat });
    setIsEditing(false);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCategoryCSV = (catName: string) => {
    const catTransactions = transactions.filter(t => t.category === catName);
    const headers = "Date,Store,Amount,Source\n";
    const rows = catTransactions.map(t => `${new Date(t.date).toLocaleDateString()},${t.storeName},${t.amount},${t.source}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-quest-${catName.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (selectedCategory) {
    const catTransactions = transactions.filter(t => t.category === selectedCategory.name);
    const spent = catTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Breakdown by store for pie chart
    const storeData = Array.from(new Set(catTransactions.map(t => t.storeName))).map(store => ({
      name: store,
      value: catTransactions.filter(t => t.storeName === store).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#000080', '#2DFFB2', '#3b82f6', '#f59e0b', '#ef4444'];

    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => {
              setSelectedCategory(null);
              setIsEditing(false);
            }}
            className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-navy/5 dark:bg-navy/20 flex items-center justify-center text-xl sm:text-2xl">
              {getCategoryIcon(selectedCategory.icon)}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{selectedCategory.name}</h2>
              <p className="text-[10px] sm:text-xs font-bold opacity-40 uppercase tracking-widest">Category Detail</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEditCat({ name: selectedCategory.name, budget: selectedCategory.budget, icon: selectedCategory.icon });
                setIsEditing(true);
              }}
              className="p-2.5 sm:p-3 text-navy dark:text-blue-400 bg-navy/5 dark:bg-navy/20 rounded-xl sm:rounded-2xl"
            >
              <Edit2 className="w-4 h-4 sm:w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                if (confirm('Delete this category?')) {
                  deleteCategory(selectedCategory.id);
                  setSelectedCategory(null);
                }
              }}
              className="p-2.5 sm:p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-2xl"
            >
              <Trash2 className="w-4 h-4 sm:w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Budget Card */}
          <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-5 sm:space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-50">Monthly Budget</p>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">RM {selectedCategory.budget}</h3>
              </div>
              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-50">Spent</p>
                <p className={cn(
                  "text-lg sm:text-xl font-black tracking-tight",
                  spent > selectedCategory.budget ? "text-red-500" : "text-navy dark:text-blue-400"
                )}>RM {spent.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 sm:h-4 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((spent / selectedCategory.budget) * 100, 100)}%` }}
                  className={cn(
                    "h-full rounded-full",
                    spent > selectedCategory.budget ? "bg-red-500" : "bg-navy"
                  )}
                />
              </div>
              <p className="text-[10px] sm:text-xs font-bold opacity-40 text-center">
                {((spent / selectedCategory.budget) * 100).toFixed(1)}% of budget used
              </p>
            </div>

            <button 
              onClick={() => exportCategoryCSV(selectedCategory.name)}
              className="w-full py-3.5 sm:py-4 bg-gray-50 dark:bg-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 h-4" />
              Export to CSV
            </button>
          </div>

          {/* Store Breakdown */}
          <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <h3 className="text-base sm:text-lg font-black tracking-tight mb-4">Store Breakdown</h3>
            <div className="h-40 sm:h-48 w-full">
              {storeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={storeData} 
                      innerRadius={40} 
                      outerRadius={60} 
                      paddingAngle={5} 
                      dataKey="value"
                      stroke="none"
                    >
                      {storeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center opacity-30 font-bold italic text-sm">No transactions</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {storeData.slice(0, 4).map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-60">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
          <h3 className="text-base sm:text-lg font-black tracking-tight mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 h-5 opacity-40" />
            Weekly Spending Trend
          </h3>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { day: 'Mon', amount: 45 },
                { day: 'Tue', amount: 120 },
                { day: 'Wed', amount: 84 },
                { day: 'Thu', amount: 15 },
                { day: 'Fri', amount: 60 },
                { day: 'Sat', amount: 200 },
                { day: 'Sun', amount: 30 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" opacity={0.3} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', opacity: 0.5 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" fill="#000080" radius={[8, 8, 8, 8]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Edit Category Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black tracking-tight">Edit Category</h3>
                  <button onClick={() => setIsEditing(false)} className="p-2 opacity-50"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">Name</label>
                    <input 
                      type="text" 
                      value={editCat.name}
                      onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">Monthly Budget (RM)</label>
                    <input 
                      type="number" 
                      value={editCat.budget}
                      onChange={(e) => setEditCat({ ...editCat, budget: parseFloat(e.target.value) || 0 })}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">Select Emoji</label>
                    <div className="grid grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                      {emojis.map(emoji => (
                        <button 
                          key={emoji}
                          onClick={() => setEditCat({ ...editCat, icon: emoji })}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center text-xl rounded-xl transition-all",
                            editCat.icon === emoji ? "bg-navy text-white scale-110 shadow-lg" : "hover:bg-gray-200 dark:hover:bg-zinc-700"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-4 font-bold opacity-40">Cancel</button>
                  <button 
                    onClick={handleUpdateCategory}
                    className="flex-[2] py-4 bg-navy text-white rounded-2xl font-bold shadow-lg shadow-navy/20"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Categories</h2>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input 
            type="text" 
            placeholder="Filter categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm text-sm focus:ring-2 ring-navy outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredCategories.map((cat) => {
          const spent = transactions
            .filter(t => t.category === cat.name)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          
          return (
            <motion.div 
              key={cat.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedCategory(cat)}
              className="p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-zinc-800 rounded-full group-hover:scale-150 transition-transform" />
              
              <div className="relative z-10 space-y-3 sm:space-y-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-navy/5 dark:bg-navy/20 flex items-center justify-center text-xl sm:text-2xl">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-lg tracking-tight truncate">{cat.name}</h4>
                  <p className="text-[8px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">RM {spent.toFixed(0)} spent</p>
                </div>
                <div className="h-1 sm:h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-navy rounded-full" 
                    style={{ width: `${Math.min((spent / cat.budget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add Category Card */}
        <motion.button 
          whileHover={{ y: -5 }}
          onClick={() => setIsAdding(true)}
          className="p-4 sm:p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 sm:gap-3 group transition-all hover:border-navy hover:bg-navy/5"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-navy shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <span className="font-bold text-xs sm:text-sm opacity-60">New Category</span>
        </motion.button>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-muji-border dark:border-zinc-800"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black tracking-tight text-navy dark:text-white">Create Category</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 ml-1">Name</label>
                  <input 
                    type="text" 
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none font-bold transition-all"
                    placeholder="e.g. Health"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 ml-1">Monthly Budget (RM)</label>
                  <input 
                    type="number" 
                    value={newCat.budget}
                    onChange={(e) => setNewCat({ ...newCat, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 ring-navy outline-none font-bold transition-all"
                    placeholder="500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 ml-1">Select Emoji</label>
                  <div className="grid grid-cols-5 gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700">
                    {emojis.map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => setNewCat({ ...newCat, icon: emoji })}
                        className={cn(
                          "w-11 h-11 flex items-center justify-center text-xl rounded-xl transition-all duration-200",
                          newCat.icon === emoji 
                            ? "bg-navy text-white scale-110 shadow-lg shadow-navy/20" 
                            : "hover:bg-gray-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleAddCategory}
                  className="w-full py-4 bg-navy text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-navy/30 hover:bg-blue-900 transition-all active:scale-[0.98]"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
