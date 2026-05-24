import { renderHook, act, waitFor } from '@testing-library/react';
import useProfileImage from './useProfileImage';
import * as profileService from '../services/profile.service';

jest.mock('../services/profile.service');

describe('useProfileImage Hook', () => {
  const mockOnFetchProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));

      expect(result.current.imageLoading).toBe(false);
      expect(result.current.imageError).toBe(null);
      expect(result.current.imageSuccess).toBe(false);
      expect(result.current.removeImageModal).toBe(false);
      expect(result.current.fileInputRef).toBeDefined();
    });

    it('should expose required methods', () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));

      expect(typeof result.current.handleImageUpload).toBe('function');
      expect(typeof result.current.confirmRemoveImage).toBe('function');
      expect(typeof result.current.handleRemoveClick).toBe('function');
      expect(typeof result.current.triggerFileInput).toBe('function');
      expect(typeof result.current.setRemoveImageModal).toBe('function');
      expect(typeof result.current.setImageError).toBe('function');
    });
  });

  describe('handleImageUpload - validation', () => {
    it('should do nothing if no file is selected', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));

      const mockEvent = { target: { files: [] } };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.imageError).toBeNull();
      expect(profileService.uploadProfileImageService).not.toHaveBeenCalled();
    });

    it('should reject file if it exceeds size limit (5MB)', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));

      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const mockEvent = { target: { files: [largeFile] } };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.imageError).toContain('File size must not exceed 5MB');
      expect(profileService.uploadProfileImageService).not.toHaveBeenCalled();
    });

    it('should reject file if it is not an image type', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));

      const textFile = new File(['content'], 'file.txt', { type: 'text/plain' });
      const mockEvent = { target: { files: [textFile] } };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.imageError).toContain('Please upload a valid image file');
      expect(profileService.uploadProfileImageService).not.toHaveBeenCalled();
    });

    it('should accept several valid image types and call upload service', async () => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
      ];

      for (const type of validTypes) {
        jest.clearAllMocks();
        profileService.uploadProfileImageService.mockResolvedValue({
          data: { success: true },
        });

        const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));

        const file = new File(['img'], 'test.jpg', { type });
        const mockEvent = { target: { files: [file] } };

        await act(async () => {
          await result.current.handleImageUpload(mockEvent);
        });

        await waitFor(() => {
          expect(profileService.uploadProfileImageService).toHaveBeenCalled();
        });
      }
    });
  });

  describe('handleImageUpload - success flow', () => {
    it('should upload file and call onFetchProfile on success', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      profileService.uploadProfileImageService.mockResolvedValue({
        data: { success: true },
      });

      const file = new File(['image'], 'ok.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [file] } };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(profileService.uploadProfileImageService).toHaveBeenCalled();
        expect(mockOnFetchProfile).toHaveBeenCalled();
        expect(result.current.imageSuccess).toBe(true);
      });
    });

    it('should clear imageSuccess after 3 seconds', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      profileService.uploadProfileImageService.mockResolvedValue({
        data: { success: true },
      });

      const file = new File(['image'], 'ok.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [file] } };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      // fast-forward timers
      await act(async () => {
        jest.advanceTimersByTime(3100);
      });

      expect(result.current.imageSuccess).toBe(false);
      jest.useRealTimers();
    });

    it('should clear file input value after upload', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      profileService.uploadProfileImageService.mockResolvedValue({
        data: { success: true },
      });

      const file = new File(['image'], 'ok.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [file] } };

      result.current.fileInputRef.current = { value: 'somefile' };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.fileInputRef.current.value).toBe('');
      });
    });
  });

  describe('handleImageUpload - error handling', () => {
    it('should handle upload error with custom message', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      profileService.uploadProfileImageService.mockRejectedValue({
        response: { data: { message: 'Upload failed' } },
      });

      const file = new File(['image'], 'bad.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [file] } };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.imageError).toBe('Upload failed');
        expect(result.current.imageLoading).toBe(false);
      });
    });

    it('should use default error message if not provided', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      profileService.uploadProfileImageService.mockRejectedValue(
        new Error('Network error')
      );

      const file = new File(['image'], 'bad.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [file] } };

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.imageError).toBe('Failed to upload image');
        expect(result.current.imageLoading).toBe(false);
      });
    });
  });

  describe('confirmRemoveImage', () => {
    it('should remove image and call onFetchProfile', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      profileService.removeProfileImageService.mockResolvedValue({
        data: { success: true },
      });

      await act(async () => {
        await result.current.confirmRemoveImage();
      });

      await waitFor(() => {
        expect(profileService.removeProfileImageService).toHaveBeenCalled();
        expect(mockOnFetchProfile).toHaveBeenCalled();
        expect(result.current.imageSuccess).toBe(true);
      });
    });

    it('should handle removal error with custom message', async () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      profileService.removeProfileImageService.mockRejectedValue({
        response: { data: { message: 'Failed to remove image' } },
      });

      await act(async () => {
        await result.current.confirmRemoveImage();
      });

      await waitFor(() => {
        expect(result.current.imageError).toBe('Failed to remove image');
        expect(result.current.imageLoading).toBe(false);
      });
    });
  });

  describe('Modal controls and helpers', () => {
    it('handleRemoveClick should open modal', () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));

      expect(result.current.removeImageModal).toBe(false);

      act(() => {
        result.current.handleRemoveClick();
      });

      expect(result.current.removeImageModal).toBe(true);
    });

    it('triggerFileInput should click file input if ref exists', () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      const mockClick = jest.fn();
      result.current.fileInputRef.current = { click: mockClick };

      act(() => {
        result.current.triggerFileInput();
      });

      expect(mockClick).toHaveBeenCalled();
    });

    it('triggerFileInput should not throw if ref is null', () => {
      const { result } = renderHook(() => useProfileImage(mockOnFetchProfile));
      result.current.fileInputRef.current = null;

      act(() => {
        expect(() => result.current.triggerFileInput()).not.toThrow();
      });
    });
  });
});