import api from './api';

export const getNotesService = async (params = {}) => {
  const res = await api.get('/notes', {
    params,
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
  
  console.log('[DEBUG getNotesService] response:', res.data);
  
  // ✅ Ensure we always return the data property
  return res.data;
};

export const getNoteByIdService = async (id) => {
  const res = await api.get(`/notes/${id}`);
  return res.data;
};

export const createNoteService = async (data) => {
  console.log('[DEBUG createNoteService] sending:', data);
  const res = await api.post('/notes', data);
  console.log('[DEBUG createNoteService] response:', res.data);
  return res.data;
};

export const updateNoteService = async (id, data) => {
  const res = await api.put(`/notes/${id}`, data);
  return res.data;
};

export const deleteNoteService = async (id) => {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
};

export const exportNotesService = async () => {
  const res = await api.get('/notes/export', {
    responseType: 'blob',
  });

  const url = globalThis.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `notes_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.URL.revokeObjectURL(url);
};

export const importNotesService = async (file) => {
  let text;

  try {
    text = await file.text();
  } catch (err) {
    console.error('[DEBUG importNotesService] Failed to read file:', err);
    throw new Error('Failed to read file');
  }

  try {
    const parsed = JSON.parse(text);
    const notes = Array.isArray(parsed) ? parsed : parsed.notes;

    if (!notes || notes.length === 0) {
      throw new Error('No valid notes found in file');
    }

    console.log('[DEBUG importNotesService] sending', notes.length, 'notes to backend');

    const res = await api.post('/notes/import', { notes });
    
    console.log('[DEBUG importNotesService] response:', res.data);
    
    return res.data;
  } catch (err) {
    console.error('[DEBUG importNotesService] Error:', err.message);

    if (err.message === 'No valid notes found in file') {
      throw err;
    }

    if (err.response || err.message === 'Import failed') {
      throw err;
    }

    throw new Error('Invalid JSON file');
  }
};

export const toggleShareNoteService = async (noteId) => {
  const res = await api.patch(`/notes/${noteId}/share`);
  return res.data;
};

export const getSharedNoteService = async (token) => {
  const res = await api.get(`/notes/shared/${token}`);
  return res.data;
};

export const togglePinNoteService = async (noteId) => {
  const res = await api.patch(`/notes/${noteId}/pin`);
  return res.data;
};