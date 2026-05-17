// ════════════════════════════════════════════════════════════════════════════
// NOTE CONSTANTS (PR 2)
// ════════════════════════════════════════════════════════════════════════════

export const NOTE_CATEGORIES = ['general', 'idea', 'task'];
export const TASK_STATUSES = ['todo', 'doing', 'done'];

// ─── Category Metadata ─────────────────────────────────────────────────────
export const CATEGORY_INFO = {
  general: {
    label: 'General',
    icon: '📝',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  },
  idea: {
    label: 'Idea',
    icon: '💡',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
  },
  task: {
    label: 'Task',
    icon: '✓',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  },
};

// ─── Task Status Metadata ─────────────────────────────────────────────────
export const TASK_STATUS_INFO = {
  todo: {
    label: 'Todo',
    icon: '○',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  },
  doing: {
    label: 'Doing',
    icon: '⟳',
    color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700',
  },
  done: {
    label: 'Done',
    icon: '✓',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  },
};

// ─── Filter Options ───────────────────────────────────────────────────────
export const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'general', label: 'General' },
  { id: 'idea', label: 'Ideas' },
  { id: 'task', label: 'Tasks' },
];
