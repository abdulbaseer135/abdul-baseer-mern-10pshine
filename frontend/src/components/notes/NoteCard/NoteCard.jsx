import { toast } from 'react-toastify';

const NoteCard = ({ note, onEdit, onDelete, onShare }) => {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

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
      group relative
      bg-white dark:bg-[#141414]
      border border-gray-200/80 dark:border-white/[0.06]
      rounded-2xl p-5
      shadow-sm dark:shadow-none
      flex flex-col gap-3
      cursor-default
    ">

      {/* ─── Top Row — Title + Date ─────────────────── */}
      <div className="flex items-start justify-between gap-3">
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
          mt-0.5
        ">
          {formatDate(note.updatedAt || note.createdAt)}
        </span>
      </div>

      {/* ─── Content Preview ───────────────────────── */}
      <div
        className="
          text-sm leading-relaxed
          text-gray-500 dark:text-gray-500
          line-clamp-3
          prose prose-sm max-w-none
          prose-p:my-0
          dark:prose-invert
        "
        dangerouslySetInnerHTML={{ __html: note.content || '<p>No content</p>' }}
      />

      {/* ─── Shared Badge — visible when note is public ── */}
      {note.isPublic && (
        <div className="
          flex items-center gap-1.5
          px-2.5 py-1 rounded-lg w-fit
          bg-green-50 dark:bg-green-500/[0.08]
          border border-green-100 dark:border-green-500/[0.15]
        ">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
          <span className="text-[11px] font-medium text-green-600 dark:text-green-400">
            Public link active
          </span>
        </div>
      )}

      {/* ─── Divider ───────────────────────────────── */}
      <div className="border-t border-gray-100 dark:border-white/[0.05] mt-auto" />

      {/* ─── Action Buttons ────────────────────────── */}
      <div className="flex gap-2">

        {/* Edit */}
        <button
          onClick={() => onEdit(note)}
          className="
            flex-1 flex items-center justify-center gap-1.5
            text-[13px] font-medium py-2 rounded-xl
            bg-indigo-50 dark:bg-indigo-500/[0.08]
            hover:bg-indigo-100 dark:hover:bg-indigo-500/[0.15]
            text-indigo-600 dark:text-indigo-400
            border border-indigo-100 dark:border-indigo-500/[0.12]
            hover:border-indigo-200 dark:hover:border-indigo-500/[0.25]
            transition-all duration-200
          "
        >
          <EditIcon />
          Edit
        </button>

        {/* ─── Share Toggle ──────────────────────────── */}
        <button
          onClick={() => onShare(note._id)}
          title={note.isPublic ? 'Disable sharing' : 'Share note'}
          className={`
            flex items-center justify-center gap-1.5
            text-[13px] font-medium py-2 px-3 rounded-xl
            border transition-all duration-200
            ${note.isPublic
              ? 'bg-green-50 dark:bg-green-500/[0.08] text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/[0.15] hover:bg-green-100 dark:hover:bg-green-500/[0.15]'
              : 'bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-gray-600 border-gray-200 dark:border-white/[0.06] hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
            }
          `}
        >
          <ShareIcon />
        </button>

        {/* ─── Copy Link — only shown when note is public ── */}
        {note.isPublic && shareUrl && (
          <button
            onClick={handleCopyLink}
            title="Copy share link"
            className="
              flex items-center justify-center gap-1.5
              text-[13px] font-medium py-2 px-3 rounded-xl
              bg-indigo-50 dark:bg-indigo-500/[0.08]
              hover:bg-indigo-100 dark:hover:bg-indigo-500/[0.15]
              text-indigo-500 dark:text-indigo-400
              border border-indigo-100 dark:border-indigo-500/[0.12]
              hover:border-indigo-200 dark:hover:border-indigo-500/[0.25]
              transition-all duration-200
            "
          >
            <LinkIcon />
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(note._id)}
          className="
            flex-1 flex items-center justify-center gap-1.5
            text-[13px] font-medium py-2 rounded-xl
            bg-red-50 dark:bg-red-500/[0.08]
            hover:bg-red-100 dark:hover:bg-red-500/[0.15]
            text-red-500 dark:text-red-400
            border border-red-100 dark:border-red-500/[0.12]
            hover:border-red-200 dark:hover:border-red-500/[0.25]
            transition-all duration-200
          "
        >
          <TrashIcon />
          Delete
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


export default NoteCard;