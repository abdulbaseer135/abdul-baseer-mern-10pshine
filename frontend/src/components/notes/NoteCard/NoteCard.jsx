import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { CATEGORY_INFO, TASK_STATUS_INFO } from '../../../utils/noteConstants';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

const stripHtml = (html) => html.replaceAll(/<[^>]*>/g, '');

const getShareUrl = (note) =>
  note.isPublic && note.shareToken
    ? `${globalThis.location?.origin}/shared/${note.shareToken}`
    : null;

const NoteCard = ({ note, onEdit, onDelete, onShare, onView, onPin, onClick }) => {
  const plainTextContent = stripHtml(note.content || '');
  const shareUrl = getShareUrl(note);

  const handleCopyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(note);
    } else if (onView) {
      onView(note);
    }
  };

  const renderCategoryBadge = () => {
    if (!note.category) return null;
    return (
      <span
        className={`
          inline-flex items-center gap-1 px-2.5 py-1
          rounded-lg text-xs font-semibold border
          ${CATEGORY_INFO[note.category]?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}
        `}
      >
        {CATEGORY_INFO[note.category]?.icon} {CATEGORY_INFO[note.category]?.label}
      </span>
    );
  };

  const renderTaskStatusBadge = () => {
    if (note.category !== 'task' || !note.taskStatus) return null;
    return (
      <span
        className={`
          inline-flex items-center gap-1 px-2.5 py-1
          rounded-lg text-xs font-semibold border
          ${TASK_STATUS_INFO[note.taskStatus]?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}
        `}
      >
        {TASK_STATUS_INFO[note.taskStatus]?.icon} {TASK_STATUS_INFO[note.taskStatus]?.label}
      </span>
    );
  };

  const renderPublicBadge = () => {
    if (!note.isPublic) return null;
    return (
      <span
        className="
          inline-flex items-center gap-1.5 px-2.5 py-1
          rounded-lg text-xs font-semibold border
          bg-emerald-50 dark:bg-emerald-950/40
          text-emerald-700 dark:text-emerald-300
          border-emerald-200 dark:border-emerald-800/60
        "
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Public
      </span>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        note-card group relative flex flex-col justify-between
        p-4 sm:p-5 rounded-2xl border transition-all duration-200
        min-h-[230px] sm:min-h-[250px] cursor-pointer
        hover:-translate-y-1 hover:shadow-md
        ${note.isPinned
          ? 'border-amber-400/80 dark:border-amber-500/80 ring-1 ring-amber-400/30 dark:ring-amber-500/30'
          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/50 dark:hover:border-cyan-400/50'
        }
      `}
      style={{
        backgroundColor: 'var(--surface-elevated)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Top Details */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {note.isPinned && (
              <span className="shrink-0 text-amber-500" title="Pinned Note" aria-label="Pinned note">
                <PinIcon filled />
              </span>
            )}
            <h3
              className="text-base sm:text-lg font-bold leading-snug tracking-tight line-clamp-2 break-words"
              style={{ color: 'var(--text-primary)' }}
            >
              {note.title || 'Untitled Note'}
            </h3>
          </div>

          {/* Date Badge */}
          <span
            className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-lg border whitespace-nowrap"
            style={{
              backgroundColor: 'var(--surface-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)'
            }}
          >
            {formatDate(note.updatedAt || note.createdAt)}
          </span>
        </div>

        {/* Content Preview */}
        <p
          className="text-sm leading-relaxed line-clamp-3 mb-3 break-words"
          style={{ color: 'var(--text-secondary)' }}
        >
          {plainTextContent || <em style={{ color: 'var(--text-muted)' }}>No content</em>}
        </p>
      </div>

      {/* Footer Area: Badges + Action Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {renderCategoryBadge()}
          {renderTaskStatusBadge()}
          {renderPublicBadge()}
        </div>

        {/* Action Controls */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 flex-wrap pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* View Full Note */}
          <button
            type="button"
            onClick={() => onView && onView(note)}
            title="View full note"
            aria-label="View full note"
            className="
              min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] p-2 rounded-xl border
              flex items-center justify-center transition-all duration-200
              hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10
            "
            style={{
              backgroundColor: 'var(--surface-input)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)'
            }}
          >
            <ReadMoreIcon />
          </button>

          {/* Edit Note */}
          <button
            type="button"
            onClick={() => onEdit && onEdit(note)}
            title="Edit note"
            aria-label="Edit note"
            className="
              min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] p-2 rounded-xl border
              flex items-center justify-center transition-all duration-200
              hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10
            "
            style={{
              backgroundColor: 'var(--surface-input)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)'
            }}
          >
            <EditIcon />
          </button>

          {/* Pin Button */}
          {onPin && (
            <button
              type="button"
              onClick={() => onPin(note._id)}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
              className={`
                min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] p-2 rounded-xl border
                flex items-center justify-center transition-all duration-200
                ${note.isPinned
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                  : 'hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10'
                }
              `}
              style={note.isPinned ? {} : {
                backgroundColor: 'var(--surface-input)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)'
              }}
            >
              <PinIcon filled={note.isPinned} />
            </button>
          )}

          {/* Share Toggle */}
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(note._id)}
              title={note.isPublic ? 'Disable public sharing' : 'Share note publicly'}
              aria-label={note.isPublic ? 'Disable public sharing' : 'Share note publicly'}
              className={`
                min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] p-2 rounded-xl border
                flex items-center justify-center transition-all duration-200
                ${note.isPublic
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                  : 'hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10'
                }
              `}
              style={note.isPublic ? {} : {
                backgroundColor: 'var(--surface-input)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)'
              }}
            >
              <ShareIcon />
            </button>
          )}

          {/* Copy Share Link */}
          {shareUrl && (
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy share link"
              aria-label="Copy share link"
              className="
                min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] p-2 rounded-xl border
                flex items-center justify-center transition-all duration-200
                hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10
              "
              style={{
                backgroundColor: 'var(--surface-input)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)'
              }}
            >
              <LinkIcon />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(note)}
              title="Delete note"
              aria-label="Delete note"
              className="
                min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] p-2 rounded-xl border
                flex items-center justify-center transition-all duration-200 ml-auto
                hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10
              "
              style={{
                backgroundColor: 'var(--surface-input)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)'
              }}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const noteShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string,
  content: PropTypes.string,
  category: PropTypes.string,
  taskStatus: PropTypes.string,
  isPublic: PropTypes.bool,
  isPinned: PropTypes.bool,
  shareToken: PropTypes.string,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
});

NoteCard.propTypes = {
  note: noteShape.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onShare: PropTypes.func,
  onView: PropTypes.func,
  onPin: PropTypes.func,
  onClick: PropTypes.func,
};

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

const ReadMoreIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

const PinIcon = ({ filled = false }) => (
  filled ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M16 4h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1l-1 5 2 2v2h-5v6l-1 1-1-1v-6H7v-2l2-2-1-5H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h1l1-3h6l1 3z"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1l-1 5 2 2v2h-5v6l-1 1-1-1v-6H7v-2l2-2-1-5H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h1l1-3h6l1 3z"/>
    </svg>
  )
);

PinIcon.propTypes = {
  filled: PropTypes.bool,
};

export default NoteCard;
