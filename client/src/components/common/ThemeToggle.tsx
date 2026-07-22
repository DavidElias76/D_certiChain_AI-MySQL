import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={18} className="animate-in zoom-in duration-300" />
      ) : (
        <Sun size={18} className="animate-in zoom-in duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
