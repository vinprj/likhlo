/**
 * Sidebar navigation with folders, archive, trash.
 */

import { useState } from 'react';
import {
  FileText, FolderIcon, Archive, Trash2, Plus, X, ChevronLeft,
} from 'lucide-react';
import type { Folder } from '../types/note';
import { COLOR_DOT } from '../utils/colors';
import { getFolderIcon } from './FolderIconPicker';
import FolderModal from './FolderModal';

export type SidebarView = 'notes' | 'folder' | 'archive' | 'trash';

interface SidebarProps {
  folders: Folder[];
  activeView: SidebarView;
  activeFolderId: string | null;
  onViewChange: (view: SidebarView, folderId?: string) => void;
  onCreateFolder: (name: string, icon?: string, color?: string) => void;
  onDeleteFolder: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  folders, activeView, activeFolderId, onViewChange,
  onCreateFolder, onDeleteFolder, collapsed, onToggleCollapse,
}: SidebarProps) {
  const [showNewFolder, setShowNewFolder] = useState(false);

  const handleCreateFolder = (name: string, icon: string, color: string) => {
    onCreateFolder(name, icon, color);
    setShowNewFolder(false);
  };

  if (collapsed) {
    return (
      <div className="w-14 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mb-4"
        >
          <ChevronLeft size={20} className="rotate-180 text-gray-600 dark:text-gray-400" />
        </button>
        <SidebarIconButton
          icon={<FileText size={20} />}
          active={activeView === 'notes'}
          onClick={() => onViewChange('notes')}
          title="All Notes"
        />
        {folders.map((f) => {
          const Icon = getFolderIcon(f.icon);
          return (
            <SidebarIconButton
              key={f.id}
              icon={<Icon size={20} />}
              active={activeView === 'folder' && activeFolderId === f.id}
              onClick={() => onViewChange('folder', f.id)}
              title={f.name}
            />
          );
        })}
        <div className="flex-1" />
        <SidebarIconButton
          icon={<Archive size={20} />}
          active={activeView === 'archive'}
          onClick={() => onViewChange('archive')}
          title="Archive"
        />
        <SidebarIconButton
          icon={<Trash2 size={20} />}
          active={activeView === 'trash'}
          onClick={() => onViewChange('trash')}
          title="Trash"
        />
      </div>
    );
  }

  return (
    <div className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">✍️ Likhlo</h1>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <NavItem
          icon={<FileText size={18} />}
          label="All Notes"
          active={activeView === 'notes'}
          onClick={() => onViewChange('notes')}
        />

        {/* Folders section */}
        <div className="mt-4 mb-1 flex items-center justify-between px-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</span>
          <button
            onClick={() => setShowNewFolder(true)}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Plus size={14} className="text-gray-400" />
          </button>
        </div>

        {folders.map((folder) => {
          const Icon = getFolderIcon(folder.icon);
          return (
            <NavItem
              key={folder.id}
              icon={<Icon size={18} className="text-teal-600" />}
              label={folder.name}
              active={activeView === 'folder' && activeFolderId === folder.id}
              onClick={() => onViewChange('folder', folder.id)}
              onDelete={() => onDeleteFolder(folder.id)}
            />
          );
        })}

        <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-2">
          <NavItem
            icon={<Archive size={18} />}
            label="Archive"
            active={activeView === 'archive'}
            onClick={() => onViewChange('archive')}
          />
          <NavItem
            icon={<Trash2 size={18} />}
            label="Trash"
            active={activeView === 'trash'}
            onClick={() => onViewChange('trash')}
          />
        </div>
      </nav>

      {/* New Folder Modal */}
      {showNewFolder && (
        <FolderModal
          onClose={() => setShowNewFolder(false)}
          onSave={handleCreateFolder}
        />
      )}
    </div>
  );
}

function NavItem({
  icon, label, active, onClick, onDelete,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active
          ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium flex-1 truncate">{label}</span>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={14} className="text-gray-400" />
        </button>
      )}
    </div>
  );
}

function SidebarIconButton({
  icon, active, onClick, title,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${active
          ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      {icon}
    </button>
  );
}
