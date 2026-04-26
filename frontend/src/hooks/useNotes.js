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
  noteCreatedFromSocket,   // ✅ new action
  noteUpdatedFromSocket,   // ✅ new action
  noteDeletedFromSocket,   // ✅ new action
} from '../store/slices/notesSlice';
import useSocket from './useSocket';

const useNotes = () => {
  const dispatch = useDispatch();
  const { notes, pagination, isInitialLoading, isSearching, loading, error, searchQuery } =
    useSelector((state) => state.notes);
  const { user } = useSelector((state) => state.auth);

  // ✅ Real-time socket listeners — update Redux state instantly
  useSocket(user?._id, {
    onCreated: (note) => dispatch(noteCreatedFromSocket(note)),
    onUpdated: (note) => dispatch(noteUpdatedFromSocket(note)),
    onDeleted: (id)   => dispatch(noteDeletedFromSocket(id)),
  });

  const handleFetchNotes = async (params = {}) => {
    const result = await dispatch(fetchNotes(params));
    if (fetchNotes.rejected.match(result)) {
      toast.error(result.payload || 'Failed to load notes');
    }
  };

  const handleAddNote = async (noteData) => {
    const result = await dispatch(addNote(noteData));
    if (addNote.fulfilled.match(result)) {
      toast.success('Note created!');
      return true;
    } else {
      toast.error(result.payload || 'Failed to create note');
      return false;
    }
  };

  const handleEditNote = async (id, data) => {
    const result = await dispatch(editNote({ id, data }));
    if (editNote.fulfilled.match(result)) {
      toast.success('Note updated!');
      return true;
    } else {
      toast.error(result.payload || 'Failed to update note');
      return false;
    }
  };

  const handleRemoveNote = async (id) => {
    const result = await dispatch(removeNote(id));
    if (removeNote.fulfilled.match(result)) {
      toast.success('Note deleted!');
      return true;
    } else {
      toast.error(result.payload || 'Failed to delete note');
      return false;
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
    handleSearchQuery,
    handleClearError,
    handleResetNotes,
  };
};

export default useNotes;