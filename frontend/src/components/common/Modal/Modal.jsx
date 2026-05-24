import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { openDialog, closeDialog } from '../../../utils/dialogUtils';

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText  = 'Confirm',
  cancelText   = 'Cancel',
  confirmStyle = 'danger',
}) => {
  const dialogRef = useRef(null);

  // Sonar: accessibility — native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      openDialog(dialog);
      document.body.style.overflow = 'hidden';
    } else if (!isOpen && dialog.open) {
      closeDialog(dialog);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        px-4 m-0 p-0
        w-full max-w-none max-h-none
        border-0 bg-transparent
      "
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
      onClose={onClose}
    >
      {/* Sonar: accessibility — backdrop close via semantic button, not dialog onClick */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm cursor-default"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className="
          relative z-10 w-full max-w-md
          bg-white dark:bg-[#141414]
          border border-gray-200/60 dark:border-white/[0.07]
          rounded-2xl
          shadow-2xl dark:shadow-black/60
          overflow-hidden
        "
      >
        <div className="flex items-center gap-3 px-6 pt-5 pb-4">
          <div className={`
            w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${confirmStyle === 'danger'
              ? 'bg-red-50 dark:bg-red-500/[0.1] border border-red-100 dark:border-red-500/[0.15]'
              : 'bg-indigo-50 dark:bg-indigo-500/[0.1] border border-indigo-100 dark:border-indigo-500/[0.15]'
            }
          `}>
            {confirmStyle === 'danger' ? <DangerIcon /> : <InfoIcon />}
          </div>

          <h2 id="modal-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/[0.05] mx-6" />

        <div className="px-6 py-4">
          <p id="modal-message" className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-2.5 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 rounded-xl text-sm font-medium
              border border-gray-200 dark:border-white/[0.08]
              text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-white/[0.06]
              hover:text-gray-900 dark:hover:text-gray-200
              hover:border-gray-300 dark:hover:border-white/[0.14]
              transition-all duration-200
            "
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className={`
              px-4 py-2 rounded-xl text-sm font-semibold
              transition-all duration-200
              ${confirmStyle === 'danger'
                ? `bg-red-500 hover:bg-red-400
                   dark:bg-red-600 dark:hover:bg-red-500
                   text-white
                   shadow-lg shadow-red-500/25 dark:shadow-red-500/20
                   hover:shadow-red-500/40
                   hover:-translate-y-px`
                : `bg-indigo-600 hover:bg-indigo-500
                   dark:bg-indigo-600 dark:hover:bg-indigo-500
                   text-white
                   shadow-lg shadow-indigo-500/25
                   hover:shadow-indigo-500/40
                   hover:-translate-y-px`
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmStyle: PropTypes.string,
};

const DangerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"    y2="8"/>
    <line x1="12" y1="12" x2="12"    y2="16"/>
  </svg>
);

export default Modal;
