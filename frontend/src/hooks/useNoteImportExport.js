import { useState, useCallback, useRef } from 'react';
import { performExport, performImport } from '../utils/noteImportExportUtils';

const useNoteImportExport = (onFetch, searchQuery) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const importRef = useRef(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    await performExport();
    setExporting(false);
  }, []);

  const handleImport = useCallback(
    async (e) => {
      const files = e.target.files;
      const file = files && files.length > 0 ? files[0] : null;

      setImporting(true);
      if (file) {
        e.target.value = '';
        await performImport(file, onFetch, searchQuery);
      }
      setImporting(false);
    },
    [searchQuery, onFetch]
  );

  return {
    exporting,
    importing,
    importRef,
    handleExport,
    handleImport,
  };
};

export default useNoteImportExport;
