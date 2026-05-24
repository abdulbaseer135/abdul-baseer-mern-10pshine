import { toast } from 'react-toastify';
import { performExport, performImport } from './noteImportExportUtils';
import * as notesService from '../services/notes.service';

jest.mock('react-toastify');
jest.mock('../services/notes.service');

describe('Note Import/Export Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('performExport', () => {
    it('should call exportNotesService and show success toast', async () => {
      notesService.exportNotesService.mockResolvedValue({ data: {} });

      const result = await performExport();

      expect(notesService.exportNotesService).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Notes exported successfully!');
      expect(result).toBe(true);
    });

    it('should return false and show error toast when export fails', async () => {
      const error = new Error('Export failed');
      notesService.exportNotesService.mockRejectedValue(error);

      const result = await performExport();

      expect(toast.error).toHaveBeenCalledWith('Something went wrong. Try again.');
      expect(result).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      notesService.exportNotesService.mockRejectedValue(
        new Error('Network timeout')
      );

      const result = await performExport();

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalled();
    });

    it('should not log error to console in test (but captures console output)', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      notesService.exportNotesService.mockRejectedValue(new Error('Test error'));

      await performExport();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('performImport', () => {
    const mockFile = new File(['content'], 'notes.json', { type: 'application/json' });
    const onFetchMock = jest.fn();
    const searchQuery = 'test';

    it('should import notes successfully with both imported and skipped counts', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 5,
          skippedCount: 2,
        },
      });

      const result = await performImport(mockFile, onFetchMock, searchQuery);

      expect(notesService.importNotesService).toHaveBeenCalledWith(mockFile);
      expect(toast.success).toHaveBeenCalledWith(
        '5 notes imported. 2 duplicates skipped.'
      );
      expect(onFetchMock).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: searchQuery,
      });
      expect(result).toBe(true);
    });

    it('should show singular "note" when importedCount is 1', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 1,
          skippedCount: 0,
        },
      });

      const result = await performImport(mockFile, onFetchMock, searchQuery);

      expect(toast.success).toHaveBeenCalledWith('1 note imported successfully!');
      expect(result).toBe(true);
    });

    it('should show plural "notes" when importedCount > 1', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 3,
          skippedCount: 0,
        },
      });

      await performImport(mockFile, onFetchMock, searchQuery);

      expect(toast.success).toHaveBeenCalledWith('3 notes imported successfully!');
    });

    it('should show warning when all notes are duplicates', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 0,
          skippedCount: 3,
        },
      });

      const result = await performImport(mockFile, onFetchMock, searchQuery);

      expect(toast.warning).toHaveBeenCalledWith(
        'All 3 note(s) were duplicates and skipped.'
      );
      expect(onFetchMock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle singular duplicate', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 0,
          skippedCount: 1,
        },
      });

      await performImport(mockFile, onFetchMock, searchQuery);

      expect(toast.warning).toHaveBeenCalledWith(
        'All 1 note(s) were duplicates and skipped.'
      );
    });

    it('should handle response with data field nested', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 2,
          skippedCount: 1,
        },
      });

      const result = await performImport(mockFile, onFetchMock, searchQuery);

      expect(result).toBe(true);
      expect(onFetchMock).toHaveBeenCalled();
    });

    it('should handle response without data field (direct response)', async () => {
      notesService.importNotesService.mockResolvedValue({
        importedCount: 2,
        skippedCount: 1,
      });

      const result = await performImport(mockFile, onFetchMock, searchQuery);

      expect(result).toBe(true);
      expect(onFetchMock).toHaveBeenCalled();
    });

    it('should default to 0 for missing count fields', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {},
      });

      await performImport(mockFile, onFetchMock, searchQuery);

      // Should not throw, defaults to 0 for both
      expect(toast.warning).toHaveBeenCalledWith(
        'All 0 note(s) were duplicates and skipped.'
      );
    });

    it('should call onFetch with correct pagination params', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 1,
          skippedCount: 0,
        },
      });

      await performImport(mockFile, onFetchMock, 'my-search');

      expect(onFetchMock).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'my-search',
      });
    });

    it('should return false and show error message on import failure', async () => {
      const errorMsg = 'File format invalid';
      notesService.importNotesService.mockRejectedValue(
        new Error(errorMsg)
      );

      const result = await performImport(mockFile, onFetchMock, searchQuery);

      expect(toast.error).toHaveBeenCalledWith(errorMsg);
      expect(result).toBe(false);
    });

    it('should show fallback error message when error has no message', async () => {
      notesService.importNotesService.mockRejectedValue({});

      const result = await performImport(mockFile, onFetchMock, searchQuery);

      expect(toast.error).toHaveBeenCalledWith('Something went wrong. Try again.');
      expect(result).toBe(false);
    });

    it('should handle undefined onFetch gracefully', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 1,
          skippedCount: 0,
        },
      });

      const result = await performImport(mockFile, undefined, searchQuery);

      expect(result).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle null onFetch gracefully', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 1,
          skippedCount: 0,
        },
      });

      const result = await performImport(mockFile, null, searchQuery);

      expect(result).toBe(true);
    });

    it('should handle both importedCount and skippedCount with singular/plural combinations', async () => {
      notesService.importNotesService.mockResolvedValue({
        data: {
          importedCount: 1,
          skippedCount: 5,
        },
      });

      await performImport(mockFile, onFetchMock, searchQuery);

      expect(toast.success).toHaveBeenCalledWith(
        '1 note imported. 5 duplicates skipped.'
      );
    });
  });
});
