import { useState, useCallback } from 'react';

/**
 * Custom hook for managing note editor modal state
 * Reduces cognitive complexity by separating UI state concerns
 */
const useNoteEditor = (onSave, onFetch) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(
    async (noteData) => {
      setSaving(true);
      const success = editingNote
        ? await onSave(editingNote._id, noteData, true)
        : await onSave(null, noteData, false);
      setSaving(false);

      if (success) {
        setShowEditor(false);
        setEditingNote(null);
        onFetch?.();
      }

      return success;
    },
    [editingNote, onSave, onFetch]
  );

  const handleEdit = useCallback((note) => {
    setEditingNote(note);
    setShowEditor(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowEditor(false);
    setEditingNote(null);
  }, []);

  return {
    showEditor,
    setShowEditor,
    editingNote,
    setEditingNote,
    saving,
    handleSave,
    handleEdit,
    handleClose,
  };
};

export default useNoteEditor;
