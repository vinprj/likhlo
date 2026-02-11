/**
 * Theme toggle (light/dark/system).
 */

import { Sun, Moon, Monitor } from 'lucide-react';
import type { AppSettings } from '../types/note';

interface ThemeToggleProps {
  theme: AppSettings['theme'];
  onChange: (theme: AppSettings['theme']) => void;
}

export default function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const options = [
    { value: 'light' as const, icon: <Sun size={16} />, label: 'Light' },
    { value: 'dark' as const, icon: <Moon size={16} />, label: 'Dark' },
    { value: 'system' as const, icon: <Monitor size={16} />, label: 'System' },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={`p-1.5 rounded-md transition-all ${
            theme === opt.value
              ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
