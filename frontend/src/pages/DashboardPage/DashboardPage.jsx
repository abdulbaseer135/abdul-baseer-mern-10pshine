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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-page-bg)' }}>
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ─── Page Header — Premium, refined ────────────────────────── */}
        <div className="mb-7 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-5">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              My Notes
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-medium">{pagination.total}</span> note{pagination.total !== 1 ? 's' : ''} 
              <span className="mx-1.5">•</span>
              <span className="font-medium">{currentFilter === 'all' ? 'All notes' : FILTER_OPTIONS.find(f => f.id === currentFilter)?.label}</span>
            </p>
          </div>

          {/* ─── Action Buttons — Better hierarchy ──────────────────────────────── */}
          <div className="w-full sm:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">

            {/* Export — Quiet secondary action */}
            <button
              onClick={handleExport}
              disabled={exporting || notes.length === 0}
              title="Export all notes to JSON"
              className="
                px-3 py-1.5 rounded-lg font-medium text-xs
                border
                transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0
                disabled:opacity-40 disabled:cursor-not-allowed
              "
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-tertiary)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-input)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              {exporting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v4a2 2 0 002 2h12a2 2 0 002-2v-4m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>)}
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Import — Quiet secondary action */}
            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              title="Import notes from JSON"
              className="
                px-3 py-1.5 rounded-lg font-medium text-xs
                border
                transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0
                disabled:opacity-40 disabled:cursor-not-allowed
              "
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-tertiary)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-input)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              {importing ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v6" />
                </svg>
              )}
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

            {/* Add Note — Dominant primary action */}
            <button
              onClick={() => { setEditingNote(null); setShowEditor(true); }}
              className="
                px-4 py-2 rounded-lg font-semibold text-sm
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:active:bg-indigo-700
                text-white
                transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0
                shadow-md hover:shadow-lg
              "
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round"/></svg>
              <span>Add Note</span>
            </button>
          </div>
        </div>

        {/* ─── Search + Sort + Filter Toolbar — Premium, intentional ──────────────────────────────── */}
        <div className="mb-5 flex flex-col gap-3">
          
          {/* Search Input + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            
            {/* Search Input — Refined, premium */}
            <div className="relative w-full sm:flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search notes..."
                className="
                  w-full pl-10 pr-10 py-2 rounded-lg text-sm
                  border
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                  transition-all duration-200
                  placeholder:text-text-muted
                "
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: searchInput ? 'var(--border-strong)' : 'var(--border-default)',
                  color: 'var(--text-primary)'
                }}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
              )}
              {searchInput && !isSearching && (
                <button
                  onClick={() => { setSearchInput(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round"/></svg>
                </button>
              )}
            </div>

            {/* Sort Dropdown — Refined, compact */}
            <div className="relative flex items-center gap-1.5 flex-shrink-0">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="
                  appearance-none px-3 py-2 rounded-lg text-sm font-medium
                  border
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                  transition-all duration-200 cursor-pointer
                  pr-8
                "
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)'
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <svg
                className="absolute right-2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Filter Chips — Compact, quiet, premium */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 sm:overflow-visible sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setCurrentFilter(filter.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold
                  border transition-all duration-200 whitespace-nowrap flex-shrink-0 sm:flex-shrink
                  ${
                    currentFilter === filter.id
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-sm hover:shadow-md'
                      : ''
                  }
                `}
                style={currentFilter === filter.id ? {} : {
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-tertiary)'
                }}
                onMouseEnter={(e) => {
                  if (currentFilter !== filter.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-input)';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentFilter !== filter.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
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
          <div className="text-center py-12">
            <p className="text-5xl mb-3">📝</p>
            {searchInput ? (
              <>
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No notes found
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No notes yet
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Create your first note to get started
                </p>
                <button
                  onClick={() => { setEditingNote(null); setShowEditor(true); }}
                  className="
                    px-3 py-1.5 rounded-md text-sm font-semibold
                    bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                    dark:bg-indigo-500 dark:hover:bg-indigo-600
                    text-white transition-all duration-150
                  "
                >
                  + New Note
                </button>
              </>
            )}
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">✨</p>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No notes match your filters
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => { setCurrentFilter('all'); setSearchInput(''); setSortBy('newest'); }}
              className="
                px-3 py-1.5 rounded-md text-sm font-medium
                border border-slate-300 dark:border-slate-600
                text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700
                transition-all duration-150
              "
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}>
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
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="
                px-3 py-1.5 rounded-md text-sm font-medium
                border border-slate-300 dark:border-slate-600
                text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >← Prev</button>
            <span className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="
                px-3 py-1.5 rounded-md text-sm font-medium
                border border-slate-300 dark:border-slate-600
                text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
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