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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <NoteSkeletonGrid count={6} />
        </div>
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-page-bg)' }}>
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-7 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-5">
          <div className="flex-1">
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              My Notes
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-medium">{pagination.total}</span> note
              {pagination.total === 1 ? '' : 's'}
              <span className="mx-1.5">•</span>
              <span className="font-medium">
                {currentFilter === 'all'
                  ? 'All notes'
                  : FILTER_OPTIONS.find((f) => f.id === currentFilter)?.label}
              </span>
            </p>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            <button
              onClick={handleExport}
              disabled={exporting || notes.length === 0}
              title="Export all notes to JSON"
              className="px-3 py-1.5 rounded-lg font-medium text-xs border transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-tertiary)',
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v4a2 2 0 002 2h12a2 2 0 002-2v-4m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              title="Import notes from JSON"
              className="px-3 py-1.5 rounded-lg font-medium text-xs border transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-tertiary)',
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v6" />
                </svg>
              )}
              <span className="hidden sm:inline">Import</span>
            </button>

            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />

            <button
              onClick={() => {
                setEditingNote(null);
                setShowEditor(true);
              }}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:active:bg-indigo-700 text-white transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5v14m7-7H5" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" />
              </svg>
              <span>Add Note</span>
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <div className="relative w-full sm:flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-10 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder:text-text-muted"
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: searchInput ? 'var(--border-strong)' : 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />

              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}

              {searchInput && !isSearching && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            <div className="relative flex items-center gap-1.5 flex-shrink-0">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-3 py-2 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 cursor-pointer pr-8"
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
                className="absolute right-2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 sm:overflow-visible sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setCurrentFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 whitespace-nowrap flex-shrink-0 sm:flex-shrink ${
                  currentFilter === filter.id
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-sm hover:shadow-md'
                    : ''
                }`}
                style={
                  currentFilter === filter.id
                    ? {}
                    : {
                        backgroundColor: 'transparent',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-tertiary)',
                      }
                }
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

        {contentArea}
      </div>

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