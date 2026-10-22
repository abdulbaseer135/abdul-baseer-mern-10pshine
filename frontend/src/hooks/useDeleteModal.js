import { useState, useCallback } from 'react';

/**
 * Custom hook for managing delete confirmation modal state
 * Reduces cognitive complexity by separating modal concerns
 */
const useDeleteModal = (onDelete, onFetch) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null, noteTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = useCallback((note) => {
    setDeleteModal({ isOpen: true, noteId: note._id, noteTitle: note.title });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModal.noteId) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteModal.noteId);
      setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
      onFetch?.();
    } finally {
      setIsDeleting(false);
    }
  }, [deleteModal.noteId, onDelete, onFetch]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
  }, []);

  return {
    deleteModal,
    setDeleteModal,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};

export default useDeleteModal;
