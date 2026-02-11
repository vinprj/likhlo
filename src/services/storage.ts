/**
 * IndexedDB storage layer for Likhlo.
 * Handles all local persistence for notes, folders, and settings.
 */

import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { Note, Folder, AppSettings } from '../types/note';

interface LikhloDBSchema extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      'by-folder': string;
      'by-updated': number;
      'by-created': number;
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
    dbPromise = openDB<LikhloDBSchema>('likhlo-db', 1, {
      upgrade(db) {
        // Notes store
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-folder', 'folderId');
        noteStore.createIndex('by-updated', 'updatedAt');
        noteStore.createIndex('by-created', 'createdAt');

        // Folders store
        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('by-order', 'order');

        // Settings store
        db.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Notes ───────────────────────────────────────────────────────────

export async function createNote(note: Partial<Note> = {}): Promise<Note> {
  const db = await getDB();
  const now = Date.now();
  const fullNote: Note = {
    id: generateId(),
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
  return fullNote;
}

export async function updateNote(id: string, changes: Partial<Note>): Promise<Note | null> {
  const db = await getDB();
  const note = await db.get('notes', id);
  if (!note) return null;
  const updated = { ...note, ...changes, updatedAt: Date.now() };
  await db.put('notes', updated);
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
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
  const tx = db.transaction('notes', 'readwrite');
  for (const note of trashed) {
    await tx.store.delete(note.id);
  }
  await tx.done;
}

// ─── Folders ─────────────────────────────────────────────────────────

export async function createFolder(name: string, color: Note['color'] = 'default'): Promise<Folder> {
  const db = await getDB();
  const folders = await getAllFolders();
  const folder: Folder = {
    id: generateId(),
    name,
    color,
    order: folders.length,
    createdAt: Date.now(),
  };
  await db.put('folders', folder);
  return folder;
}

export async function updateFolder(id: string, changes: Partial<Folder>): Promise<Folder | null> {
  const db = await getDB();
  const folder = await db.get('folders', id);
  if (!folder) return null;
  const updated = { ...folder, ...changes };
  await db.put('folders', updated);
  return updated;
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  // Move folder's notes to unfiled
  const notes = await getNotesByFolder(id);
  const tx = db.transaction('notes', 'readwrite');
  for (const note of notes) {
    await tx.store.put({ ...note, folderId: null });
  }
  await tx.done;
  await db.delete('folders', id);
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
