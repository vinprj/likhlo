/**
 * Supabase sync layer for Likhlo.
 * Handles cloud sync for notes and folders.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// These would come from env vars in production
const SUPABASE_URL = 'https://rlpusnjwgqskqyawavpo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscHVzbmp3Z3Fza3F5YXdhdnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3ODg0NTksImV4cCI6MjA4NjM2NDQ1OX0.bdPCZiIKl73m5gCXcl56GWo_mZI96k73ORw9Afpqi9k';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

// Check if user is logged in
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ─── Notes Sync ─────────────────────────────────────────────────────

export interface SyncNote {
  id: string;
  user_id: string;
  title: string;
  content: any;
  plain_text: string;
  color: string;
  folder_id: string | null;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  created_at: number;
  updated_at: number;
}

export async function fetchNotesFromCloud(userId: string): Promise<SyncNote[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes from cloud:', error);
    return [];
  }

  return data || [];
}

export async function pushNoteToCloud(note: SyncNote): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('notes')
    .upsert({
      id: note.id,
      user_id: note.user_id,
      title: note.title,
      content: note.content,
      plain_text: note.plain_text,
      color: note.color,
      folder_id: note.folder_id,
      tags: note.tags,
      is_pinned: note.is_pinned,
      is_archived: note.is_archived,
      is_trashed: note.is_trashed,
      created_at: note.created_at,
      updated_at: note.updated_at,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error pushing note to cloud:', error);
    return false;
  }
  return true;
}

export async function deleteNoteFromCloud(noteId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note from cloud:', error);
    return false;
  }
  return true;
}

// ─── Folders Sync ───────────────────────────────────────────────────

export interface SyncFolder {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  created_at: number;
}

export async function fetchFoldersFromCloud(userId: string): Promise<SyncFolder[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching folders from cloud:', error);
    return [];
  }

  return data || [];
}

export async function pushFolderToCloud(folder: SyncFolder): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('folders')
    .upsert({
      id: folder.id,
      user_id: folder.user_id,
      name: folder.name,
      icon: folder.icon,
      color: folder.color,
      order: folder.order,
      created_at: folder.created_at,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error pushing folder to cloud:', error);
    return false;
  }
  return true;
}

export async function deleteFolderFromCloud(folderId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('Error deleting folder from cloud:', error);
    return false;
  }
  return true;
}

// ─── Sync Helpers ──────────────────────────────────────────────────

/**
 * Convert local note to cloud format
 */
export function noteToCloud(note: any, userId: string): SyncNote {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    plain_text: note.plainText,
    color: note.color,
    folder_id: note.folderId,
    tags: note.tags || [],
    is_pinned: note.isPinned,
    is_archived: note.isArchived,
    is_trashed: note.isTrashed,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  };
}

/**
 * Convert cloud note to local format
 */
export function noteFromCloud(note: SyncNote): any {
  return {
    id: note.id,
    userId: note.user_id,
    title: note.title,
    content: note.content,
    plainText: note.plain_text,
    color: note.color,
    folderId: note.folder_id,
    tags: note.tags || [],
    isPinned: note.is_pinned,
    isArchived: note.is_archived,
    isTrashed: note.is_trashed,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

/**
 * Convert local folder to cloud format
 */
export function folderToCloud(folder: any, userId: string): SyncFolder {
  return {
    id: folder.id,
    user_id: userId,
    name: folder.name,
    icon: folder.icon || 'folder',
    color: folder.color || 'default',
    order: folder.order || 0,
    created_at: folder.createdAt,
  };
}

/**
 * Convert cloud folder to local format
 */
export function folderFromCloud(folder: SyncFolder): any {
  return {
    id: folder.id,
    name: folder.name,
    icon: folder.icon,
    color: folder.color,
    order: folder.order,
    createdAt: folder.created_at,
  };
}
