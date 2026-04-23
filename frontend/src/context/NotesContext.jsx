import { createContext, useContext, useState, useCallback } from 'react';
import {
  getNotesService,
  createNoteService,
  updateNoteService,
  deleteNoteService,
} from '../services/notes.service';

export const NotesContext = createContext(null);

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getNotesService();
      setNotes(res.data.notes || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = async (data) => {
    const res = await createNoteService(data);
    setNotes((prev) => [res.data.note || res.data, ...prev]);
    return res;
  };

  const updateNote = async (id, data) => {
    const res = await updateNoteService(id, data);
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? res.data.note || res.data : n))
    );
    return res;
  };

  const deleteNote = async (id) => {
    await deleteNoteService(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <NotesContext.Provider value={{ notes, loading, error, fetchNotes, createNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);