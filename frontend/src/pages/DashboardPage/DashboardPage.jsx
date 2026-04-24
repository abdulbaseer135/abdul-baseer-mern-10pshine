import { useState, useEffect, useCallback } from 'react';
import useNotes from '../../hooks/useNotes';
import NoteCard from '../../components/notes/NoteCard/NoteCard';
import NoteEditor from '../../components/notes/NoteEditor/NoteEditor';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { NoteSkeletonGrid } from '../../components/common/Skeleton/NoteSkeleton';
import { truncateTitle } from '../../utils/helpers';

const DashboardPage = () => {
  const { notes, pagination, loading, handleFetchNotes, handleAddNote, handleEditNote, handleRemoveNote, searchQuery, handleSearchQuery } = useNotes();

  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null, noteTitle: '' });
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(() => {
    handleFetchNotes({ page, limit: 10, search: searchQuery });
  }, [page, searchQuery]); // eslint-disable-line

  useEffect(() => { loadNotes(); }, [loadNotes]);

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

  const handleEdit = (note) => { setEditingNote(note); setShowEditor(true); };

  const handleDeleteClick = (note) => {
    setDeleteModal({ isOpen: true, noteId: note._id, noteTitle: note.title });
  };

  const handleDeleteConfirm = async () => {
    await handleRemoveNote(deleteModal.noteId);
    setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
    loadNotes();
  };

  const handleSearch = (e) => {
    handleSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
            <p className="text-gray-500 text-sm">{pagination.total} note{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { setEditingNote(null); setShowEditor(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + New Note
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search notes..."
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Note Editor Modal */}
        {showEditor && (
          <NoteEditor
            key={editingNote?._id || 'new'}
            note={editingNote}
            onSave={handleSave}
            onClose={() => { setShowEditor(false); setEditingNote(null); }}
            loading={saving}
          />
        )}

        {/* Notes Grid */}
        {loading ? (
          <NoteSkeletonGrid count={6} />
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📝</p>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-4">Create your first note to get started</p>
            <button
              onClick={() => { setEditingNote(null); setShowEditor(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + New Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDeleteClick(note)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
            >← Prev</button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
            >Next →</button>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
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