/**
 * Note sorting utilities
 * Extracted to reduce cognitive complexity
 */

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  A_TO_Z: 'az',
  Z_TO_A: 'za',
};

const handlePinSort = (isPinnedA, isPinnedB) => {
  if (isPinnedA === isPinnedB) return 0;
  return isPinnedA ? -1 : 1;
};

const sortByNewest = (a, b) => {
  const pinnedCmp = handlePinSort(a.isPinned, b.isPinned);
  if (pinnedCmp === 0) return new Date(b.createdAt) - new Date(a.createdAt);
  return pinnedCmp;
};

const sortByOldest = (a, b) => {
  const pinnedCmp = handlePinSort(a.isPinned, b.isPinned);
  if (pinnedCmp === 0) return new Date(a.createdAt) - new Date(b.createdAt);
  return pinnedCmp;
};

const sortByAZ = (a, b) => {
  const pinnedCmp = handlePinSort(a.isPinned, b.isPinned);
  if (pinnedCmp === 0) return (a.title || '').localeCompare(b.title || '');
  return pinnedCmp;
};

const sortByZA = (a, b) => {
  const pinnedCmp = handlePinSort(a.isPinned, b.isPinned);
  if (pinnedCmp === 0) return (b.title || '').localeCompare(a.title || '');
  return pinnedCmp;
};

const sortComparators = {
  [SORT_OPTIONS.NEWEST]: sortByNewest,
  [SORT_OPTIONS.OLDEST]: sortByOldest,
  [SORT_OPTIONS.A_TO_Z]: sortByAZ,
  [SORT_OPTIONS.Z_TO_A]: sortByZA,
};

/**
 * Sort notes by selected option
 * @param {Array} notes - Array of note objects
 * @param {string} sortBy - Sort option (newest, oldest, az, za)
 * @returns {Array} Sorted array of notes
 */
export const sortNotesByOption = (notes, sortBy = SORT_OPTIONS.NEWEST) => {
  const comparator = sortComparators[sortBy];
  return comparator ? [...notes].sort(comparator) : notes;
};
