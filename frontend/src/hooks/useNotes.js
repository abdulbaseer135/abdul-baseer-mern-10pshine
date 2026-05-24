import { useCallback } from 'react';
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
import { toggleShareNoteService } from '../services/notes.service';
import useSocket from './useSocket';

const useNotes = () => {
  const dispatch = useDispatch();

  const {
    notes,
    pagination,
    isInitialLoading,
    isSearching,
    loading,
    error,
    searchQuery,
  } = useSelector((state) => state.notes);

  const { user } = useSelector((state) => state.auth);

  useSocket(user?._id, {
    onCreated: (note) => dispatch(noteCreatedFromSocket(note)),
    onUpdated: (note) => dispatch(noteUpdatedFromSocket(note)),
    onDeleted: (id) => dispatch(noteDeletedFromSocket(id)),
  });

  const handleFetchNotes = useCallback(
    async (params = {}) => {
      try {
        await dispatch(fetchNotes(params)).unwrap();
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Try again.');
      }
    },
    [dispatch]
  );

  const handleAddNote = useCallback(
    async (noteData) => {
      try {
        await dispatch(addNote(noteData)).unwrap();
        toast.success('Note created successfully!');
        return true;
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Try again.');
        return false;
      }
    },
    [dispatch]
  );

  const handleEditNote = useCallback(
    async (id, data) => {
      try {
        await dispatch(editNote({ id, data })).unwrap();
        toast.success('Note updated successfully!');
        return true;
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Try again.');
        return false;
      }
    },
    [dispatch]
  );

  const handleRemoveNote = useCallback(
    async (id) => {
      try {
        await dispatch(removeNote(id)).unwrap();
        toast.success('Note deleted successfully!');
        return true;
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Try again.');
        return false;
      }
    },
    [dispatch]
  );

  const handleToggleShare = useCallback(
    async (noteId) => {
      try {
        const res = await toggleShareNoteService(noteId);
        const note = res.data;

        dispatch(noteUpdatedFromSocket(note));

        if (note.isPublic) {
          toast.success('Note is now public!');
        } else {
          toast.info('Sharing disabled for this note.');
        }

        return note;
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Try again.');
        return null;
      }
    },
    [dispatch]
  );

  const handleSearchQuery = useCallback(
    (query) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const handleClearError = useCallback(
    () => dispatch(clearNotesError()),
    [dispatch]
  );

  const handleResetNotes = useCallback(
    () => dispatch(resetNotes()),
    [dispatch]
  );

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
    handleToggleShare,
    handleSearchQuery,
    handleClearError,
    handleResetNotes,
  };
};

export default useNotes;