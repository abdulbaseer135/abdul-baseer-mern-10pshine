import { useEffect, useState } from 'react';

const NoteViewer = ({ note, onClose }) => {
  const [displayNote, setDisplayNote] = useState(null);

  useEffect(() => {
    if (note) {
      setDisplayNote(note);
    }
  }, [note]);

  if (!displayNote) return null;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

  return (
    /* ─── Backdrop ──────────────────────────────────── */
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        px-3 sm:px-4 py-4 sm:py-6
        bg-black/50 dark:bg-black/70
        backdrop-blur-sm
      "
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ─── Modal Panel ─────────────────────────────── */}
      <div className="
        w-full max-w-3xl
        bg-white dark:bg-[#141414]
        border border-gray-200/60 dark:border-white/[0.07]
        rounded-xl sm:rounded-2xl shadow-2xl dark:shadow-black/60
        flex flex-col
        max-h-[90vh]
        animate-in
      ">
        {/* ─── Header ──────────────────────────────────── */}
        <div className="
          flex items-start justify-between gap-3 sm:gap-4
          px-4 sm:px-6 py-4 sm:py-5
          border-b border-gray-100 dark:border-white/[0.06]
          shrink-0
        ">
          <div className="flex-1 min-w-0">
            <h2 className="
              text-base sm:text-xl font-bold
              text-gray-900 dark:text-gray-100
              break-words
              mb-1 sm:mb-2
            ">
              {displayNote.title || 'Untitled Note'}
            </h2>
            <p className="
              text-xs sm:text-sm text-gray-500 dark:text-gray-400
            ">
              Last updated {formatDate(displayNote.updatedAt || displayNote.createdAt)}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="
              shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm
              text-gray-400 dark:text-gray-600
              hover:text-gray-700 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-white/[0.07]
              border border-transparent
              hover:border-gray-200 dark:hover:border-white/[0.08]
              transition-all duration-200
            "
          >
            <CloseIcon />
          </button>
        </div>

        {/* ─── Header Divider ──────────────────────────── */}
        <div className="px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent dark:from-white/[0.08] dark:via-white/[0.08]" />
        </div>

        {/* ─── Public Link Badge ───────────────────────── */}
        {displayNote.isPublic && (
          <div className="
            mx-4 sm:mx-6 mt-3 sm:mt-4 px-2 sm:px-3 py-1.5 sm:py-2
            rounded-lg inline-flex items-center gap-1.5 sm:gap-2 w-fit text-xs sm:text-sm
            bg-green-50 dark:bg-green-500/[0.08]
            border border-green-200 dark:border-green-500/[0.2]
          ">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Public link active
            </span>
          </div>
        )}

        {/* ─── Content — Scrollable ───────────────────── */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] px-4 sm:px-6 py-4 sm:py-5">
          <div
            className="
              prose prose-sm max-w-none
              text-gray-700 dark:text-gray-300
              prose-p:my-2 sm:prose-p:my-3
              prose-headings:my-3 sm:prose-headings:my-4
              prose-ul:my-2
              prose-ol:my-2
              prose-li:my-0.5 sm:prose-li:my-1
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800
              prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm
              prose-blockquote:border-l-4
              prose-blockquote:border-gray-300
              dark:prose-blockquote:border-gray-600
              dark:prose-invert
            "
            dangerouslySetInnerHTML={{
              __html: displayNote.content || '<p>No content</p>',
            }}
          />
        </div>

        {/* ─── Footer ──────────────────────────────────── */}
        <div className="
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3
          px-4 sm:px-6 py-3 sm:py-4
          border-t border-gray-100 dark:border-white/[0.06]
          shrink-0
          bg-gray-50/50 dark:bg-white/[0.02]
        ">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              Created <span className="font-medium">{formatDate(displayNote.createdAt)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg
              bg-gray-100 dark:bg-white/[0.07]
              hover:bg-gray-200 dark:hover:bg-white/[0.10]
              text-gray-700 dark:text-gray-300
              font-medium text-xs sm:text-sm
              border border-gray-200 dark:border-white/[0.08]
              transition-all duration-200
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default NoteViewer;
