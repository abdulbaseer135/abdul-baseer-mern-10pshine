import { useState, useRef, useCallback } from 'react';
import { uploadProfileImageService, removeProfileImageService } from '../services/profile.service';

const VALID_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'image/bmp', 'image/tiff', 'image/x-tiff', 'image/heic', 'image/heif',
  'image/x-icon', 'image/vnd.microsoft.icon', 'image/avif', 'image/jp2',
]);

const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size must not exceed 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }
  if (!VALID_IMAGE_TYPES.has(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, WebP, GIF, SVG, BMP, TIFF, HEIC, or ICO)';
  }
  return null;
};

/**
 * Custom hook for profile image upload/removal operations
 */
const useProfileImage = (onFetchProfile) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imageSuccess, setImageSuccess] = useState(false);
  const [removeImageModal, setRemoveImageModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateImageFile(file);
      if (validationError) {
        setImageError(validationError);
        return;
      }

      setImageLoading(true);
      setImageError(null);
      setImageSuccess(false);

      try {
        const formData = new FormData();
        formData.append('profileImage', file);
        await uploadProfileImageService(formData);
        await onFetchProfile();
        setImageSuccess(true);
        setTimeout(() => setImageSuccess(false), 3000);
      } catch (err) {
        setImageError(err.response?.data?.message || 'Failed to upload image');
      } finally {
        setImageLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [onFetchProfile]
  );

  const confirmRemoveImage = useCallback(async () => {
    setRemoveImageModal(false);
    setImageLoading(true);
    setImageError(null);

    try {
      await removeProfileImageService();
      await onFetchProfile();
      setImageSuccess(true);
      setTimeout(() => setImageSuccess(false), 3000);
    } catch (err) {
      setImageError(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setImageLoading(false);
    }
  }, [onFetchProfile]);

  const handleRemoveClick = useCallback(() => {
    setRemoveImageModal(true);
  }, []);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return {
    imageLoading,
    imageError,
    imageSuccess,
    removeImageModal,
    fileInputRef,
    setRemoveImageModal,
    setImageError,
    handleImageUpload,
    confirmRemoveImage,
    handleRemoveClick,
    triggerFileInput,
  };
};

export default useProfileImage;
