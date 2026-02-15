import { useState } from 'react';
import { 
  Folder, FolderOpen, Star, Heart, Bookmark, Lightbulb, 
  Work, Home, Code, Music, Camera, Gamepad2, ShoppingBag,
  Utensils, Dumbbell, Plane, Book, Calendar, Mail, Settings,
  StarHalf, Sparkles, Zap, Shield, Flag, Tag
} from 'lucide-react';

const FOLDER_ICONS = [
  { id: 'folder', icon: Folder, name: 'Folder' },
  { id: 'star', icon: Star, name: 'Star' },
  { id: 'heart', icon: Heart, name: 'Heart' },
  { id: 'bookmark', icon: Bookmark, name: 'Bookmark' },
  { id: 'lightbulb', icon: Lightbulb, name: 'Idea' },
  { id: 'work', icon: Work, name: 'Work' },
  { id: 'home', icon: Home, name: 'Home' },
  { id: 'code', icon: Code, name: 'Code' },
  { id: 'music', icon: Music, name: 'Music' },
  { id: 'camera', icon: Camera, name: 'Camera' },
  { id: 'game', icon: Gamepad2, name: 'Gaming' },
  { id: 'shopping', icon: ShoppingBag, name: 'Shopping' },
  { id: 'food', icon: Utensils, name: 'Food' },
  { id: 'fitness', icon: Dumbbell, name: 'Fitness' },
  { id: 'travel', icon: Plane, name: 'Travel' },
  { id: 'book', icon: Book, name: 'Reading' },
  { id: 'calendar', icon: Calendar, name: 'Calendar' },
  { id: 'mail', icon: Mail, name: 'Email' },
  { id: 'settings', icon: Settings, name: 'Settings' },
  { id: 'half-star', icon: StarHalf, name: 'Favorite' },
  { id: 'sparkles', icon: Sparkles, name: 'Magic' },
  { id: 'zap', icon: Zap, name: 'Quick' },
  { id: 'shield', icon: Shield, name: 'Secure' },
  { id: 'flag', icon: Flag, name: 'Important' },
  { id: 'tag', icon: Tag, name: 'Tagged' },
];

interface FolderIconPickerProps {
  selectedIcon?: string;
  onChange: (iconId: string) => void;
}

export default function FolderIconPicker({ selectedIcon, onChange }: FolderIconPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2 p-2 max-h-48 overflow-y-auto">
      {FOLDER_ICONS.map(({ id, icon: Icon, name }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={name}
          className={`p-2 rounded-lg flex items-center justify-center transition-all ${
            selectedIcon === id
              ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
}

export { FOLDER_ICONS };

export function getFolderIcon(iconId?: string) {
  const found = FOLDER_ICONS.find(i => i.id === (iconId || 'folder'));
  return found?.icon || Folder;
}
