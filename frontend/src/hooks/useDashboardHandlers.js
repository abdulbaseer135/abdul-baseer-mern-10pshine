import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { togglePinNoteService } from '../services/notes.service';
import { filterNotesByCategory } from '../utils/helpers';
import { sortNotesByOption } from '../utils/noteSortUtils';
import useNoteEditor from './useNoteEditor';
import useDeleteModal from './useDeleteModal';
import useNoteImportExport from './useNoteImportExport';

const useDashboardHandlers = (notes, searchQuery, handleFetchNotes, handleEditNote, handleAddNote, handleRemoveNote) => {
  const [sortBy, setSortBy] = useState('newest');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [viewingNote, setViewingNote] = useState(null);

  const loadNotes = useCallback(() => {
    handleFetchNotes({ page: 1, limit: 10, search: searchQuery });
  }, [searchQuery, handleFetchNotes]);

  // Use extracted hooks for state management
  const editor = useNoteEditor(
    async (id, data, isEdit) => {
      return isEdit
        ? await handleEditNote(id, data)
        : await handleAddNote(data);
    },
    loadNotes
  );

  const deleteOps = useDeleteModal(handleRemoveNote, loadNotes);

  const importExport = useNoteImportExport(handleFetchNotes, searchQuery);

  const handlePin = useCallback(async (noteId) => {
    try {
      await togglePinNoteService(noteId);
      toast.success('Note pin status updated!');
      loadNotes();
    } catch {
      toast.error('Failed to toggle pin. Try again.');
    }
  }, [loadNotes]);

  const visibleNotes = useMemo(() => {
    let result = [...notes];
    result = filterNotesByCategory(result, currentFilter);
    result = sortNotesByOption(result, sortBy);
    return result;
  }, [notes, currentFilter, sortBy]);

  return {
    // Editor state
    showEditor: editor.showEditor,
    setShowEditor: editor.setShowEditor,
    editingNote: editor.editingNote,
    setEditingNote: editor.setEditingNote,
    saving: editor.saving,
    handleSave: editor.handleSave,
    handleEdit: editor.handleEdit,
    handleClose: editor.handleClose,

    // Delete modal state
    deleteModal: deleteOps.deleteModal,
    setDeleteModal: deleteOps.setDeleteModal,
    handleDeleteClick: deleteOps.handleDeleteClick,
    handleDeleteConfirm: deleteOps.handleDeleteConfirm,
    handleDeleteCancel: deleteOps.handleDeleteCancel,

    // Import/Export state
    exporting: importExport.exporting,
    importing: importExport.importing,
    importRef: importExport.importRef,
    handleExport: importExport.handleExport,
    handleImport: importExport.handleImport,

    // Filter/Sort state
    sortBy,
    setSortBy,
    currentFilter,
    setCurrentFilter,
    viewingNote,
    setViewingNote,

    // Computed state
    visibleNotes,
    loadNotes,
    handlePin,
  };
};

export default useDashboardHandlers;
