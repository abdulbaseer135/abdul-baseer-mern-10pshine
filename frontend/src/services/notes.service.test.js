import {
  getNotesService,
  getNoteByIdService,
  createNoteService,
  updateNoteService,
  deleteNoteService,
  exportNotesService,
  importNotesService,
} from './notes.service';
import api from './api';

jest.mock('./api');

describe('Notes Service', () => {
  const mockNote = {
    _id: '1',
    title: 'Test Note',
    content: 'Test content',
    category: 'general',
  };

  const mockNotes = [mockNote, { _id: '2', title: 'Note 2', content: 'Content 2' }];

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    document.body.innerHTML = '';
    // Mock document.body.appendChild to handle mock objects
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
  });

  describe('getNotesService', () => {
    it('should fetch notes with default params', async () => {
      api.get.mockResolvedValue({ data: mockNotes });

      const result = await getNotesService();

      expect(api.get).toHaveBeenCalledWith('/notes', { params: {} });
      expect(result).toEqual(mockNotes);
    });

    it('should fetch notes with custom params', async () => {
      const params = { page: 2, search: 'test' };
      api.get.mockResolvedValue({ data: mockNotes });

      const result = await getNotesService(params);

      expect(api.get).toHaveBeenCalledWith('/notes', { params });
      expect(result).toEqual(mockNotes);
    });

    it('should throw error if request fails', async () => {
      const error = new Error('Network error');
      api.get.mockRejectedValue(error);

      await expect(getNotesService()).rejects.toThrow('Network error');
    });

    it('should handle pagination params', async () => {
      const params = { page: 1, limit: 10 };
      api.get.mockResolvedValue({ data: mockNotes });

      await getNotesService(params);

      expect(api.get).toHaveBeenCalledWith('/notes', { params });
    });
  });

  describe('getNoteByIdService', () => {
    it('should fetch single note by id', async () => {
      api.get.mockResolvedValue({ data: mockNote });

      const result = await getNoteByIdService('1');

      expect(api.get).toHaveBeenCalledWith('/notes/1');
      expect(result).toEqual(mockNote);
    });

    it('should handle 404 error', async () => {
      const error = new Error('Not found');
      error.response = { status: 404 };
      api.get.mockRejectedValue(error);

      await expect(getNoteByIdService('invalid')).rejects.toThrow();
    });

    it('should pass correct id to api', async () => {
      api.get.mockResolvedValue({ data: mockNote });

      await getNoteByIdService('abc123');

      expect(api.get).toHaveBeenCalledWith('/notes/abc123');
    });
  });

  describe('createNoteService', () => {
    it('should create new note', async () => {
      const noteData = { title: 'New', content: 'Content' };
      api.post.mockResolvedValue({ data: mockNote });

      const result = await createNoteService(noteData);

      expect(api.post).toHaveBeenCalledWith('/notes', noteData);
      expect(result).toEqual(mockNote);
    });

    it('should handle validation error', async () => {
      const error = new Error('Validation failed');
      api.post.mockRejectedValue(error);

      await expect(createNoteService({})).rejects.toThrow('Validation failed');
    });

    it('should pass complete note data', async () => {
      const noteData = {
        title: 'Test',
        content: 'Content',
        category: 'task',
        taskStatus: 'todo',
      };
      api.post.mockResolvedValue({ data: mockNote });

      await createNoteService(noteData);

      expect(api.post).toHaveBeenCalledWith('/notes', noteData);
    });
  });

  describe('updateNoteService', () => {
    it('should update existing note', async () => {
      const updateData = { title: 'Updated' };
      const updatedNote = { ...mockNote, ...updateData };
      api.put.mockResolvedValue({ data: updatedNote });

      const result = await updateNoteService('1', updateData);

      expect(api.put).toHaveBeenCalledWith('/notes/1', updateData);
      expect(result).toEqual(updatedNote);
    });

    it('should handle partial updates', async () => {
      api.put.mockResolvedValue({ data: mockNote });

      await updateNoteService('1', { title: 'New Title' });

      expect(api.put).toHaveBeenCalledWith('/notes/1', { title: 'New Title' });
    });

    it('should throw error if note not found', async () => {
      const error = new Error('Not found');
      api.put.mockRejectedValue(error);

      await expect(updateNoteService('invalid', {})).rejects.toThrow('Not found');
    });

    it('should pass correct id and data', async () => {
      api.put.mockResolvedValue({ data: mockNote });

      await updateNoteService('abc123', { category: 'idea' });

      expect(api.put).toHaveBeenCalledWith('/notes/abc123', { category: 'idea' });
    });
  });

  describe('deleteNoteService', () => {
    it('should delete note by id', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await deleteNoteService('1');

      expect(api.delete).toHaveBeenCalledWith('/notes/1');
      expect(result).toEqual({ success: true });
    });

    it('should throw error if note not found', async () => {
      const error = new Error('Not found');
      api.delete.mockRejectedValue(error);

      await expect(deleteNoteService('invalid')).rejects.toThrow('Not found');
    });

    it('should pass correct id', async () => {
      api.delete.mockResolvedValue({ data: {} });

      await deleteNoteService('xyz789');

      expect(api.delete).toHaveBeenCalledWith('/notes/xyz789');
    });
  });

  describe('exportNotesService', () => {
    it('should export notes as JSON file', async () => {
      const mockBlob = new Blob(['test data']);
      api.get.mockResolvedValue({ data: mockBlob });

      await exportNotesService();

      expect(api.get).toHaveBeenCalledWith('/notes/export', {
        responseType: 'blob',
      });
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should create download link with correct attributes', async () => {
      const mockBlob = new Blob(['data']);
      const link = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(link);
      
      api.get.mockResolvedValue({ data: mockBlob });

      await exportNotesService();

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(link.download).toMatch(/^notes_\d{4}-\d{2}-\d{2}\.json$/);
      expect(link.href).toEqual('blob:mock-url');
      expect(link.click).toHaveBeenCalled();
      expect(link.remove).toHaveBeenCalled();
      
      createElementSpy.mockRestore();
    });

    it('should trigger download', async () => {
      const mockBlob = new Blob(['data']);
      const link = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);
      
      api.get.mockResolvedValue({ data: mockBlob });

      await exportNotesService();

      expect(link.click).toHaveBeenCalled();
    });

    it('should remove link after download', async () => {
      const mockBlob = new Blob(['data']);
      const link = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);
      
      api.get.mockResolvedValue({ data: mockBlob });

      await exportNotesService();

      expect(link.remove).toHaveBeenCalled();
    });

    it('should revoke object URL', async () => {
      const mockBlob = new Blob(['data']);
      const link = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);
      
      api.get.mockResolvedValue({ data: mockBlob });

      await exportNotesService();

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should throw error if export fails', async () => {
      const error = new Error('Export failed');
      api.get.mockRejectedValue(error);

      await expect(exportNotesService()).rejects.toThrow('Export failed');
    });

    it('should set correct filename with current date', async () => {
      const mockBlob = new Blob(['data']);
      const link = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);
      
      api.get.mockResolvedValue({ data: mockBlob });

      await exportNotesService();

      const dateRegex = /notes_\d{4}-\d{2}-\d{2}\.json/;
      expect(link.download).toMatch(dateRegex);
    });
  });

  describe('importNotesService', () => {
    it('should import notes from JSON file', async () => {
      const fileContent = JSON.stringify(mockNotes);
      const mockFile = new File([fileContent], 'notes.json', { type: 'application/json' });
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      api.post.mockResolvedValue({
        data: { importedCount: 2, skippedCount: 0 },
      });

      const result = await importNotesService(mockFile);

      expect(result.importedCount).toBe(2);
    });

    it('should handle array of notes directly', async () => {
      const fileContent = JSON.stringify(mockNotes);
      const mockFile = new File([fileContent], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      api.post.mockResolvedValue({ data: { importedCount: 2 } });

      await importNotesService(mockFile);

      expect(api.post).toHaveBeenCalledWith('/notes/import', { notes: mockNotes });
    });

    it('should handle nested notes in object', async () => {
      const fileContent = JSON.stringify({ notes: mockNotes });
      const mockFile = new File([fileContent], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      api.post.mockResolvedValue({ data: { importedCount: 2 } });

      await importNotesService(mockFile);

      expect(api.post).toHaveBeenCalledWith('/notes/import', { notes: mockNotes });
    });

    it('should throw error for empty notes file', async () => {
      const fileContent = JSON.stringify([]);
      const mockFile = new File([fileContent], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      await expect(importNotesService(mockFile)).rejects.toThrow(
        'No valid notes found in file'
      );
    });

    it('should throw error for invalid JSON', async () => {
      const fileContent = 'invalid json {]';
      const mockFile = new File([fileContent], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      await expect(importNotesService(mockFile)).rejects.toThrow('Invalid JSON file');
    });

    it('should throw error if file read fails', async () => {
      const mockFile = new File(['data'], 'notes.json');
      mockFile.text = jest.fn().mockRejectedValue(new Error('Read error'));

      await expect(importNotesService(mockFile)).rejects.toThrow(
        'Failed to read file'
      );
    });

    it('should handle empty notes object', async () => {
      const fileContent = JSON.stringify({ notes: [] });
      const mockFile = new File([fileContent], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      await expect(importNotesService(mockFile)).rejects.toThrow(
        'No valid notes found in file'
      );
    });

    it('should handle missing notes field in object', async () => {
      const fileContent = JSON.stringify({ data: 'no notes' });
      const mockFile = new File([fileContent], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      await expect(importNotesService(mockFile)).rejects.toThrow(
        'No valid notes found in file'
      );
    });

    it('should throw error if import API call fails', async () => {
      const fileContent = JSON.stringify(mockNotes);
      const mockFile = new File([fileContent], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue(fileContent);

      const error = new Error('Import failed');
      api.post.mockRejectedValue(error);

      await expect(importNotesService(mockFile)).rejects.toThrow('Import failed');
    });

    it('should log errors (for Sonar console.error requirement)', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockFile = new File(['invalid'], 'notes.json');
      mockFile.text = jest.fn().mockResolvedValue('not json');

      try {
        await importNotesService(mockFile);
      } catch (err) {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
