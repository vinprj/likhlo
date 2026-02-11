/**
 * Color palette for notes and folders.
 */

import type { NoteColor } from '../types/note';

export const NOTE_COLORS: Record<NoteColor, { bg: string; bgDark: string; border: string; label: string }> = {
  default: { bg: 'bg-white', bgDark: 'dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', label: 'Default' },
  red: { bg: 'bg-red-50', bgDark: 'dark:bg-red-950', border: 'border-red-200 dark:border-red-800', label: 'Red' },
  orange: { bg: 'bg-orange-50', bgDark: 'dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', label: 'Orange' },
  yellow: { bg: 'bg-yellow-50', bgDark: 'dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800', label: 'Yellow' },
  green: { bg: 'bg-green-50', bgDark: 'dark:bg-green-950', border: 'border-green-200 dark:border-green-800', label: 'Green' },
  teal: { bg: 'bg-teal-50', bgDark: 'dark:bg-teal-950', border: 'border-teal-200 dark:border-teal-800', label: 'Teal' },
  blue: { bg: 'bg-blue-50', bgDark: 'dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', label: 'Blue' },
  purple: { bg: 'bg-purple-50', bgDark: 'dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', label: 'Purple' },
  pink: { bg: 'bg-pink-50', bgDark: 'dark:bg-pink-950', border: 'border-pink-200 dark:border-pink-800', label: 'Pink' },
};

export const COLOR_DOT: Record<NoteColor, string> = {
  default: 'bg-gray-400',
  red: 'bg-red-400',
  orange: 'bg-orange-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  teal: 'bg-teal-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  pink: 'bg-pink-400',
};
