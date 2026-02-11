/**
 * React hooks for notes and folders state management.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Note, Folder, AppSettings } from '../types/note';
import * as storage from '../services/storage';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await storage.getActiveNotes();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (initial?: Partial<Note>) => {
    const note = await storage.createNote(initial);
    await refresh();
    return note;
  }, [refresh]);

  const update = useCallback(async (id: string, changes: Partial<Note>) => {
    const note = await storage.updateNote(id, changes);
    await refresh();
    return note;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    // Soft delete — move to trash
    await storage.updateNote(id, { isTrashed: true });
    await refresh();
  }, [refresh]);

  const archive = useCallback(async (id: string) => {
    await storage.updateNote(id, { isArchived: true });
    await refresh();
  }, [refresh]);

  const unarchive = useCallback(async (id: string) => {
    await storage.updateNote(id, { isArchived: false });
    await refresh();
  }, [refresh]);

  const togglePin = useCallback(async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      await storage.updateNote(id, { isPinned: !note.isPinned });
      await refresh();
    }
  }, [notes, refresh]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      await refresh();
      return;
    }
    const results = await storage.searchNotes(query);
    setNotes(results);
  }, [refresh]);

  return { notes, loading, create, update, remove, archive, unarchive, togglePin, search, refresh };
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);

  const refresh = useCallback(async () => {
    const data = await storage.getAllFolders();
    setFolders(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (name: string, color?: Note['color']) => {
    const folder = await storage.createFolder(name, color);
    await refresh();
    return folder;
  }, [refresh]);

  const update = useCallback(async (id: string, changes: Partial<Folder>) => {
    await storage.updateFolder(id, changes);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await storage.deleteFolder(id);
    await refresh();
  }, [refresh]);

  return { folders, create, update, remove, refresh };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    viewMode: 'grid',
    sortBy: 'updatedAt',
    sortDesc: true,
  });

  useEffect(() => {
    storage.getSettings().then(setSettings);
  }, []);

  const update = useCallback(async (changes: Partial<AppSettings>) => {
    const updated = await storage.updateSettings(changes);
    setSettings(updated);
    return updated;
  }, []);

  return { settings, update };
}

export function useArchivedNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await storage.getArchivedNotes();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { notes, loading, refresh };
}

export function useTrash() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await storage.getTrashedNotes();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const restore = useCallback(async (id: string) => {
    await storage.updateNote(id, { isTrashed: false });
    await refresh();
  }, [refresh]);

  const permanentDelete = useCallback(async (id: string) => {
    await storage.deleteNote(id);
    await refresh();
  }, [refresh]);

  const emptyAll = useCallback(async () => {
    await storage.emptyTrash();
    await refresh();
  }, [refresh]);

  return { notes, loading, restore, permanentDelete, emptyAll, refresh };
}
