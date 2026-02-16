/**
 * IndexedDB + Supabase sync layer for Likhlo.
 * Handles local persistence AND cloud sync.
 */

import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { Note, Folder, AppSettings } from '../types/note';
import { noteToCloud, folderToCloud, noteFromCloud, folderFromCloud, fetchNotesFromCloud, fetchFoldersFromCloud, pushNoteToCloud, pushFolderToCloud, deleteNoteFromCloud, deleteFolderFromCloud, getCurrentUserId } from './supabase-sync';

// Supabase config
const SUPABASE_URL = 'https://rlpusnjwgqskqyawavpo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscHVzbmp3Z3Fza3F5YXdhdnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3ODg0NTksImV4cCI6MjA4NjM2NDQ1OX0.bdPCZiIKl73m5gCXcl56GWo_mZI96k73ORw9Afpqi9k';

interface LikhloDBSchema extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      'by-folder': string;
      'by-updated': number;
      'by-created': number;
      'by-user': string;
    };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: {
      'by-order': number;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<LikhloDBSchema>> | null = null;

function getDB(): Promise<IDBPDatabase<LikhloDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<LikhloDBSchema>('likhlo-db', 2, {
      upgrade(db, oldVersion: number) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-folder', 'folderId');
        noteStore.createIndex('by-updated', 'updatedAt');
        noteStore.createIndex('by-created', 'createdAt');
        noteStore.createIndex('by-user', 'userId');

        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('by-order', 'order');

        db.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get current user from session
function getUserId(): string | null {
  const stored = localStorage.getItem('supabase_session');
  if (!stored) return null;
  try {
    const session = JSON.parse(stored);
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

// Sync helpers
async function syncNoteToCloud(note: Note) {
  const userId = getUserId();
  if (!userId) return;
  await pushNoteToCloud(noteToCloud(note, userId));
}

async function syncFolderToCloud(folder: Folder) {
  const userId = getUserId();
  if (!userId) return;
  await pushFolderToCloud(folderToCloud(folder, userId));
}

async function removeNoteFromCloud(noteId: string) {
  await deleteNoteFromCloud(noteId);
}

async function removeFolderFromCloud(folderId: string) {
  await deleteFolderFromCloud(folderId);
}

// ─── Notes ───────────────────────────────────────────────────────────

export async function createNote(note: Partial<Note> = {}): Promise<Note> {
  const db = await getDB();
  const now = Date.now();
  const userId = getUserId();
  const fullNote: Note = {
    id: generateId(),
    userId,
    title: '',
    content: null,
    plainText: '',
    color: 'default',
    folderId: null,
    tags: [],
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: now,
    updatedAt: now,
    ...note,
  };
  await db.put('notes', fullNote);
  
  // Sync to cloud if logged in
  if (userId) {
    syncNoteToCloud(fullNote).catch(console.error);
  }
  
  return fullNote;
}

export async function updateNote(id: string, changes: Partial<Note>): Promise<Note | null> {
  const db = await getDB();
  const note = await db.get('notes', id);
  if (!note) return null;
  const updated = { ...note, ...changes, updatedAt: Date.now() };
  await db.put('notes', updated);
  
  // Sync to cloud if logged in
  const userId = getUserId();
  if (userId) {
    syncNoteToCloud(updated).catch(console.error);
  }
  
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
  
  // Delete from cloud if logged in
  const userId = getUserId();
  if (userId) {
    removeNoteFromCloud(id).catch(console.error);
  }
}

export async function getNote(id: string): Promise<Note | null> {
  const db = await getDB();
  return (await db.get('notes', id)) ?? null;
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  return db.getAll('notes');
}

export async function getActiveNotes(): Promise<Note[]> {
  const notes = await getAllNotes();
  return notes.filter((n) => !n.isArchived && !n.isTrashed);
}

export async function getArchivedNotes(): Promise<Note[]> {
  const notes = await getAllNotes();
  return notes.filter((n) => n.isArchived && !n.isTrashed);
}

export async function getTrashedNotes(): Promise<Note[]> {
  const notes = await getAllNotes();
  return notes.filter((n) => n.isTrashed);
}

export async function getNotesByFolder(folderId: string): Promise<Note[]> {
  const db = await getDB();
  return db.getAllFromIndex('notes', 'by-folder', folderId);
}

export async function emptyTrash(): Promise<void> {
  const trashed = await getTrashedNotes();
  const db = await getDB();
  const userId = getUserId();
  const tx = db.transaction('notes', 'readwrite');
  for (const note of trashed) {
    await tx.store.delete(note.id);
    if (userId) {
      removeNoteFromCloud(note.id).catch(console.error);
    }
  }
  await tx.done;
}

// ─── Folders ─────────────────────────────────────────────────────────

export async function createFolder(name: string, color: Note['color'] = 'default', icon: string = 'folder'): Promise<Folder> {
  const db = await getDB();
  const folders = await getAllFolders();
  const userId = getUserId();
  const folder: Folder = {
    id: generateId(),
    name,
    icon,
    color,
    order: folders.length,
    createdAt: Date.now(),
  };
  await db.put('folders', folder);
  
  // Sync to cloud if logged in
  if (userId) {
    syncFolderToCloud(folder).catch(console.error);
  }
  
  return folder;
}

export async function updateFolder(id: string, changes: Partial<Folder>): Promise<Folder | null> {
  const db = await getDB();
  const folder = await db.get('folders', id);
  if (!folder) return null;
  const updated = { ...folder, ...changes };
  await db.put('folders', updated);
  
  // Sync to cloud if logged in
  const userId = getUserId();
  if (userId) {
    syncFolderToCloud(updated).catch(console.error);
  }
  
  return updated;
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  const notes = await getNotesByFolder(id);
  const tx = db.transaction(['notes', 'folders'], 'readwrite');
  for (const note of notes) {
    await tx.objectStore('notes').put({ ...note, folderId: null });
  }
  await tx.objectStore('folders').delete(id);
  await tx.done;
  
  // Delete from cloud if logged in
  const userId = getUserId();
  if (userId) {
    removeFolderFromCloud(id).catch(console.error);
  }
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  return db.getAllFromIndex('folders', 'by-order');
}

// ─── Settings ────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  viewMode: 'grid',
  sortBy: 'updatedAt',
  sortDesc: true,
};

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const saved = await db.get('settings', 'app');
  return { ...DEFAULT_SETTINGS, ...(saved || {}) };
}

export async function updateSettings(changes: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDB();
  const current = await getSettings();
  const updated = { ...current, ...changes };
  await db.put('settings', updated, 'app');
  return updated;
}

// ─── Search ──────────────────────────────────────────────────────────

export async function searchNotes(query: string): Promise<Note[]> {
  const notes = await getActiveNotes();
  const q = query.toLowerCase().trim();
  if (!q) return notes;
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.plainText.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
  );
}

// ─── Cloud Sync ─────────────────────────────────────────────────────

export async function syncFromCloud(): Promise<{ notes: number; folders: number }> {
  const userId = getUserId();
  if (!userId) return { notes: 0, folders: 0 };
  
  const db = await getDB();
  
  // Fetch from cloud
  const cloudNotes = await fetchNotesFromCloud(userId);
  const cloudFolders = await fetchFoldersFromCloud(userId);
  
  // Get local
  const localNotes = await db.getAll('notes');
  const localFolders = await db.getAll('folders');
  
  const localNoteMap = new Map(localNotes.map(n => [n.id, n]));
  const localFolderMap = new Map(localFolders.map(f => [f.id, f]));
  
  let notesSynced = 0;
  let foldersSynced = 0;
  
  // Merge cloud notes (newer wins)
  for (const cn of cloudNotes) {
    const local = localNoteMap.get(cn.id);
    if (!local || cn.updated_at > local.updatedAt) {
      const localNote = noteFromCloud(cn);
      await db.put('notes', localNote);
      notesSynced++;
    }
  }
  
  // Merge cloud folders
  for (const cf of cloudFolders) {
    const local = localFolderMap.get(cf.id);
    if (!local) {
      const localFolder = folderFromCloud(cf);
      await db.put('folders', localFolder);
      foldersSynced++;
    }
  }
  
  return { notes: notesSynced, folders: foldersSynced };
}
