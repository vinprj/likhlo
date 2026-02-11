import type { Note, SortOption } from '../types/note';

/**
 * Sort notes: pinned first, then by chosen criteria.
 */
export function sortNotes(notes: Note[], sortBy: SortOption, desc: boolean): Note[] {
  const sorted = [...notes].sort((a, b) => {
    // Pinned always first
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

    let cmp = 0;
    switch (sortBy) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        cmp = a.createdAt - b.createdAt;
        break;
      case 'updatedAt':
      default:
        cmp = a.updatedAt - b.updatedAt;
        break;
    }
    return desc ? -cmp : cmp;
  });
  return sorted;
}
