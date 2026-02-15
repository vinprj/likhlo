/**
 * Core data types for Likhlo notes app.
 */

export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink';

export interface Note {
  id: string;
  userId: string | null;
  title: string;
  /** TipTap JSON content */
  content: any;
  /** Plain text extract for search */
  plainText: string;
  color: NoteColor;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: NoteColor;
  order: number;
  createdAt: number;
}

export type SortOption = 'updatedAt' | 'createdAt' | 'title';
export type ViewMode = 'grid' | 'list';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  viewMode: ViewMode;
  sortBy: SortOption;
  sortDesc: boolean;
}
