import { useEffect, useState, useRef } from 'react';
import { sanitizeNoteHtml } from '../../../utils/sanitizeNoteHtml';
import PropTypes from 'prop-types';
import { openDialog, closeDialog } from '../../../utils/dialogUtils';

const NoteViewer = ({ note, onClose = () => {} }) => {
  const [displayNote, setDisplayNote] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (note) setDisplayNote(note);
  }, [note]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (displayNote && dialog && !dialog.open) {
      openDialog(dialog);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (dialog?.open) closeDialog(dialog);
      document.body.style.overflow = '';
    };
  }, [displayNote]);

  if (!displayNote) return null;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

  return (
    <dialog
      ref={dialogRef}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        px-3 sm:px-4 py-4 sm:py-6
        m-0 p-0 w-full max-w-none max-h-none
        border-0 bg-transparent
      "
      aria-labelledby="note-viewer-title"
      onClose={onClose}
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs cursor-default"
        aria-label="Close note viewer"
        onClick={onClose}
      />
      <div
        className="
          relative z-10 w-full max-w-3xl
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-2xl shadow-2xl
          flex flex-col
          max-h-[92vh] sm:max-h-[88vh]
          animate-in overflow-hidden
        "
      >
        {/* Header */}
        <div className="
          flex items-start justify-between gap-3 sm:gap-4
          px-4 sm:px-6 py-4 sm:py-5
          border-b border-slate-100 dark:border-slate-800
          shrink-0
        ">
          <div className="flex-1 min-w-0">
            <h2
              id="note-viewer-title"
              className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white break-words mb-1"
            >
              {displayNote.title || 'Untitled Note'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Updated {formatDate(displayNote.updatedAt || displayNote.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              shrink-0 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center
              text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-150
            "
          >
            <CloseIcon />
          </button>
        </div>

        {/* Public Link Active Pill */}
        {displayNote.isPublic && (
          <div className="mx-4 sm:mx-6 mt-3 px-3 py-1.5 rounded-xl inline-flex items-center gap-2 w-fit text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Public share link is active</span>
          </div>
        )}

        {/* Note Content View Area */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] px-4 sm:px-6 py-4 sm:py-5">
          <div
            className="
              prose prose-sm sm:prose-base max-w-none
              text-slate-800 dark:text-slate-200
              prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-cyan-600 dark:prose-code:text-cyan-400
              prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
              dark:prose-invert
            "
            dangerouslySetInnerHTML={{
              __html: sanitizeNoteHtml(displayNote.content || '<p>No content</p>'),
            }}
          />
        </div>

        {/* Footer */}
        <div className="
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
          px-4 sm:px-6 py-3.5 sm:py-4
          border-t border-slate-100 dark:border-slate-800
          shrink-0 bg-slate-50/60 dark:bg-slate-800/40
        ">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Created <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(displayNote.createdAt)}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              w-full sm:w-auto min-h-[44px] sm:min-h-[38px] px-5 py-2 rounded-xl
              bg-white dark:bg-slate-800
              hover:bg-slate-100 dark:hover:bg-slate-700
              text-slate-700 dark:text-slate-200
              font-semibold text-sm
              border border-slate-200 dark:border-slate-700
              transition-all duration-200
            "
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

NoteViewer.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    isPublic: PropTypes.bool,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }),
  onClose: PropTypes.func,
};

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default NoteViewer;
