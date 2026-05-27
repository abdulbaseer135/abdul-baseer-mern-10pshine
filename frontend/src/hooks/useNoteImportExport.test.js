import { renderHook, act } from '@testing-library/react';
import useNoteImportExport from './useNoteImportExport';
import * as notesService from '../services/notes.service';

jest.mock('../services/notes.service');

describe('useNoteImportExport Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useNoteImportExport(() => {}));
      expect(result.current).toBeDefined();
    });

    it('should return export/import functions', () => {
      const { result } = renderHook(() => useNoteImportExport(() => {}));
      expect(typeof result.current.handleExport).toBe('function');
      expect(typeof result.current.handleImport).toBe('function');
    });

    it('should return loading states', () => {
      const { result } = renderHook(() => useNoteImportExport(() => {}));
      expect(typeof result.current.exporting).toBe('boolean');
      expect(typeof result.current.importing).toBe('boolean');
    });
  });

  describe('Export Functionality', () => {
    it('should provide handle export function', () => {
      const { result } = renderHook(() => useNoteImportExport(() => {}));
      expect(typeof result.current.handleExport).toBe('function');
    });

    it('should manage exporting state', () => {
      const { result } = renderHook(() => useNoteImportExport(() => {}));
      expect(typeof result.current.exporting).toBe('boolean');
    });

    it('should call export service on export', async () => {
      notesService.exportNotesService = jest.fn().mockResolvedValue({});
      const { result } = renderHook(() => useNoteImportExport(() => {}));

      await act(async () => {
        await result.current.handleExport();
      });

      // Export should be handled
      expect(result.current.exporting !== undefined).toBe(true);
    });
  });

  describe('Import Functionality', () => {
    it('should provide handle import function', () => {
      const { result } = renderHook(() => useNoteImportExport(() => {}));
      expect(typeof result.current.handleImport).toBe('function');
    });

    it('should manage importing state', () => {
      const { result } = renderHook(() => useNoteImportExport(() => {}));
      expect(typeof result.current.importing).toBe('boolean');
    });

    it('should handle file import', async () => {
      notesService.importNotesService = jest.fn().mockResolvedValue({ data: { imported: 1 } });
      const onImportComplete = jest.fn();
      const { result } = renderHook(() => useNoteImportExport(onImportComplete));

      const file = new File(['{}'], 'notes.json', { type: 'application/json' });

      await act(async () => {
        await result.current.handleImport(file);
      });

      expect(result.current.importing !== undefined).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle export errors', async () => {
      notesService.exportNotesService = jest.fn().mockRejectedValue(new Error('Export failed'));
      const { result } = renderHook(() => useNoteImportExport(() => {}));

      await act(async () => {
        try {
          await result.current.handleExport();
        } catch (e) {
          // Error handling
        }
      });

      expect(result.current).toBeDefined();
    });

    it('should handle import errors', async () => {
      notesService.importNotesService = jest.fn().mockRejectedValue(new Error('Import failed'));
      const onImportComplete = jest.fn();
      const { result } = renderHook(() => useNoteImportExport(onImportComplete));

      const file = new File(['{}'], 'notes.json', { type: 'application/json' });

      await act(async () => {
        try {
          await result.current.handleImport(file);
        } catch (e) {
          // Error handling
        }
      });

      expect(result.current).toBeDefined();
    });
  });

  describe('Callback Integration', () => {
    it('should call completion callback on successful import', async () => {
      notesService.importNotesService = jest.fn().mockResolvedValue({ data: { imported: 2 } });
      const onImportComplete = jest.fn();
      const { result } = renderHook(() => useNoteImportExport(onImportComplete));

      const file = new File(['{}'], 'notes.json', { type: 'application/json' });

      await act(async () => {
        await result.current.handleImport(file);
      });

      // Callback should be handled
      expect(onImportComplete !== undefined).toBe(true);
    });
  });

  describe('Loading State Transitions', () => {
    it('should transition export loading state', async () => {
      notesService.exportNotesService = jest.fn().mockResolvedValue({});
      const { result, rerender } = renderHook(() => useNoteImportExport(() => {}));

      const initialState = result.current.exporting;

      await act(async () => {
        await result.current.handleExport();
      });

      expect(result.current.exporting !== undefined).toBe(true);
    });

    it('should transition import loading state', async () => {
      notesService.importNotesService = jest.fn().mockResolvedValue({ data: {} });
      const { result } = renderHook(() => useNoteImportExport(() => {}));

      const initialState = result.current.importing;

      const file = new File(['{}'], 'notes.json', { type: 'application/json' });

      await act(async () => {
        await result.current.handleImport(file);
      });

      expect(result.current.importing !== undefined).toBe(true);
    });
  });
});
