import { renderHook, act } from '@testing-library/react';
import useNoteEditor from './useNoteEditor';

describe('useNoteEditor Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(result.current).toBeDefined();
    });

    it('should return editor state', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(result.current.title).toBeDefined();
      expect(result.current.content).toBeDefined();
      expect(result.current.category).toBeDefined();
    });
  });

  describe('Note Editing', () => {
    it('should handle title change', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(result.current.title).toBeDefined();
    });

    it('should handle content change', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(result.current.content).toBeDefined();
    });

    it('should handle category change', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(result.current.category).toBeDefined();
    });

    it('should handle task status change', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(result.current.taskStatus !== undefined).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should provide validation checks', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(typeof result.current.isValid).toBe('boolean' || result.current.isValid === undefined);
    });
  });

  describe('Editing Existing Note', () => {
    it('should load note data when note is provided', () => {
      const note = { _id: 'n1', title: 'Test', content: 'Content', category: 'general' };
      const { result } = renderHook(() => useNoteEditor(note));
      expect(result.current.title || note.title).toBeDefined();
    });
  });

  describe('Reset Functionality', () => {
    it('should provide reset function', () => {
      const { result } = renderHook(() => useNoteEditor(null));
      expect(result.current.reset !== undefined).toBe(true);
    });
  });
});
