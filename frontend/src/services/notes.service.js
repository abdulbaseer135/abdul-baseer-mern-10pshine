import api from './api';

export const getNotesService = async (params = {}) => {
  const res = await api.get('/notes', { params });
  return res.data;
};

export const getNoteByIdService = async (id) => {
  const res = await api.get(`/notes/${id}`);
  return res.data;
};

export const createNoteService = async (data) => {
  const res = await api.post('/notes', data);
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

// ─── Export ────────────────────────────────────────────────────────────
export const exportNotesService = async () => {
  const res = await api.get('/notes/export', {
    responseType: 'blob',   // ✅ tells axios to treat response as binary file
  });

  // ✅ Create download link and trigger it programmatically
  const url      = window.URL.createObjectURL(new Blob([res.data]));
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = `notes_${new Date().toISOString().slice(0, 10)}.json`; // e.g. notes_2026-04-25.json
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);  // ✅ free memory
};

// ─── Import ────────────────────────────────────────────────────────────
export const importNotesService = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // ✅ Parse uploaded JSON file
        const parsed = JSON.parse(e.target.result);

        // ✅ Support both { notes: [...] } and plain array formats
        const notes = Array.isArray(parsed) ? parsed : parsed.notes;

        if (!notes || notes.length === 0) {
          return reject(new Error('No valid notes found in file'));
        }

        // ✅ Send parsed notes array to backend
        const res = await api.post('/notes/import', { notes });
        resolve(res.data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);  // ✅ read file as text string
  });
};