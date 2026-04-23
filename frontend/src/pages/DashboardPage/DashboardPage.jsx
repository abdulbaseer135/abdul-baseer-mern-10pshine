import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNotes } from '../../context/NotesContext';
import Navbar from '../../components/common/Navbar/Navbar';
import NoteCard from '../../components/notes/NoteCard/NoteCard';
import NoteEditor from '../../components/notes/NoteEditor/NoteEditor';
import Spinner from '../../components/common/Spinner/Spinner';

const DashboardPage = () => {
  const { notes, loading, error, fetchNotes, createNote, updateNote, deleteNote } = useNotes();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = async (data) => {
    try {
      setSaving(true);
      if (selectedNote) {
        await updateNote(selectedNote._id, data);
        toast.success('Note updated successfully!');
      } else {
        await createNote(data);
        toast.success('Note created successfully!');
      }
      setShowEditor(false);
      setSelectedNote(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(id);
      toast.success('Note deleted!');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setShowEditor(true);
  };

  const filteredNotes = notes.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Notes</h2>
            <p className="text-gray-500 text-sm mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
            </p>
          </div>
          <button
            onClick={handleNewNote}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition"
          >
            + New Note
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* States */}
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!loading && filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {search ? 'No notes match your search' : 'No notes yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {search ? 'Try a different keyword' : 'Click "+ New Note" to create your first note'}
            </p>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && filteredNotes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {showEditor && (
        <NoteEditor
          note={selectedNote}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setSelectedNote(null); }}
          loading={saving}
        />
      )}
    </div>
  );
};

export default DashboardPage;