/**
 * Folder selector dropdown component.
 * Allows selecting a folder or "No folder" for a note.
 */

import { useState, useRef, useEffect } from 'react';
import { FolderOpen, ChevronDown } from 'lucide-react';
import type { Folder } from '../types/note';

interface FolderSelectorProps {
    folderId: string | null;
    folders: Folder[];
    onChange: (folderId: string | null) => void;
}

export default function FolderSelector({ folderId, folders, onChange }: FolderSelectorProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const selectedFolder = folders.find((f) => f.id === folderId);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (newFolderId: string | null) => {
        onChange(newFolderId);
        setOpen(false);
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
            >
                <FolderOpen size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                    {selectedFolder ? selectedFolder.name : 'No folder'}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
            </button>

            {open && (
                <div className="absolute left-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-30 min-w-[180px] max-h-64 overflow-y-auto">
                    <button
                        onClick={() => handleSelect(null)}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-left ${folderId === null
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FolderOpen size={14} />
                        <span>No folder</span>
                    </button>

                    {folders.length > 0 && (
                        <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                            {folders.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => handleSelect(folder.id)}
                                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-left ${folderId === folder.id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <FolderOpen size={14} />
                                    <span>{folder.name}</span>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
