import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import useNotes from '../../hooks/useNotes';
import NoteCard from '../../components/notes/NoteCard/NoteCard';
import NoteEditor from '../../components/notes/NoteEditor/NoteEditor';
import NoteViewer from '../../components/notes/NoteViewer/NoteViewer';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { NoteSkeletonGrid } from '../../components/common/Skeleton/NoteSkeleton';
import { truncateTitle, sortNotesByPinnedAndDate, filterNotesByCategory } from '../../utils/helpers';
import { exportNotesService, importNotesService, togglePinNoteService } from '../../services/notes.service';
import { FILTER_OPTIONS } from '../../utils/noteConstants';

// ✅ Sort options with labels
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

const DashboardPage = () => {
  const {
    notes,
    pagination,
    isInitialLoading,
    isSearching,
    loading,
    handleFetchNotes,
    handleAddNote,
    handleEditNote,
    handleRemoveNote,
    handleToggleShare,
    searchQuery,
    handleSearchQuery,
  } = useNotes();

  const [showEditor, setShowEditor]   = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null, noteTitle: '' });
  const [page, setPage]       = useState(1);
  const [saving, setSaving]   = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // ✅ Better default
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const isFirstLoad = useRef(true);
  const importRef   = useRef(null);


  // ─── Initial load ──────────────────────────────────────────────────
  useEffect(() => {
    handleFetchNotes({ page: 1, limit: 10, search: '', isInitial: true });
  }, []);


  // ─── Debounce search ───────────────────────────────────────────────
  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    const timer = setTimeout(() => {
      handleSearchQuery(searchInput);
      setPage(1);
      handleFetchNotes({ page: 1, limit: 10, search: searchInput });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);


  // ─── Page change ───────────────────────────────────────────────────
  const loadNotes = useCallback(() => {
    handleFetchNotes({ page, limit: 10, search: searchQuery });
  }, [page, searchQuery]);

  useEffect(() => {
    if (page === 1 && !searchQuery) return;
    loadNotes();
  }, [page]);


  // ✅ IMPROVED: Unified filtering and sorting with search
  const visibleNotes = useMemo(() => {
    let result = [...notes];

    // 1. Filter by category/pinned
    result = filterNotesByCategory(result, currentFilter);

    // 2. Apply sorting based on sortBy option
    result = result.sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          // Pinned first, then by createdAt descending
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.createdAt) - new Date(a.createdAt);

        case 'oldest':
          // Pinned first, then by createdAt ascending
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(a.createdAt) - new Date(b.createdAt);

        case 'az':
          // Pinned first, then by title A-Z
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return (a.title || '').localeCompare(b.title || '');

        case 'za':
          // Pinned first, then by title Z-A
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return (b.title || '').localeCompare(a.title || '');

        default:
          return 0;
      }
    });

    return result;
  }, [notes, currentFilter, sortBy]);


  // ─── Save note ─────────────────────────────────────────────────────
  const handleSave = async (noteData) => {
    setSaving(true);
    let success;
    if (editingNote) {
      success = await handleEditNote(editingNote._id, noteData);
    } else {
      success = await handleAddNote(noteData);
    }
    setSaving(false);
    if (success) { setShowEditor(false); setEditingNote(null); loadNotes(); }
  };

  const handleEdit        = (note) => { setEditingNote(note); setShowEditor(true); };
  const handleDeleteClick = (note) => setDeleteModal({ isOpen: true, noteId: note._id, noteTitle: note.title });
  const handleDeleteConfirm = async () => {
    await handleRemoveNote(deleteModal.noteId);
    setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
    loadNotes();
  };

  // ✅ PR 2: Handle pin toggle
  const handlePin = async (noteId) => {
    try {
      await togglePinNoteService(noteId);
      toast.success('Note pin status updated!');
      loadNotes();
    } catch (err) {
      toast.error('Failed to toggle pin. Try again.');
    }
  };


  // ─── Export ────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportNotesService();
      toast.success('Notes exported successfully!');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setExporting(false);
    }
  };


  // ─── Import ────────────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      setImporting(true);
      const res   = await importNotesService(file);
      const data  = res?.data || res;
      const importedCount = data?.importedCount ?? 0;
      const skippedCount  = data?.skippedCount ?? 0;

      // ✅ Show different messages based on import results
      if (importedCount === 0 && skippedCount > 0) {
        toast.warning(`All ${skippedCount} note(s) were duplicates and skipped.`);
      } else if (importedCount > 0 && skippedCount > 0) {
        toast.success(
          `${importedCount} note${importedCount !== 1 ? 's' : ''} imported. ${skippedCount} duplicate${skippedCount !== 1 ? 's' : ''} skipped.`
        );
      } else if (importedCount > 0) {
        toast.success(`${importedCount} note${importedCount !== 1 ? 's' : ''} imported successfully!`);
      }

      handleFetchNotes({ page: 1, limit: 10, search: searchQuery });
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Try again.');
    } finally {
      setImporting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">

        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1 w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 truncate">
              My Notes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {pagination.total} note{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* ─── Action Buttons — Mobile Friendly ──────────────────────────────── */}
          <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-end sm:justify-start">

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exporting || notes.length === 0}
              title="Export notes"
              className="
                flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm
                border border-gray-300 dark:border-gray-700
                text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-40
                flex items-center justify-center sm:justify-start gap-1
                transition-colors duration-200 whitespace-nowrap
              "
            >
              {exporting ? (
                <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : '⬇️'}
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Import */}
            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              title="Import notes"
              className="
                flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm
                border border-gray-300 dark:border-gray-700
                text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-40
                flex items-center justify-center sm:justify-start gap-1
                transition-colors duration-200 whitespace-nowrap
              "
            >
              {importing ? (
                <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : '⬆️'}
              <span className="hidden sm:inline">Import</span>
            </button>

            {/* Hidden file input */}
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />

            {/* New Note — Full Width on Mobile */}
            <button
              onClick={() => { setEditingNote(null); setShowEditor(true); }}
              className="
                flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm
                bg-blue-600 dark:bg-blue-500
                hover:bg-blue-700 dark:hover:bg-blue-600
                text-white transition-colors duration-200 whitespace-nowrap ml-auto sm:ml-0
              "
            >
              + Add Note
            </button>
          </div>
        </div>

        {/* ─── Search + Sort Toolbar ───────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3">
          
          {/* Search Input + Sort (Desktop) */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-[35%]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search notes..."
                className="
                  w-full px-3 sm:px-4 py-2.5 rounded-lg text-sm sm:text-base
                  border border-gray-200 dark:border-white/10
                  bg-white dark:bg-white/[0.03]
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40
                  focus:border-blue-300 dark:focus:border-blue-400/50
                  transition-all duration-200
                "
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2 sm:gap-3 min-w-0 sm:min-w-fit">
              <label className="hidden sm:block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                Sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="
                  appearance-none flex-1 sm:flex-none px-3 py-2.5 rounded-lg text-sm sm:text-base
                  border border-gray-200 dark:border-white/10
                  bg-white dark:bg-white/[0.03]
                  text-gray-700 dark:text-gray-300
                  font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40
                  focus:border-blue-300 dark:focus:border-blue-400/50
                  transition-all duration-200
                  cursor-pointer
                  pr-8
                "
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {/* Chevron Icon */}
              <svg
                className="
                  absolute right-2 sm:right-3 w-4 h-4 text-gray-500 dark:text-gray-400
                  pointer-events-none
                "
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {/* Clear Search Button */}
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); handleSearchQuery(''); loadNotes(); }}
                className="
                  px-2.5 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium
                  text-gray-600 dark:text-gray-400
                  hover:text-gray-900 dark:hover:text-gray-100
                  hover:bg-gray-100 dark:hover:bg-white/[0.05]
                  border border-gray-200 dark:border-white/[0.08]
                  transition-all duration-200 whitespace-nowrap
                "
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ─── Filter Chips — Mobile Horizontal Scroll, Desktop Wrap ────────────────────────────── */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 sm:overflow-visible sm:pb-0 sm:flex-wrap -mx-3 px-3 sm:mx-0 sm:px-0">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCurrentFilter(filter.id)}
              className={`
                px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium
                border transition-all duration-200 whitespace-nowrap flex-shrink-0 sm:flex-shrink
                ${currentFilter === filter.id
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-sm'
                  : 'bg-white dark:bg-white/[0.02] text-gray-700 dark:text-gray-400 border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-white/[0.05]'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* ─── Note Editor Modal ───────────────────────────────────── */}
        {showEditor && (
          <NoteEditor
            key={editingNote?._id || 'new'}
            note={editingNote}
            onSave={handleSave}
            onClose={() => { setShowEditor(false); setEditingNote(null); }}
            loading={saving}
          />
        )}

        {/* ─── Note Viewer Modal ───────────────────────────────────── */}
        {viewingNote && (
          <NoteViewer
            note={viewingNote}
            onClose={() => setViewingNote(null)}
          />
        )}

        {/* ─── Notes Grid ──────────────────────────────────────────── */}
        {isInitialLoading ? (
          <NoteSkeletonGrid count={6} />
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📝</p>
            {searchInput ? (
              <>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No notes found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first note to get started
                </p>
                <button
                  onClick={() => { setEditingNote(null); setShowEditor(true); }}
                  className="
                    px-4 py-2 rounded-lg
                    bg-blue-600 dark:bg-blue-500
                    hover:bg-blue-700 dark:hover:bg-blue-600
                    text-white transition-colors duration-200
                  "
                >
                  + New Note
                </button>
              </>
            )}
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">✨</p>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No notes match your filters
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => { setCurrentFilter('all'); setSearchInput(''); setSortBy('newest'); }}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-gray-100 dark:bg-white/[0.05]
                text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-white/[0.08]
                transition-colors duration-200
              "
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}>
            {visibleNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDeleteClick(note)}
                onShare={handleToggleShare}
                onView={() => setViewingNote(note)}
                onPin={handlePin}
              />
            ))}
          </div>
        )}

        {/* ─── Pagination ──────────────────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="
                px-4 py-2 rounded-lg
                border border-gray-300 dark:border-gray-700
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-40 transition-colors duration-200
              "
            >← Prev</button>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="
                px-4 py-2 rounded-lg
                border border-gray-300 dark:border-gray-700
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-40 transition-colors duration-200
              "
            >Next →</button>
          </div>
        )}
      </div>

      {/* ─── Delete Confirm Modal ─────────────────────────────────── */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message={`Are you sure you want to delete "${truncateTitle(deleteModal.noteTitle, 50)}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </div>
  );
};

export default DashboardPage;