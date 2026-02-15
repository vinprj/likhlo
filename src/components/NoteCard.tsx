/**
 * Note card component for grid/list views.
 */

import { Pin, Archive, Trash2, MoreVertical, FolderOpen, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Note, Folder } from '../types/note';
import { NOTE_COLORS } from '../utils/colors';

interface NoteCardProps {
  note: Note;
  viewMode: 'grid' | 'list';
  folders: Folder[];
  onClick: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMoveToFolder: (folderId: string | null) => void;
}

export default function NoteCard({ note, viewMode, folders, onClick, onPin, onArchive, onDelete, onMoveToFolder }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const colors = NOTE_COLORS[note.color];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeAgo = formatTimeAgo(note.updatedAt);
  const preview = note.plainText?.slice(0, 150) || '';

  const currentFolder = folders.find((f) => f.id === note.folderId);

  if (viewMode === 'list') {
    return (
      <div
        className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${colors.bg} ${colors.bgDark} ${colors.border}`}
        onClick={onClick}
      >
        {note.isPinned && <Pin size={14} className="text-blue-500 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {note.title || 'Untitled'}
          </h3>
          <div className="mt-0.5">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{preview}</p>
            {currentFolder && (
              <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <FolderOpen size={12} />
                <span className="truncate">In {currentFolder.name}</span>
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo}</span>
        <NoteMenu
          menuOpen={menuOpen}
          menuRef={menuRef}
          folders={folders}
          currentFolderId={note.folderId}
          onToggle={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          onPin={onPin}
          onArchive={onArchive}
          onDelete={onDelete}
          onMoveToFolder={onMoveToFolder}
          isPinned={note.isPinned}
        />
      </div>
    );
  }

  return (
    <div
      className={`group rounded-xl border p-4 cursor-pointer transition-all hover:shadow-lg note-card ${colors.bg} ${colors.bgDark} ${colors.border} flex flex-col min-h-[160px]`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {note.isPinned && <Pin size={14} className="text-teal-500" />}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
            {note.title || 'Untitled'}
          </h3>
        </div>
        <NoteMenu
          menuOpen={menuOpen}
          menuRef={menuRef}
          folders={folders}
          currentFolderId={note.folderId}
          onToggle={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          onPin={onPin}
          onArchive={onArchive}
          onDelete={onDelete}
          onMoveToFolder={onMoveToFolder}
          isPinned={note.isPinned}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 flex-1">{preview}</p>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{timeAgo}</span>
          {currentFolder && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <FolderOpen size={12} />
              {currentFolder.name}
            </span>
          )}
        </div>
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteMenu({
  menuOpen, menuRef, folders, currentFolderId, onToggle, onPin, onArchive, onDelete, onMoveToFolder, isPinned,
}: {
  menuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  folders: Folder[];
  currentFolderId: string | null;
  onToggle: (e: React.MouseEvent) => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  isPinned: boolean;
}) {
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const closeFolderMenuTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      setFolderMenuOpen(false);
      if (closeFolderMenuTimerRef.current) {
        window.clearTimeout(closeFolderMenuTimerRef.current);
        closeFolderMenuTimerRef.current = null;
      }
    }
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (closeFolderMenuTimerRef.current) {
        window.clearTimeout(closeFolderMenuTimerRef.current);
      }
    };
  }, []);

  const openFolderMenu = () => {
    if (closeFolderMenuTimerRef.current) {
      window.clearTimeout(closeFolderMenuTimerRef.current);
      closeFolderMenuTimerRef.current = null;
    }
    setFolderMenuOpen(true);
  };

  const closeFolderMenuWithDelay = () => {
    if (closeFolderMenuTimerRef.current) {
      window.clearTimeout(closeFolderMenuTimerRef.current);
    }
    closeFolderMenuTimerRef.current = window.setTimeout(() => {
      setFolderMenuOpen(false);
      closeFolderMenuTimerRef.current = null;
    }, 180);
  };

  const handleMoveToFolderClick = (folderId: string | null) => {
    onMoveToFolder(folderId);
    setFolderMenuOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={onToggle}
        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-20 min-w-[140px]">
          <MenuButton onClick={(e) => { e.stopPropagation(); onPin(); }} icon={<Pin size={14} />}>
            {isPinned ? 'Unpin' : 'Pin'}
          </MenuButton>

          {/* Move to folder submenu */}
          <div
            className="relative"
            onMouseEnter={openFolderMenu}
            onMouseLeave={closeFolderMenuWithDelay}
          >
            <MenuButton
              onClick={(e) => e.stopPropagation()}
              icon={<FolderOpen size={14} />}
            >
              Move to folder
            </MenuButton>

            {folderMenuOpen && (
              <div
                className="absolute right-full top-0 mr-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px] max-h-48 overflow-y-auto z-30"
                onMouseEnter={openFolderMenu}
                onMouseLeave={closeFolderMenuWithDelay}
              >
                <MenuButton
                  onClick={(e) => { e.stopPropagation(); handleMoveToFolderClick(null); }}
                  icon={<FolderOpen size={14} />}
                  selected={currentFolderId === null}
                >
                  All Notes
                </MenuButton>

                {folders.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    {folders.map((folder) => (
                      <MenuButton
                        key={folder.id}
                        onClick={(e) => { e.stopPropagation(); handleMoveToFolderClick(folder.id); }}
                        icon={<FolderOpen size={14} />}
                        selected={currentFolderId === folder.id}
                      >
                        {folder.name}
                      </MenuButton>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <MenuButton onClick={(e) => { e.stopPropagation(); onArchive(); }} icon={<Archive size={14} />}>
            Archive
          </MenuButton>
          <MenuButton onClick={(e) => { e.stopPropagation(); onDelete(); }} icon={<Trash2 size={14} />} danger>
            Delete
          </MenuButton>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  onClick, icon, children, danger, selected,
}: {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${danger
        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
        : selected
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
      {icon}
      <span className="flex-1 text-left truncate">{children}</span>
      {selected && (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300">
          <Check size={11} />
        </span>
      )}
    </button>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
