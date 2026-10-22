import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { openDialog, closeDialog } from '../../../utils/dialogUtils';

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'danger',
}) => {
  const dialogRef = useRef(null);

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
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs cursor-default"
        aria-label="Close modal"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="
          relative z-10 w-full max-w-md
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-2xl
          shadow-2xl
          overflow-hidden animate-in
        "
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${confirmStyle === 'danger'
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400'
              : 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400'
            }
          `}>
            {confirmStyle === 'danger' ? <DangerIcon /> : <InfoIcon />}
          </div>

          <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>

        <div className="px-6 py-2">
          <p id="modal-message" className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 pt-4 pb-6 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="
              min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold
              border border-slate-200 dark:border-slate-700
              text-slate-700 dark:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-150
            "
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className={`
              min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold
              transition-all duration-150 shadow-sm
              ${confirmStyle === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow-md'
                : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white hover:shadow-md'
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12" y2="8"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);

export default Modal;
