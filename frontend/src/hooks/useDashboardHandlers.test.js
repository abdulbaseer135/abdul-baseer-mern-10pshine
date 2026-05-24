import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useDashboardHandlers from './useDashboardHandlers';
import authReducer from '../store/slices/authSlice';
import notesReducer from '../store/slices/notesSlice';
import themeReducer from '../store/slices/themeSlice';

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: notesReducer,
      theme: themeReducer,
    },
  });
};

const renderHookWithProvider = (hook) => {
  const store = createTestStore();
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  return renderHook(hook, { wrapper });
};

describe('useDashboardHandlers Hook', () => {
  const mockNotes = [{ _id: 'n1', title: 'Test', content: 'Content' }];
  const mockHandleFetchNotes = jest.fn();
  const mockHandleEditNote = jest.fn();
  const mockHandleAddNote = jest.fn();
  const mockHandleRemoveNote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize without errors', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current).toBeDefined();
    });

    it('should return editor state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current.showEditor).toBeDefined();
      expect(result.current.setShowEditor).toBeDefined();
    });
  });

  describe('Editor State Management', () => {
    it('should manage editor visibility', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.showEditor).toBe('boolean');
    });

    it('should manage editing note state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current.editingNote).toBeDefined();
    });
  });

  describe('Viewer State Management', () => {
    it('should manage viewing note state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current.viewingNote).toBeDefined();
    });

    it('should manage viewer visibility', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current.setViewingNote).toBeDefined();
    });
  });

  describe('Delete Modal State', () => {
    it('should manage delete modal state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current.deleteModal).toBeDefined();
    });

    it('should provide handle delete click', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.handleDeleteClick).toBe('function');
    });

    it('should provide handle delete confirm', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.handleDeleteConfirm).toBe('function');
    });
  });

  describe('Import/Export Handling', () => {
    it('should manage export loading state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.exporting).toBe('boolean');
    });

    it('should manage import loading state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.importing).toBe('boolean');
    });

    it('should provide handle export', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.handleExport).toBe('function');
    });

    it('should provide handle import', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.handleImport).toBe('function');
    });
  });

  describe('Filter and Sort', () => {
    it('should manage sort state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current.sortBy).toBeDefined();
      expect(result.current.setSortBy).toBeDefined();
    });

    it('should manage filter state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(result.current.currentFilter).toBeDefined();
      expect(result.current.setCurrentFilter).toBeDefined();
    });
  });

  describe('Note Operations', () => {
    it('should provide handle save', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.handleSave).toBe('function');
    });

    it('should provide handle edit', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.handleEdit).toBe('function');
    });

    it('should provide handle pin', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.handlePin).toBe('function');
    });
  });

  describe('Visible Notes', () => {
    it('should provide visible notes based on filters', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(Array.isArray(result.current.visibleNotes)).toBe(true);
    });
  });

  describe('Save State', () => {
    it('should manage saving state', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.saving).toBe('boolean');
    });
  });

  describe('Load Notes', () => {
    it('should provide load notes function', () => {
      const { result } = renderHookWithProvider(() =>
        useDashboardHandlers(mockNotes, '', mockHandleFetchNotes, mockHandleEditNote, mockHandleAddNote, mockHandleRemoveNote)
      );
      expect(typeof result.current.loadNotes).toBe('function');
    });
  });
});
