import { configureStore } from '@reduxjs/toolkit';
import notesSlice, { 
  fetchNotes, addNote, editNote, removeNote,
  setSearchQuery, clearNotesError, resetNotes,
  noteCreatedFromSocket, noteUpdatedFromSocket, noteDeletedFromSocket
} from './notesSlice';
import * as notesService from '../../services/notes.service';

jest.mock('../../services/notes.service');

describe('Notes Slice', () => {
  let store;

  const mockNote = {
    _id: '1',
    title: 'Test Note',
    content: 'Test content',
    category: 'general',
    createdAt: '2026-05-24T00:00:00Z',
  };

  const mockNote2 = {
    _id: '2',
    title: 'Note 2',
    content: 'Content 2',
    category: 'task',
    createdAt: '2026-05-24T01:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        notes: notesSlice,
      },
    });
  });

  describe('Initial State', () => {
    it('should have initial state', () => {
      const state = store.getState().notes;
      expect(state.notes).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.searchQuery).toBe('');
      expect(state.isInitialLoading).toBe(false);
      expect(state.isSearching).toBe(false);
      expect(state.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('Sync Reducers', () => {
    it('setSearchQuery should update search query', () => {
      store.dispatch(setSearchQuery('test query'));
      expect(store.getState().notes.searchQuery).toBe('test query');
    });

    it('setSearchQuery should handle empty string', () => {
      store.dispatch(setSearchQuery(''));
      expect(store.getState().notes.searchQuery).toBe('');
    });

    it('clearNotesError should clear error', () => {
      const action = { type: clearNotesError.type };
      const state = notesSlice({ error: 'Some error' }, action);
      expect(state.error).toBeNull();
    });

    it('resetNotes should reset all note data', () => {
      const stateWithData = {
        notes: [mockNote],
        pagination: { page: 2, limit: 10, total: 100, totalPages: 10 },
        searchQuery: 'test',
        error: 'error',
      };
      const action = { type: resetNotes.type };
      const resetState = notesSlice(stateWithData, action);
      expect(resetState.notes).toEqual([]);
      expect(resetState.pagination.page).toBe(1);
      expect(resetState.pagination.total).toBe(0);
    });
  });

  describe('Socket Real-time Reducers', () => {
    it('noteCreatedFromSocket should add note to beginning if not exists', () => {
      const stateWithNotes = {
        notes: [mockNote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        loading: false,
        error: null,
      };
      const action = { type: noteCreatedFromSocket.type, payload: mockNote2 };
      const newState = notesSlice(stateWithNotes, action);
      expect(newState.notes[0]._id).toBe('2');
      expect(newState.notes[1]._id).toBe('1');
      expect(newState.pagination.total).toBe(2);
    });

    it('noteCreatedFromSocket should not add if already exists', () => {
      const stateWithNotes = {
        notes: [mockNote, mockNote2],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        loading: false,
        error: null,
      };
      const action = { type: noteCreatedFromSocket.type, payload: mockNote };
      const newState = notesSlice(stateWithNotes, action);
      expect(newState.notes).toHaveLength(2);
      expect(newState.pagination.total).toBe(2);
    });

    it('noteUpdatedFromSocket should update note in place', () => {
      const updatedNote = { ...mockNote, title: 'Updated Title' };
      const stateWithNotes = {
        notes: [mockNote, mockNote2],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        loading: false,
        error: null,
      };
      const action = { type: noteUpdatedFromSocket.type, payload: updatedNote };
      const newState = notesSlice(stateWithNotes, action);
      expect(newState.notes[0].title).toBe('Updated Title');
      expect(newState.notes).toHaveLength(2);
    });

    it('noteUpdatedFromSocket should not crash if note not found', () => {
      const stateWithNotes = {
        notes: [mockNote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        loading: false,
        error: null,
      };
      const nonExistentNote = { _id: 'nonexistent', title: 'X' };
      const action = { type: noteUpdatedFromSocket.type, payload: nonExistentNote };
      const newState = notesSlice(stateWithNotes, action);
      expect(newState.notes).toHaveLength(1);
    });

    it('noteDeletedFromSocket should remove note if exists', () => {
      const stateWithNotes = {
        notes: [mockNote, mockNote2],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        loading: false,
        error: null,
      };
      const action = { type: noteDeletedFromSocket.type, payload: '1' };
      const newState = notesSlice(stateWithNotes, action);
      expect(newState.notes).toHaveLength(1);
      expect(newState.notes[0]._id).toBe('2');
      expect(newState.pagination.total).toBe(1);
    });

    it('noteDeletedFromSocket should not crash if note not in state', () => {
      const stateWithNotes = {
        notes: [mockNote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        loading: false,
        error: null,
      };
      const action = { type: noteDeletedFromSocket.type, payload: 'nonexistent' };
      const newState = notesSlice(stateWithNotes, action);
      expect(newState.notes).toHaveLength(1);
      expect(newState.pagination.total).toBe(1);
    });

    it('noteDeletedFromSocket should not let total go below 0', () => {
      const stateWithNotes = {
        notes: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
        loading: false,
        error: null,
      };
      const action = { type: noteDeletedFromSocket.type, payload: '1' };
      const newState = notesSlice(stateWithNotes, action);
      expect(newState.pagination.total).toBe(0);
    });
  });

  describe('Async Thunk - Fetch Notes', () => {
    it('should handle fetchNotes pending - isInitial=true', () => {
      const action = {
        type: fetchNotes.pending.type,
        meta: { arg: { isInitial: true } },
      };
      const state = notesSlice(undefined, action);
      expect(state.isInitialLoading).toBe(true);
      expect(state.isSearching).toBe(false);
    });

    it('should handle fetchNotes pending - isInitial=false', () => {
      const action = {
        type: fetchNotes.pending.type,
        meta: { arg: { isInitial: false } },
      };
      const state = notesSlice(undefined, action);
      expect(state.isInitialLoading).toBe(false);
      expect(state.isSearching).toBe(true);
    });

    it('should handle fetchNotes fulfilled with nested data', () => {
      const payload = {
        data: {
          notes: [mockNote],
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      const action = { type: fetchNotes.fulfilled.type, payload };
      const state = notesSlice(undefined, action);
      expect(state.notes).toEqual([mockNote]);
      expect(state.pagination.total).toBe(1);
      expect(state.isInitialLoading).toBe(false);
      expect(state.isSearching).toBe(false);
    });

    it('should handle fetchNotes fulfilled with flat data', () => {
      const payload = {
        notes: [mockNote, mockNote2],
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      };
      const action = { type: fetchNotes.fulfilled.type, payload };
      const state = notesSlice(undefined, action);
      expect(state.notes).toHaveLength(2);
    });

    it('should handle fetchNotes rejected', () => {
      const action = {
        type: fetchNotes.rejected.type,
        payload: 'Failed to fetch',
      };
      const state = notesSlice(undefined, action);
      expect(state.error).toBe('Failed to fetch');
      expect(state.isInitialLoading).toBe(false);
      expect(state.isSearching).toBe(false);
    });
  });

  describe('Async Thunk - Add Note', () => {
    it('should handle addNote pending', () => {
      const action = { type: addNote.pending.type };
      const state = notesSlice(undefined, action);
      expect(state.loading).toBe(true);
    });

    it('should handle addNote fulfilled', () => {
      const payload = { data: mockNote };
      const action = { type: addNote.fulfilled.type, payload };
      const state = notesSlice(undefined, action);
      expect(state.notes[0]).toEqual(mockNote);
      expect(state.pagination.total).toBe(1);
      expect(state.loading).toBe(false);
    });

    it('should not add note if already exists', () => {
      const stateWithNote = {
        notes: [mockNote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        loading: false,
        error: null,
      };
      const action = { type: addNote.fulfilled.type, payload: { data: mockNote } };
      const state = notesSlice(stateWithNote, action);
      expect(state.notes).toHaveLength(1);
      expect(state.pagination.total).toBe(1);
    });

    it('should handle addNote rejected', () => {
      const action = { type: addNote.rejected.type, payload: 'Failed to add' };
      const state = notesSlice(undefined, action);
      expect(state.error).toBe('Failed to add');
      expect(state.loading).toBe(false);
    });
  });

  describe('Async Thunk - Edit Note', () => {
    it('should handle editNote pending', () => {
      const action = { type: editNote.pending.type };
      const state = notesSlice(undefined, action);
      expect(state.loading).toBe(true);
    });

    it('should handle editNote fulfilled', () => {
      const stateWithNote = {
        notes: [mockNote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        loading: true,
        error: null,
      };
      const updatedNote = { ...mockNote, title: 'Updated' };
      const action = { type: editNote.fulfilled.type, payload: { data: updatedNote } };
      const state = notesSlice(stateWithNote, action);
      expect(state.notes[0].title).toBe('Updated');
      expect(state.loading).toBe(false);
    });

    it('should not crash if editing non-existent note', () => {
      const stateWithNote = {
        notes: [mockNote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        loading: true,
        error: null,
      };
      const nonExistentNote = { _id: 'nonexistent', title: 'X' };
      const action = { type: editNote.fulfilled.type, payload: { data: nonExistentNote } };
      const state = notesSlice(stateWithNote, action);
      expect(state.notes).toHaveLength(1);
    });

    it('should handle editNote rejected', () => {
      const action = { type: editNote.rejected.type, payload: 'Not found' };
      const state = notesSlice(undefined, action);
      expect(state.error).toBe('Not found');
      expect(state.loading).toBe(false);
    });
  });

  describe('Async Thunk - Remove Note', () => {
    it('should handle removeNote pending', () => {
      const action = { type: removeNote.pending.type };
      const state = notesSlice(undefined, action);
      expect(state.loading).toBe(true);
    });

    it('should handle removeNote fulfilled', () => {
      const stateWithNotes = {
        notes: [mockNote, mockNote2],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        loading: true,
        error: null,
      };
      const action = { type: removeNote.fulfilled.type, payload: '1' };
      const state = notesSlice(stateWithNotes, action);
      expect(state.notes).toHaveLength(1);
      expect(state.notes[0]._id).toBe('2');
      expect(state.pagination.total).toBe(1);
      expect(state.loading).toBe(false);
    });

    it('should not crash if removing non-existent note', () => {
      const stateWithNote = {
        notes: [mockNote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        loading: true,
        error: null,
      };
      const action = { type: removeNote.fulfilled.type, payload: 'nonexistent' };
      const state = notesSlice(stateWithNote, action);
      expect(state.notes).toHaveLength(1);
      expect(state.pagination.total).toBe(1);
    });

    it('should handle removeNote rejected', () => {
      const action = { type: removeNote.rejected.type, payload: 'Cannot delete' };
      const state = notesSlice(undefined, action);
      expect(state.error).toBe('Cannot delete');
      expect(state.loading).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('dispatch setSearchQuery should update store', () => {
      store.dispatch(setSearchQuery('hello'));
      expect(store.getState().notes.searchQuery).toBe('hello');
    });

    it('dispatch resetNotes should clear notes', () => {
      store.dispatch(resetNotes());
      expect(store.getState().notes.notes).toEqual([]);
    });

    it('multiple state changes should work correctly', () => {
      store.dispatch(setSearchQuery('test'));
      store.dispatch(clearNotesError());
      const state = store.getState().notes;
      expect(state.searchQuery).toBe('test');
      expect(state.error).toBeNull();
    });
  });
});
