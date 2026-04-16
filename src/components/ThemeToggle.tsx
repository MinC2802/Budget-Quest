import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../lib/store';
import { motion } from 'motion/react';

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useStore();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => setDarkMode(!darkMode)}
      className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-purple-600" />
      )}
    </motion.button>
  );
}
