import { toast } from 'react-toastify';
import { exportNotesService, importNotesService } from '../services/notes.service';

const getPluralSuffix = (count) => (count === 1 ? '' : 's'); // Sonar: positive condition

const showImportMessage = (importedCount, skippedCount) => {
  if (importedCount && skippedCount) {
    toast.success(
      `${importedCount} note${getPluralSuffix(importedCount)} imported. ${skippedCount} duplicate${getPluralSuffix(skippedCount)} skipped.`
    );
  } else if (importedCount) {
    toast.success(`${importedCount} note${getPluralSuffix(importedCount)} imported successfully!`);
  } else if (skippedCount) {
    toast.warning(`All ${skippedCount} note(s) were duplicates and skipped.`);
  }
};

export const performExport = async () => {
  try {
    await exportNotesService();
    toast.success('Notes exported successfully!');
    return true;
  } catch (err) {
    console.error(err); // Sonar: handle caught exception
    toast.error('Something went wrong. Try again.');
    return false;
  }
};

export const performImport = async (file, onFetch, searchQuery) => {
  try {
    const res = await importNotesService(file);
    const data = res?.data || res;
    showImportMessage(data?.importedCount ?? 0, data?.skippedCount ?? 0);
    onFetch?.({ page: 1, limit: 10, search: searchQuery });
    return true;
  } catch (err) {
    toast.error(err.message || 'Something went wrong. Try again.');
    return false;
  }
};
