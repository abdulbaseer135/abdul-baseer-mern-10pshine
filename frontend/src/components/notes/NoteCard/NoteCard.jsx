import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { CATEGORY_INFO, TASK_STATUS_INFO } from '../../../utils/noteConstants';

// Sonar: extracted helper functions to reduce cognitive complexity

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

const stripHtml = (html) => html.replaceAll(/<[^>]*>/g, '');

const getShareUrl = (note) => 
  note.isPublic && note.shareToken
    ? `${globalThis.location?.origin}/shared/${note.shareToken}`
    : null;

// Sonar: extracted style getter to avoid repeated inline computations
const getDefaultButtonStyles = () => ({
  backgroundColor: 'var(--surface-input)',
  borderColor: 'var(--border-default)',
  color: 'var(--text-secondary)',
});

const getHoverButtonStyles = () => ({
  backgroundColor: 'var(--surface-hover)',
  borderColor: 'var(--border-strong)',
  color: 'var(--text-primary)',
});

// Sonar: extracted button hover handler to reduce repetitive code
const applyButtonHoverStyles = (element, hoverStyles) => {
  Object.assign(element.style, hoverStyles);
};

const applyButtonDefaultStyles = (element, defaultStyles) => {
  Object.assign(element.style, defaultStyles);
};

// Sonar: extracted common button handler logic
const createButtonHoverHandlers = (defaultStyles, hoverStyles) => ({
  onMouseEnter: (e) => applyButtonHoverStyles(e.currentTarget, hoverStyles),
  onMouseLeave: (e) => applyButtonDefaultStyles(e.currentTarget, defaultStyles),
});

// Sonar: extracted ActionButton subcomponent for standard buttons
const ActionButton = ({ 
  onClick, title, ariaLabel, icon: Icon, defaultStyles, hoverStyles 
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={ariaLabel}
    className="p-1.5 rounded-md transition-all duration-200 border hover:shadow-md"
    style={defaultStyles}
    {...createButtonHoverHandlers(defaultStyles, hoverStyles)}
  >
    <Icon />
  </button>
);

ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  defaultStyles: PropTypes.object.isRequired,
  hoverStyles: PropTypes.object.isRequired,
};

const NoteCard = ({ note, onEdit, onDelete, onShare, onView, onPin }) => {
  const plainTextContent = stripHtml(note.content || '');
  const shareUrl = getShareUrl(note);
  
  const defaultButtonStyles = getDefaultButtonStyles();
  const hoverButtonStyles = getHoverButtonStyles();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  // Sonar: extracted badge rendering to reduce main component complexity
  const renderCategoryBadge = () => {
    if (!note.category) return null;
    return (
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
    );
  };

  const renderTaskStatusBadge = () => {
    if (note.category !== 'task' || !note.taskStatus) return null;
    return (
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
    );
  };

  const renderPublicBadge = () => {
    if (!note.isPublic) return null;
    return (
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
        {'\u00A0'}Public
      </span>
    );
  };

  // Sonar: extracted pin button with special styling logic
  const renderPinButton = () => {
    if (!onPin) return null;
    const pinButtonStyles = note.isPinned
      ? {
          backgroundColor: 'rgba(250, 204, 21, 0.15)',
          borderColor: 'var(--warning-primary)',
          color: 'var(--warning-primary)',
        }
      : defaultButtonStyles;
    
    return (
      <button
        type="button"
        onClick={() => onPin(note._id)}
        title={note.isPinned ? 'Unpin note' : 'Pin note'}
        aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
        className="p-1.5 rounded-md border transition-all duration-200 hover:shadow-md"
        style={pinButtonStyles}
        onMouseEnter={(e) => {
          if (!note.isPinned) {
            applyButtonHoverStyles(e.currentTarget, hoverButtonStyles);
          }
        }}
        onMouseLeave={(e) => {
          if (!note.isPinned) {
            applyButtonDefaultStyles(e.currentTarget, defaultButtonStyles);
          }
        }}
      >
        <PinIcon filled={note.isPinned} />
      </button>
    );
  };

  // Sonar: extracted copy link button with condition guards
  const renderCopyLinkButton = () => {
    const isEnabled = note.isPublic && shareUrl;
    const buttonStyles = isEnabled ? defaultButtonStyles : { ...defaultButtonStyles, opacity: 0.4 };
    
    return (
      <button
        type="button"
        onClick={() => isEnabled && handleCopyLink()}
        disabled={!isEnabled}
        title={isEnabled ? 'Copy share link' : 'Share note first'}
        aria-label={isEnabled ? 'Copy share link' : 'Share note first'}
        className={`p-1.5 rounded-md border transition-all duration-200 hover:shadow-md ${isEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        style={buttonStyles}
        onMouseEnter={(e) => {
          if (isEnabled) {
            applyButtonHoverStyles(e.currentTarget, hoverButtonStyles);
          }
        }}
        onMouseLeave={(e) => {
          if (isEnabled) {
            applyButtonDefaultStyles(e.currentTarget, defaultButtonStyles);
          }
        }}
      >
        <LinkIcon />
      </button>
    );
  };

  // Sonar: extracted delete button with danger styling
  const renderDeleteButton = () => {
    const deleteStyles = { ...defaultButtonStyles };
    const deleteHoverStyles = {
      backgroundColor: 'rgba(255, 107, 107, 0.15)',
      borderColor: 'var(--danger-primary)',
      color: 'var(--danger-primary)',
    };
    
    return (
      <button
        type="button"
        onClick={() => onDelete(note._id)}
        title="Delete note"
        aria-label="Delete note"
        className="p-1.5 rounded-md border transition-all duration-200 hover:shadow-md"
        style={deleteStyles}
        {...createButtonHoverHandlers(deleteStyles, deleteHoverStyles)}
      >
        <TrashIcon />
      </button>
    );
  };

  // Sonar: extracted share toggle button
  const renderShareButton = () => {
    if (!onShare) return null;
    return (
      <button
        type="button"
        onClick={() => onShare(note._id)}
        title={note.isPublic ? 'Disable sharing' : 'Share note'}
        aria-label={note.isPublic ? 'Disable sharing' : 'Share note'}
        className="p-1.5 rounded-md border transition-all duration-200 hover:shadow-md"
        style={defaultButtonStyles}
        {...createButtonHoverHandlers(defaultButtonStyles, hoverButtonStyles)}
      >
        <ShareIcon />
      </button>
    );
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
        boxShadow: 'var(--shadow-sm)',
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

      {/* ─── Metadata Badges — Extracted to reduce complexity ────────────────────────────── */}
      <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
        {renderCategoryBadge()}
        {renderTaskStatusBadge()}
        {renderPublicBadge()}
      </div>

      {/* ─── Divider ────────────────────────────────────── */}
      <div 
        className="border-t mb-3" 
        style={{ borderColor: 'var(--border-subtle)' }} 
      />

      {/* ─── Action Buttons — Extracted renders to reduce complexity ──── */}
      <div className="flex gap-1 justify-start flex-wrap">
        
        {/* View Full Note */}
        <ActionButton
          onClick={() => onView(note)}
          title="View full note"
          ariaLabel="View full note"
          icon={ReadMoreIcon}
          defaultStyles={defaultButtonStyles}
          hoverStyles={hoverButtonStyles}
        />

        {/* Edit Note */}
        <ActionButton
          onClick={() => onEdit(note)}
          title="Edit note"
          ariaLabel="Edit note"
          icon={EditIcon}
          defaultStyles={defaultButtonStyles}
          hoverStyles={hoverButtonStyles}
        />

        {/* Pin Button */}
        {renderPinButton()}

        {/* Delete Note */}
        {renderDeleteButton()}

        {/* Share Toggle */}
        {renderShareButton()}

        {/* Copy Share Link */}
        {renderCopyLinkButton()}
      </div>

    </div>
  );
};


/* ─── SVG Icons ────────────────────────────────────── */

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
};

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

const ReadMoreIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// ✅ PR 2: Pin Icon
const PinIcon = ({ filled = false }) => (
  filled ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M12 2c-5.33 4-8 6.5-8 9.5 0 3 2.5 5 8 5s8-2 8-5c0-3-2.67-5.5-8-9.5z"/>
      <circle cx="12" cy="19" r="3" fill="currentColor"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-5.33 4-8 6.5-8 9.5 0 3 2.5 5 8 5s8-2 8-5c0-3-2.67-5.5-8-9.5z"/>
      <circle cx="12" cy="19" r="3"/>
    </svg>
  )
);

PinIcon.propTypes = {
  filled: PropTypes.bool,
};

export default NoteCard;
