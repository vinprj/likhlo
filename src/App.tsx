/**
 * Likhlo — Main App Component
 * A clean, fast notes app inspired by GNotes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotes, useFolders, useSettings, useArchivedNotes, useTrash } from './hooks/useNotes';
import Sidebar, { type SidebarView } from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';
import ColorPicker from './components/ColorPicker';
import FolderSelector from './components/FolderSelector';
import ThemeToggle from './components/ThemeToggle';
import Auth from './components/Auth';
import NoteTemplates from './components/NoteTemplates';
import Profile from './components/Profile';
import NoteExport from './components/NoteExport';
import { sortNotes } from './utils/sort';
import { Plus, ArrowLeft, List, LayoutGrid, LogOut, User, Download } from 'lucide-react';
import type { Note, NoteColor } from './types/note';

// Inline Supabase client
const supabaseUrl = 'https://rlpusnjwgqskqyawavpo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscHVzbmp3Z3Fza3F5YXdhdnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3ODg0NTksImV4cCI6MjA4NjM2NDQ1OX0.bdPCZiIKl73m5gCXcl56GWo_mZI96k73ORw9Afpqi9k';

const supabase = {
  auth: {
    signOut: async () => {
      localStorage.removeItem('supabase_session');
      return { error: null };
    },
    getSession: async () => {
      const stored = localStorage.getItem('supabase_session');
      if (stored) {
        const data = JSON.parse(stored);
        return { data: { session: data }, error: null };
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
};

export default function App() {
  const { notes, loading, create, update, remove, archive, togglePin, search, refresh } = useNotes();
  const { folders, create: createFolder, remove: deleteFolder } = useFolders();
  const { settings, update: updateSettings } = useSettings();
  const archivedNotes = useArchivedNotes();
  const trash = useTrash();

  const [session, setSession] = useState<any>(null);
  const [activeView, setActiveView] = useState<SidebarView>('notes');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const hasInitializedTheme = useRef(false);

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (hasInitializedTheme.current) {
        root.classList.add('theme-transition');
        window.setTimeout(() => root.classList.remove('theme-transition'), 250);
      }
      const shouldUseDark = settings.theme === 'dark' || (settings.theme === 'system' && mediaQuery.matches);
      root.classList.toggle('dark', shouldUseDark);
      hasInitializedTheme.current = true;
    };

    applyTheme();

    if (settings.theme !== 'system') return;

    const handleChange = () => applyTheme();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [settings.theme]);

  const handleViewChange = useCallback((view: SidebarView, folderId?: string) => {
    setActiveView(view);
    setActiveFolderId(folderId ?? null);
    setEditingNote(null);
  }, []);

  const handleCreateNote = useCallback(async (template?: { title: string; content: any }) => {
    const note = await create({
      folderId: activeView === 'folder' ? activeFolderId : null,
      userId: session?.user?.id,
      title: template?.title || '',
      content: template?.content || null,
    });
    setEditingNote(note);
  }, [create, activeView, activeFolderId, session]);

  const handleNoteUpdate = useCallback(async (content: any, plainText: string) => {
    if (!editingNote) return;
    const updated = await update(editingNote.id, { content, plainText });
    if (updated) setEditingNote(updated);
  }, [editingNote, update]);

  const handleTitleChange = useCallback(async (title: string) => {
    if (!editingNote) return;
    const updated = await update(editingNote.id, { title });
    if (updated) setEditingNote(updated);
  }, [editingNote, update]);

  const handleColorChange = useCallback(async (color: NoteColor) => {
    if (!editingNote) return;
    const updated = await update(editingNote.id, { color });
    if (updated) setEditingNote(updated);
  }, [editingNote, update]);

  const handleFolderChange = useCallback(async (folderId: string | null) => {
    if (!editingNote) return;
    const updated = await update(editingNote.id, { folderId });
    if (updated) setEditingNote(updated);
  }, [editingNote, update]);

  const handleMoveToFolder = useCallback(async (noteId: string, folderId: string | null) => {
    await update(noteId, { folderId });
    refresh();
  }, [update, refresh]);

  // Get notes for current view
  const getDisplayNotes = (): Note[] => {
    let displayNotes: Note[] = [];
    const userId = session?.user?.id;
    
    switch (activeView) {
      case 'notes':
        displayNotes = userId ? notes.filter((n) => n.userId === userId) : notes;
        break;
      case 'folder':
        displayNotes = (userId ? notes.filter((n) => n.userId === userId) : notes).filter((n) => n.folderId === activeFolderId);
        break;
      case 'archive':
        displayNotes = archivedNotes.notes.filter((n) => n.userId === userId);
        break;
      case 'trash':
        displayNotes = trash.notes.filter((n) => n.userId === userId);
        break;
    }
    return sortNotes(displayNotes, settings.sortBy, settings.sortDesc);
  };

  const displayNotes = getDisplayNotes();
  const viewTitle = activeView === 'folder'
    ? folders.find((f) => f.id === activeFolderId)?.name || 'Folder'
    : activeView === 'archive' ? 'Archive'
      : activeView === 'trash' ? 'Trash'
        : 'All Notes';

  // Show auth if not logged in
  if (!session) {
    return <Auth onAuthSuccess={() => { supabase.auth.getSession().then(({ data: { session } }) => setSession(session)); }} />;
  }

  // Editor view
  if (editingNote) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar
          folders={folders}
          activeView={activeView}
          activeFolderId={activeFolderId}
          onViewChange={handleViewChange}
          onCreateFolder={createFolder}
          onDeleteFolder={deleteFolder}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={() => { setEditingNote(null); refresh(); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <input
              type="text"
              value={editingNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title"
              className="flex-1 text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <FolderSelector
              folderId={editingNote.folderId}
              folders={folders}
              onChange={handleFolderChange}
            />
            <ColorPicker selected={editingNote.color} onChange={handleColorChange} />
            <button
              onClick={() => setShowExport(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Export & Tags"
            >
              <Download size={20} className="text-gray-500" />
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Profile"
            >
              <User size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <NoteEditor
              content={editingNote.content}
              onUpdate={handleNoteUpdate}
            />
          </div>
        </div>
      </div>
    );
  }

  // Notes list view
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        folders={folders}
        activeView={activeView}
        activeFolderId={activeFolderId}
        onViewChange={handleViewChange}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{viewTitle}</h2>
          <div className="flex-1 max-w-md">
            <SearchBar onSearch={search} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ viewMode: settings.viewMode === 'grid' ? 'list' : 'grid' })}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title={settings.viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
            >
              {settings.viewMode === 'grid' ? <List size={20} className="text-gray-500" /> : <LayoutGrid size={20} className="text-gray-500" />}
            </button>
            <ThemeToggle theme={settings.theme} onChange={(theme) => updateSettings({ theme })} />
            <button
              onClick={() => setShowProfile(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Profile"
            >
              <User size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : displayNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="text-lg mb-2">
                {activeView === 'trash' ? 'Trash is empty' : activeView === 'archive' ? 'No archived notes' : 'No notes yet'}
              </p>
              {activeView !== 'trash' && activeView !== 'archive' && (
                <button
                  onClick={handleCreateNote}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            <div className={
              settings.viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-2'
            }>
              {displayNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  viewMode={settings.viewMode}
                  folders={folders}
                  onClick={() => setEditingNote(note)}
                  onPin={() => togglePin(note.id)}
                  onArchive={() => archive(note.id)}
                  onDelete={() => remove(note.id)}
                  onMoveToFolder={(folderId) => handleMoveToFolder(note.id, folderId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB */}
        {activeView !== 'trash' && activeView !== 'archive' && (
          <>
            <button
              onClick={() => setShowTemplates(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              title="New note"
            >
              <Plus size={24} />
            </button>
          </>
        )}

        {/* Template Modal */}
        {showTemplates && (
          <NoteTemplates
            onSelect={(template) => {
              handleCreateNote(template);
              setShowTemplates(false);
            }}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {/* Profile Modal */}
        {showProfile && (
          <Profile
            session={session}
            onClose={() => setShowProfile(false)}
            onSignOut={() => {
              handleSignOut();
              setShowProfile(false);
            }}
          />
        )}

        {/* Export Modal */}
        {showExport && editingNote && (
          <NoteExport
            note={editingNote}
            onClose={() => setShowExport(false)}
          />
        )}
      </div>
    </div>
  );
}
