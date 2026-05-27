import { NOTE_CONTENT_PREVIEW_LENGTH, NOTE_TITLE_MAX_LENGTH } from './constants';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

/**
 * Safe: DOM-based HTML tag stripping, avoids regex DoS vulnerability.
 * Uses textContent instead of regex to safely extract plain text from HTML.
 */
export const stripHtmlTags = (html) => {
  if (!html) return '';
  // Use DOM API to safely extract text content without regex DoS risk
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.textContent || '';
};

export const truncateText = (text, maxLength = NOTE_CONTENT_PREVIEW_LENGTH) => {
  if (!text) return '';
  const plainText = stripHtmlTags(text);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
};

export const truncateTitle = (title, maxLength = NOTE_TITLE_MAX_LENGTH) => {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength).trim() + '...';
};

// ─── PR 2: Note Sorting Helper ────────────────────────────────────────────
/**
 * Sort notes by pinned status first, then by updatedAt descending
 * Pinned notes always appear first, then by most recently updated
 */
export const sortNotesByPinnedAndDate = (notes) => {
  if (!Array.isArray(notes)) return [];
  return [...notes].sort((a, b) => {
    // First: sort by isPinned (true comes first)
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    // Then: sort by updatedAt descending (newest first)
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });
};

/**
 * Filter notes by selected filter
 */
export const filterNotesByCategory = (notes, filter) => {
  if (!Array.isArray(notes)) return [];

  switch (filter) {
    case 'all':
      return notes;
    case 'pinned':
      return notes.filter((n) => n.isPinned);
    case 'general':
      return notes.filter((n) => n.category === 'general');
    case 'idea':
      return notes.filter((n) => n.category === 'idea');
    case 'task':
      return notes.filter((n) => n.category === 'task');
    default:
      return notes;
  }
};