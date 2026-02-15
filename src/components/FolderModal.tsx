import { useState } from 'react';
import { X, Folder, FolderOpen } from 'lucide-react';
import FolderIconPicker, { getFolderIcon } from './FolderIconPicker';
import { NOTE_COLORS } from '../utils/colors';

interface FolderModalProps {
  onClose: () => void;
  onSave: (name: string, icon: string, color: string) => void;
  existingFolder?: {
    name: string;
    icon: string;
    color: string;
  };
}

export default function FolderModal({ onClose, onSave, existingFolder }: FolderModalProps) {
  const [name, setName] = useState(existingFolder?.name || '');
  const [icon, setIcon] = useState(existingFolder?.icon || 'folder');
  const [color, setColor] = useState(existingFolder?.color || 'default');

  const Icon = getFolderIcon(icon);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), icon, color);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {existingFolder ? 'Edit Folder' : 'New Folder'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex justify-center py-2">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${NOTE_COLORS[color as keyof typeof NOTE_COLORS]?.bg || 'bg-gray-100 dark:bg-gray-800'}`}>
              <Icon size={32} className="text-teal-600" />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <FolderIconPicker selectedIcon={icon} onChange={setIcon} />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(NOTE_COLORS) as Array<keyof typeof NOTE_COLORS>).map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg ${NOTE_COLORS[c].bg} ${
                    color === c ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                  }`}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 rounded-lg font-medium text-white transition-colors"
          >
            {existingFolder ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
