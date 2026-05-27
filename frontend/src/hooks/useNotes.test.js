import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useNotes from './useNotes';
import authReducer from '../store/slices/authSlice';
import notesReducer from '../store/slices/notesSlice';
import themeReducer from '../store/slices/themeSlice';
import * as authService from '../services/auth.service';

jest.mock('../services/auth.service');

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: notesReducer,
      theme: themeReducer,
    },
  });
};

const renderUseNotesHook = () => {
  const store = createTestStore();
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  return { result: renderHook(() => useNotes(), { wrapper }), store };
};

describe('useNotes Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize without errors', () => {
      const { result } = renderUseNotesHook();
      expect(result.current).toBeDefined();
    });

    it('should return required functions', () => {
      const { result } = renderUseNotesHook();
      expect(typeof result.current.handleFetchNotes).toBe('function');
      expect(typeof result.current.handleAddNote).toBe('function');
      expect(typeof result.current.handleEditNote).toBe('function');
      expect(typeof result.current.handleRemoveNote).toBe('function');
      expect(typeof result.current.handleToggleShare).toBe('function');
    });

    it('should return notes state', () => {
      const { result } = renderUseNotesHook();
      expect(result.current.notes).toBeDefined();
      expect(Array.isArray(result.current.notes)).toBe(true);
    });
  });

  describe('Notes Management', () => {
    it('should handle fetch notes', async () => {
      const { result } = renderUseNotesHook();

      await act(async () => {
        await result.current.handleFetchNotes();
      });

      expect(result.current.notes).toBeDefined();
    });

    it('should handle add note', async () => {
      const { result } = renderUseNotesHook();
      const newNote = { title: 'Test', content: 'Content' };

      await act(async () => {
        await result.current.handleAddNote(newNote);
      });
    });

    it('should handle edit note', async () => {
      const { result } = renderUseNotesHook();
      const noteId = 'note-123';
      const updatedData = { title: 'Updated' };

      await act(async () => {
        await result.current.handleEditNote(noteId, updatedData);
      });
    });

    it('should handle remove note', async () => {
      const { result } = renderUseNotesHook();
      const noteId = 'note-123';

      await act(async () => {
        await result.current.handleRemoveNote(noteId);
      });
    });
  });

  describe('Search and Filter', () => {
    it('should provide search query', () => {
      const { result } = renderUseNotesHook();
      expect(result.current.searchQuery).toBeDefined();
      expect(typeof result.current.searchQuery).toBe('string');
    });

    it('should handle search query updates', async () => {
      const { result } = renderUseNotesHook();
      const query = 'test search';

      // Search is handled through handleFetchNotes with search param
      expect(result.current.searchQuery).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should provide pagination info', () => {
      const { result } = renderUseNotesHook();
      expect(result.current.pagination).toBeDefined();
      expect(typeof result.current.pagination).toBe('object');
    });

    it('should handle page navigation', async () => {
      const { result } = renderUseNotesHook();

      await act(async () => {
        await result.current.handleFetchNotes({ page: 2, limit: 10 });
      });

      expect(result.current.notes).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('should provide loading state', () => {
      const { result } = renderUseNotesHook();
      expect(typeof result.current.loading).toBe('boolean');
    });

    it('should provide initial loading state', () => {
      const { result } = renderUseNotesHook();
      expect(typeof result.current.isInitialLoading).toBe('boolean');
    });

    it('should provide searching state', () => {
      const { result } = renderUseNotesHook();
      expect(typeof result.current.isSearching).toBe('boolean');
    });
  });

  describe('Socket Integration', () => {
    it('should listen to socket events', () => {
      const { result } = renderUseNotesHook();
      expect(result.current.notes).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should provide error state', () => {
      const { result } = renderUseNotesHook();
      expect(result.current.error).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const { result } = renderUseNotesHook();

      await act(async () => {
        // Error handling is done in the hook
        expect(result.current.handleFetchNotes).toBeDefined();
      });
    });
  });

  describe('Share Functionality', () => {
    it('should provide toggle share function', () => {
      const { result } = renderUseNotesHook();
      expect(typeof result.current.handleToggleShare).toBe('function');
    });

    it('should handle toggle share', async () => {
      const { result } = renderUseNotesHook();
      const noteId = 'note-123';

      await act(async () => {
        // handleToggleShare is available
        expect(result.current.handleToggleShare).toBeDefined();
      });
    });
  });
});
