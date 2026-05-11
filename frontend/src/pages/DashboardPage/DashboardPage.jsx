import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import useNotes from '../../hooks/useNotes';
import NoteCard from '../../components/notes/NoteCard/NoteCard';
import NoteEditor from '../../components/notes/NoteEditor/NoteEditor';
import NoteViewer from '../../components/notes/NoteViewer/NoteViewer';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { NoteSkeletonGrid } from '../../components/common/Skeleton/NoteSkeleton';
import { truncateTitle } from '../../utils/helpers';
import { exportNotesService, importNotesService } from '../../services/notes.service';


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
    handleToggleShare,  // ✅
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
  const [sortOrder, setSortOrder] = useState('');

  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const isFirstLoad = useRef(true);
  const importRef   = useRef(null);


  // ─── Initial load ──────────────────────────────────────────────────
  useEffect(() => {
    handleFetchNotes({ page: 1, limit: 10, search: '', isInitial: true });
  }, []); // eslint-disable-line


  // ─── Debounce search ───────────────────────────────────────────────
  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    const timer = setTimeout(() => {
      handleSearchQuery(searchInput);
      setPage(1);
      handleFetchNotes({ page: 1, limit: 10, search: searchInput });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line


  // ─── Page change ───────────────────────────────────────────────────
  const loadNotes = useCallback(() => {
    handleFetchNotes({ page, limit: 10, search: searchQuery });
  }, [page, searchQuery]); // eslint-disable-line

  useEffect(() => {
    if (page === 1 && !searchQuery) return;
    loadNotes();
  }, [page]); // eslint-disable-line


  // ─── Sort notes based on selected order ──────────────────────────
  const sortedNotes = [...notes].sort((a, b) => {
    switch(sortOrder) {
      case '':
        return 0; // no sorting - original API order
      case 'newest':
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      case 'oldest':
        return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
      case 'az':
        return (a.title || '').localeCompare(b.title || '');
      case 'za':
        return (b.title || '').localeCompare(a.title || '');
      default:
        return 0;
    }
  });


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
      const count = res?.data?.imported ?? 0;
      toast.success(`${count} note${count !== 1 ? 's' : ''} imported successfully!`);
      handleFetchNotes({ page: 1, limit: 10, search: searchQuery });
    } catch (err) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setImporting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              My Notes
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {pagination.total} note{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* ─── Action Buttons ──────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exporting || notes.length === 0}
              className="
                px-4 py-2 rounded-lg font-medium
                border border-gray-300 dark:border-gray-700
                text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-40
                flex items-center gap-1
                transition-colors duration-200
              "
            >
              {exporting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : '⬇️'}
              Export
            </button>

            {/* Import */}
            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              className="
                px-4 py-2 rounded-lg font-medium
                border border-gray-300 dark:border-gray-700
                text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-40
                flex items-center gap-1
                transition-colors duration-200
              "
            >
              {importing ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : '⬆️'}
              Import
            </button>

            {/* Hidden file input */}
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />

            {/* New Note */}
            <button
              onClick={() => { setEditingNote(null); setShowEditor(true); }}
              className="
                px-4 py-2 rounded-lg font-medium
                bg-blue-600 dark:bg-blue-500
                hover:bg-blue-700 dark:hover:bg-blue-600
                text-white transition-colors duration-200
              "
            >
              + New Note
            </button>
          </div>
        </div>

        {/* ─── Search + Sort ───────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          
          {/* Search Input — Half Width */}
          <div className="relative w-1/2 max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search notes..."
              className="
                w-full px-4 py-2 rounded-lg
                border border-gray-300 dark:border-white/10
                bg-white dark:bg-[#141414]
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-600
                focus:outline-none focus:ring-2
                focus:ring-blue-500 dark:focus:ring-blue-400
                transition-colors duration-200
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

          {/* Sort Dropdown with Label */}
          <div className="relative ml-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="
                appearance-none pl-4 pr-9 py-2 rounded-lg
                border border-gray-300 dark:border-white/10
                bg-white dark:bg-[#141414]
                text-gray-700 dark:text-gray-300
                text-sm font-medium
                focus:outline-none focus:ring-2
                focus:ring-blue-500 dark:focus:ring-blue-400
                transition-colors duration-200
                cursor-pointer
              "
            >
              <option value="" className="text-gray-400">Select</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
            {/* Chevron Icon */}
            <svg
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                w-4 h-4 text-gray-600 dark:text-gray-400
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
                px-3 py-2 rounded-lg text-sm font-medium
                text-gray-600 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-gray-100
                hover:bg-gray-100 dark:hover:bg-white/[0.05]
                border border-gray-200 dark:border-white/[0.08]
                transition-colors duration-200
              "
            >
              Clear
            </button>
          )}
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
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}>
            {sortedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDeleteClick(note)}
                onShare={handleToggleShare}  // ✅
                onView={() => setViewingNote(note)}
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