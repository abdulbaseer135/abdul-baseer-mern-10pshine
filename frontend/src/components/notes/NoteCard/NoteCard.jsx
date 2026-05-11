import { toast } from 'react-toastify';

const NoteCard = ({ note, onEdit, onDelete, onShare, onView }) => {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  // ✅ Strip HTML tags to get plain text for preview
  const stripHtml = (html) => html.replace(/<[^>]*>/g, '');
  const plainTextContent = stripHtml(note.content || '');

  // ✅ Build the public share URL from the note's token
  const shareUrl = note.isPublic && note.shareToken
    ? `${window.location.origin}/shared/${note.shareToken}`
    : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div className="
      note-card
      bg-white dark:bg-[#141414]
      border border-gray-200/80 dark:border-white/[0.06]
      border-l-4 border-l-transparent
      hover:border-l-indigo-500 dark:hover:border-l-indigo-400
      rounded-2xl p-5
      shadow-sm dark:shadow-none
      flex flex-col justify-between
      cursor-default
      h-full min-h-[220px]
      transition-all duration-200
    ">

      {/* ─── Top Row — Title + Date ────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="
          text-[15px] font-semibold leading-snug
          text-gray-900 dark:text-gray-100
          line-clamp-1 flex-1
        ">
          {note.title}
        </h3>

        {/* Date badge */}
        <span className="
          shrink-0 text-[11px] font-medium
          px-2 py-0.5 rounded-full
          bg-gray-100 dark:bg-white/[0.05]
          text-gray-400 dark:text-gray-600
          border border-gray-200/60 dark:border-white/[0.04]
        ">
          {formatDate(note.updatedAt || note.createdAt)}
        </span>
      </div>

      {/* ─── Content Preview — Plain Text, 3 Lines Max ──────── */}
      <div className="mb-3 flex-grow">
        <p className="
          text-sm leading-relaxed
          text-gray-600 dark:text-gray-400
          line-clamp-3
        ">
          {plainTextContent || 'No content'}
        </p>
      </div>

      {/* ─── Badge Container — Always Reserved Space ──────────────────────────── */}
      <div className="h-8 flex items-center mt-2 mb-1">
        {note.isPublic && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1
            rounded-full text-xs font-medium
            bg-green-50 text-green-700 border border-green-200
            dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
            Public link active
          </span>
        )}
      </div>

      {/* ─── Divider ────────────────────────────────────── */}
      <div className="border-t border-gray-100 dark:border-white/[0.05] mb-3" />

      {/* ─── Action Buttons — Single Row with Icons Only ──── */}
      <div className="flex gap-1.5 justify-start">
        
        {/* View Full Note */}
        <button
          onClick={() => onView(note)}
          title="View full note"
          className="
            p-2 rounded-lg
            bg-gray-100 dark:bg-white/[0.05]
            hover:bg-gray-200 dark:hover:bg-white/[0.08]
            text-gray-600 dark:text-gray-400
            border border-gray-200 dark:border-white/[0.08]
            hover:border-gray-300 dark:hover:border-white/[0.12]
            transition-all duration-200
          "
        >
          <ReadMoreIcon />
        </button>

        {/* Edit Note */}
        <button
          onClick={() => onEdit(note)}
          title="Edit note"
          className="
            p-2 rounded-lg
            bg-gray-100 dark:bg-white/[0.05]
            hover:bg-gray-200 dark:hover:bg-white/[0.08]
            text-gray-600 dark:text-gray-400
            border border-gray-200 dark:border-white/[0.08]
            hover:border-gray-300 dark:hover:border-white/[0.12]
            transition-all duration-200
          "
        >
          <EditIcon />
        </button>

        {/* Delete Note */}
        <button
          onClick={() => onDelete(note._id)}
          title="Delete note"
          className="
            p-2 rounded-lg
            bg-gray-100 dark:bg-white/[0.05]
            hover:bg-red-100 dark:hover:bg-red-500/[0.08]
            text-gray-600 dark:text-gray-400
            hover:text-red-600 dark:hover:text-red-400
            border border-gray-200 dark:border-white/[0.08]
            hover:border-red-200 dark:hover:border-red-500/[0.12]
            transition-all duration-200
          "
        >
          <TrashIcon />
        </button>

        {/* Share Toggle */}
        <button
          onClick={() => onShare(note._id)}
          title={note.isPublic ? 'Disable sharing' : 'Share note'}
          className="
            p-2 rounded-lg
            bg-gray-100 dark:bg-white/[0.05]
            hover:bg-gray-200 dark:hover:bg-white/[0.08]
            text-gray-600 dark:text-gray-400
            border border-gray-200 dark:border-white/[0.08]
            hover:border-gray-300 dark:hover:border-white/[0.12]
            transition-all duration-200
          "
        >
          <ShareIcon />
        </button>

        {/* Copy Share Link */}
        <button
          onClick={() => note.isPublic && shareUrl && handleCopyLink()}
          disabled={!note.isPublic || !shareUrl}
          title={note.isPublic && shareUrl ? 'Copy share link' : 'Share note first'}
          className={`
            p-2 rounded-lg border transition-all duration-200
            ${note.isPublic && shareUrl
              ? 'bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.08] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.12] cursor-pointer'
              : 'bg-gray-50 dark:bg-white/[0.02] text-gray-300 dark:text-gray-700 border-gray-100 dark:border-white/[0.04] cursor-not-allowed opacity-40'
            }
          `}
        >
          <LinkIcon />
        </button>
      </div>

    </div>
  );
};


/* ─── SVG Icons ────────────────────────────────────── */

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

const ReadMoreIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);


export default NoteCard;