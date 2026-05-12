import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchNotes,
  addNote,
  editNote,
  removeNote,
  setSearchQuery,
  clearNotesError,
  resetNotes,
  noteCreatedFromSocket,
  noteUpdatedFromSocket,
  noteDeletedFromSocket,
} from '../store/slices/notesSlice';
import { toggleShareNoteService } from '../services/notes.service'; // ✅
import useSocket from './useSocket';


const useNotes = () => {
  const dispatch = useDispatch();
  const { notes, pagination, isInitialLoading, isSearching, loading, error, searchQuery } =
    useSelector((state) => state.notes);
  const { user } = useSelector((state) => state.auth);


  // ✅ Real-time socket listeners
  useSocket(user?._id, {
    onCreated: (note) => dispatch(noteCreatedFromSocket(note)),
    onUpdated: (note) => dispatch(noteUpdatedFromSocket(note)),
    onDeleted: (id)   => dispatch(noteDeletedFromSocket(id)),
  });


  const handleFetchNotes = async (params = {}) => {
    const result = await dispatch(fetchNotes(params));
    if (fetchNotes.rejected.match(result)) {
      toast.error('Something went wrong. Try again.');
    }
  };


  const handleAddNote = async (noteData) => {
    const result = await dispatch(addNote(noteData));
    if (addNote.fulfilled.match(result)) {
      toast.success('Note created successfully!');
      return true;
    } else {
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };


  const handleEditNote = async (id, data) => {
    const result = await dispatch(editNote({ id, data }));
    if (editNote.fulfilled.match(result)) {
      toast.success('Note updated successfully!');
      return true;
    } else {
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };


  const handleRemoveNote = async (id) => {
    const result = await dispatch(removeNote(id));
    if (removeNote.fulfilled.match(result)) {
      toast.success('Note deleted successfully!');
      return true;
    } else {
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };


  // ─── Toggle Share ─────────────────────────────────────────────────────
  const handleToggleShare = async (noteId) => {
    try {
      const res  = await toggleShareNoteService(noteId);
      const note = res.data;

      // ✅ Update this note in Redux state without a full refetch
      dispatch(noteUpdatedFromSocket(note));

      if (note.isPublic) {
        toast.success('Note is now public!');
      } else {
        toast.info('Sharing disabled for this note.');
      }

      return note; // ✅ return updated note so NoteCard can read shareToken
    } catch {
      toast.error('Something went wrong. Try again.');
      return null;
    }
  };


  const handleSearchQuery = (query) => dispatch(setSearchQuery(query));
  const handleClearError  = () => dispatch(clearNotesError());
  const handleResetNotes  = () => dispatch(resetNotes());


  return {
    notes,
    pagination,
    isInitialLoading,
    isSearching,
    loading,
    error,
    searchQuery,
    handleFetchNotes,
    handleAddNote,
    handleEditNote,
    handleRemoveNote,
    handleToggleShare,  // ✅
    handleSearchQuery,
    handleClearError,
    handleResetNotes,
  };
};


export default useNotes;