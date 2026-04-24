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