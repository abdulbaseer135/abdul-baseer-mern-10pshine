import { toast } from 'react-toastify';
import { CATEGORY_INFO, TASK_STATUS_INFO } from '../../../utils/noteConstants'; // ✅ PR 2

const NoteCard = ({ note, onEdit, onDelete, onShare, onView, onPin }) => {
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
    <div 
      className="
        note-card
        p-4 sm:p-5
        flex flex-col justify-between
        h-full min-h-[240px] sm:min-h-[260px]
        group transition-all duration-200 ease-out
        border rounded-lg
      "
      style={{
        backgroundColor: 'var(--surface-elevated)',
        borderColor: note.isPinned ? 'var(--warning-primary)' : 'var(--border-default)',
        borderWidth: note.isPinned ? '2px' : '1px',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = note.isPinned ? 'var(--warning-primary)' : 'var(--border-strong)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = note.isPinned ? 'var(--warning-primary)' : 'var(--border-default)';
      }}
    >

      {/* ─── Top Section — Title + Date ────────────────────── */}
      <div className="mb-3">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            className="
              text-base sm:text-lg font-bold leading-tight tracking-tight
              line-clamp-2 flex-1
            "
            style={{ color: 'var(--text-primary)' }}
          >
            {note.title}
          </h3>

          {/* Date Badge — Refined, minimal */}
          <span 
            className="
              shrink-0 text-2xs font-medium
              px-1.5 py-0.5 rounded-md
              border
              whitespace-nowrap
            "
            style={{
              backgroundColor: 'var(--surface-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-tertiary)'
            }}
          >
            {formatDate(note.updatedAt || note.createdAt)}
          </span>
        </div>

        {/* Content Preview — Premium readability with tight rhythm */}
        <p 
          className="
            text-sm leading-snug
            line-clamp-3 mb-2.5
          "
          style={{ color: 'var(--text-secondary)' }}
        >
          {plainTextContent || <em style={{ color: 'var(--text-muted)' }}>No content</em>}
        </p>
      </div>

      {/* ─── Metadata Badges — Compact composition ────────────────────────────── */}
      <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
        {/* ✅ Category Badge */}
        {note.category && (
          <span 
            className={`
              inline-flex items-center gap-0.5 px-2 py-0.5
              rounded-sm text-xs font-semibold
              border transition-all duration-150
              ${CATEGORY_INFO[note.category]?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'}
            `}
          >
            {CATEGORY_INFO[note.category]?.icon} {CATEGORY_INFO[note.category]?.label}
          </span>
        )}

        {/* ✅ Task Status Badge (show only for task category) */}
        {note.category === 'task' && note.taskStatus && (
          <span 
            className={`
              inline-flex items-center gap-0.5 px-2 py-0.5
              rounded-sm text-xs font-semibold
              border transition-all duration-150
              ${TASK_STATUS_INFO[note.taskStatus]?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'}
            `}
          >
            {TASK_STATUS_INFO[note.taskStatus]?.icon} {TASK_STATUS_INFO[note.taskStatus]?.label}
          </span>
        )}

        {/* Sharing indicator */}
        {note.isPublic && (
          <span 
            className="
              inline-flex items-center gap-0.5 px-2 py-0.5
              rounded-sm text-xs font-semibold
              border transition-all duration-150
            "
            style={{
              backgroundColor: 'var(--success-primary)',
              borderColor: 'var(--success-primary)',
              color: 'white'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Public
          </span>
        )}
      </div>

      {/* ─── Divider ────────────────────────────────────── */}
      <div 
        className="border-t mb-3" 
        style={{ borderColor: 'var(--border-subtle)' }} 
      />

      {/* ─── Action Buttons — Carefully composed, compact row ──── */}
      <div className="flex gap-1 justify-start flex-wrap">
        
        {/* View Full Note */}
        <button
          onClick={() => onView(note)}
          title="View full note"
          className="
            p-1.5 rounded-md transition-all duration-200
            border hover:shadow-md
          "
          style={{
            backgroundColor: 'var(--surface-input)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-input)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ReadMoreIcon />
        </button>

        {/* Edit Note */}
        <button
          onClick={() => onEdit(note)}
          title="Edit note"
          className="
            p-1.5 rounded-md transition-all duration-200
            border hover:shadow-md
          "
          style={{
            backgroundColor: 'var(--surface-input)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-input)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <EditIcon />
        </button>

        {/* ✅ PIN Toggle Button */}
        {onPin && (
          <button
            onClick={() => onPin(note._id)}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            className="
              p-1.5 rounded-md border transition-all duration-200 hover:shadow-md
            "
            style={{
              backgroundColor: note.isPinned ? 'rgba(250, 204, 21, 0.15)' : 'var(--surface-input)',
              borderColor: note.isPinned ? 'var(--warning-primary)' : 'var(--border-default)',
              color: note.isPinned ? 'var(--warning-primary)' : 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (!note.isPinned) {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!note.isPinned) {
                e.currentTarget.style.backgroundColor = 'var(--surface-input)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <PinIcon filled={note.isPinned} />
          </button>
        )}

        {/* Delete Note */}
        <button
          onClick={() => onDelete(note._id)}
          title="Delete note"
          className="
            p-1.5 rounded-md border transition-all duration-200
            hover:shadow-md
          "
          style={{
            backgroundColor: 'var(--surface-input)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.15)';
            e.currentTarget.style.borderColor = 'var(--danger-primary)';
            e.currentTarget.style.color = 'var(--danger-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-input)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <TrashIcon />
        </button>

        {/* Share Toggle */}
        <button
          onClick={() => onShare(note._id)}
          title={note.isPublic ? 'Disable sharing' : 'Share note'}
          className="
            p-1.5 rounded-md border transition-all duration-200
            hover:shadow-md
          "
          style={{
            backgroundColor: 'var(--surface-input)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-input)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ShareIcon />
        </button>

        {/* Copy Share Link */}
        <button
          onClick={() => note.isPublic && shareUrl && handleCopyLink()}
          disabled={!note.isPublic || !shareUrl}
          title={note.isPublic && shareUrl ? 'Copy share link' : 'Share note first'}
          className={`
            p-1.5 rounded-md border transition-all duration-200 hover:shadow-md
            ${note.isPublic && shareUrl
              ? 'cursor-pointer'
              : 'opacity-40 cursor-not-allowed'
            }
          `}
          style={{
            backgroundColor: 'var(--surface-input)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            if (note.isPublic && shareUrl) {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (note.isPublic && shareUrl) {
              e.currentTarget.style.backgroundColor = 'var(--surface-input)';
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
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

// ✅ PR 2: Pin Icon
const PinIcon = ({ filled = false }) => (
  filled ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2c-5.33 4-8 6.5-8 9.5 0 3 2.5 5 8 5s8-2 8-5c0-3-2.67-5.5-8-9.5z"/>
      <circle cx="12" cy="19" r="3" fill="currentColor"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-5.33 4-8 6.5-8 9.5 0 3 2.5 5 8 5s8-2 8-5c0-3-2.67-5.5-8-9.5z"/>
      <circle cx="12" cy="19" r="3"/>
    </svg>
  )
);


export default NoteCard;