import { renderHook, act } from '@testing-library/react';
import useDeleteModal from './useDeleteModal';

describe('useDeleteModal Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useDeleteModal());
      expect(result.current).toBeDefined();
    });

    it('should return modal state', () => {
      const { result } = renderHook(() => useDeleteModal());
      expect(result.current.isOpen).toBeDefined();
      expect(result.current.noteId).toBeDefined();
    });
  });

  describe('Modal State Management', () => {
    it('should manage open/close state', () => {
      const { result } = renderHook(() => useDeleteModal());
      expect(typeof result.current.isOpen).toBe('boolean');
    });

    it('should store note ID for deletion', () => {
      const { result } = renderHook(() => useDeleteModal());
      expect(result.current.noteId).toBeDefined();
    });
  });

  describe('Modal Operations', () => {
    it('should provide open function', () => {
      const { result } = renderHook(() => useDeleteModal());
      expect(typeof result.current.open).toBe('function');
    });

    it('should provide close function', () => {
      const { result } = renderHook(() => useDeleteModal());
      expect(typeof result.current.close).toBe('function');
    });

    it('should open modal and store note ID', () => {
      const { result } = renderHook(() => useDeleteModal());

      act(() => {
        result.current.open('note-123');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.noteId).toBe('note-123');
    });

    it('should close modal', () => {
      const { result } = renderHook(() => useDeleteModal());

      act(() => {
        result.current.open('note-123');
      });

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Multiple Operations', () => {
    it('should handle open and close cycles', () => {
      const { result } = renderHook(() => useDeleteModal());

      act(() => {
        result.current.open('note-1');
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open('note-2');
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.noteId).toBe('note-2');
    });
  });
});
