import { useState, useEffect, useRef } from 'react';
import useNotes from '../../hooks/useNotes';
import useDashboardHandlers from '../../hooks/useDashboardHandlers';
import NoteEditor from '../../components/notes/NoteEditor/NoteEditor';
import NoteViewer from '../../components/notes/NoteViewer/NoteViewer';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { NoteSkeletonGrid } from '../../components/common/Skeleton/NoteSkeleton';
import { FILTER_OPTIONS } from '../../utils/noteConstants';
import { truncateTitle } from '../../utils/helpers';
import EmptyNotesState from './EmptyNotesState';
import NoFilterMatchState from './NoFilterMatchState';
import NotesGridView from './NotesGridView';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'az', label: 'Title: A → Z' },
  { value: 'za', label: 'Title: Z → A' },
];

const DashboardPage = () => {
  const {
    notes,
    isInitialLoading,
    isSearching,
    handleFetchNotes,
    handleAddNote,
    handleEditNote,
    handleRemoveNote,
    handleToggleShare,
    searchQuery,
    handleSearchQuery,
  } = useNotes();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  const hasFetchedInitially = useRef(false);
  const hasMountedSearch = useRef(false);

  const {
    showEditor,
    setShowEditor,
    editingNote,
    setEditingNote,
    viewingNote,
    setViewingNote,
    deleteModal,
    setDeleteModal,
    saving,
    exporting,
    importing,
    sortBy,
    setSortBy,
    currentFilter,
    setCurrentFilter,
    importRef,
    visibleNotes,
    handleSave,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handlePin,
    handleExport,
    handleImport,
  } = useDashboardHandlers(
    notes,
    searchQuery,
    handleFetchNotes,
    handleEditNote,
    handleAddNote,
    handleRemoveNote
  );

  useEffect(() => {
    if (hasFetchedInitially.current) return;
    hasFetchedInitially.current = true;

    handleFetchNotes({
      page: 1,
      limit: 10,
      search: '',
      isInitial: true,
    });
  }, [handleFetchNotes]);

  useEffect(() => {
    if (!hasMountedSearch.current) {
      hasMountedSearch.current = true;
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      handleSearchQuery(searchInput);
      handleFetchNotes({
        page: 1,
        limit: 10,
        search: searchInput.trim(),
        isInitial: false,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, handleSearchQuery, handleFetchNotes]);

  useEffect(() => {
    if (!hasFetchedInitially.current) return;
    if (page === 1 && !searchQuery) return;

    handleFetchNotes({
      page,
      limit: 10,
      search: searchQuery || '',
      isInitial: false,
    });
  }, [page, searchQuery, handleFetchNotes]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-page-bg)' }}>
        <Navbar />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <NoteSkeletonGrid count={6} />
        </main>
      </div>
    );
  }

  let contentArea;

  if (notes.length === 0) {
    contentArea = (
      <EmptyNotesState
        searchInput={searchInput}
        onAddNote={() => {
          setEditingNote(null);
          setShowEditor(true);
        }}
      />
    );
  } else if (visibleNotes.length === 0) {
    contentArea = (
      <NoFilterMatchState
        onResetFilters={() => {
          setCurrentFilter('all');
          setSearchInput('');
          setSortBy('newest');
        }}
      />
    );
  } else {
    contentArea = (
      <NotesGridView
        visibleNotes={visibleNotes}
        isSearching={isSearching}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={setViewingNote}
        onPin={handlePin}
        onShare={handleToggleShare}
      />
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: 'var(--surface-page-bg)' }}>
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1">
        {/* Top Header & Global Actions */}
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                My Notes
              </h1>
              {notes.length > 0 && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {visibleNotes.length} {visibleNotes.length === 1 ? 'note' : 'notes'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Organize, search, and manage your notes across devices.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Export Notes */}
            <button
              onClick={handleExport}
              disabled={exporting || notes.length === 0}
              className="flex-1 sm:flex-none min-h-[44px] sm:min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
              title="Export all notes to JSON"
              aria-label="Export notes"
            >
              {exporting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              <span>Export</span>
            </button>

            {/* Import Notes */}
            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              className="flex-1 sm:flex-none min-h-[44px] sm:min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
              title="Import notes from JSON file"
              aria-label="Import notes"
            >
              {importing ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              <span>Import</span>
            </button>

            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
              aria-label="Upload JSON file"
            />

            {/* Add Note Button (Desktop & Mobile Full-Width in Toolbar) */}
            <button
              onClick={() => {
                setEditingNote(null);
                setShowEditor(true);
              }}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] px-4 sm:px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
              aria-label="Create note"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add Note</span>
            </button>
          </div>
        </header>

        {/* Search, Sort & Filter Toolbar */}
        <section className="mb-6 flex flex-col gap-3.5" aria-label="Search and filter notes">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, body, or tags..."
                className="w-full pl-10 pr-10 min-h-[44px] py-2 rounded-xl text-sm border focus:outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: searchInput ? 'var(--accent-primary)' : 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Search notes"
              />

              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="animate-spin h-4 w-4 text-cyan-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}

              {searchInput && !isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort notes"
                className="w-full sm:w-auto appearance-none pl-3.5 pr-9 min-h-[44px] py-2 rounded-xl text-sm font-medium border focus:outline-none transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <svg
                className="absolute right-3 w-4 h-4 pointer-events-none text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Filter Chips - Horizontal Scrolling on Mobile with Smooth Wrap on Tablet/Desktop */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCurrentFilter(filter.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 ${
                  currentFilter === filter.id
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white border-cyan-600 dark:border-cyan-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/5'
                }`}
                style={
                  currentFilter === filter.id
                    ? {}
                    : {
                        backgroundColor: 'var(--surface-elevated)',
                      }
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content Section */}
        {contentArea}
      </main>

      {/* Mobile Floating Action Button (FAB) for Instant Note Creation */}
      <button
        type="button"
        onClick={() => {
          setEditingNote(null);
          setShowEditor(true);
        }}
        aria-label="Create note floating button"
        className="
          fixed bottom-5 right-5 z-40 sm:hidden
          w-14 h-14 rounded-full
          bg-gradient-to-r from-cyan-600 to-teal-600 text-white
          shadow-lg shadow-cyan-600/30 flex items-center justify-center
          active:scale-95 transition-transform duration-150
        "
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {showEditor && (
        <NoteEditor
          key={editingNote?._id || 'new'}
          note={editingNote}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
          loading={saving}
        />
      )}

      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}

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
