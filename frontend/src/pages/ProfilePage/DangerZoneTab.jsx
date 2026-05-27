import PropTypes from 'prop-types';

const DangerZoneTab = ({ setDeleteModal }) => {
  // ✅ Safe handler for delete account action with error handling
  const handleDeleteClick = () => {
    try {
      if (!setDeleteModal || typeof setDeleteModal !== 'function') {
        console.warn('[DangerZoneTab] setDeleteModal function is not provided or not a function');
        return;
      }
      console.info('[DangerZoneTab] Delete account modal initiated by user');
      setDeleteModal(true);
    } catch (err) {
      console.error('[DangerZoneTab] Failed to open delete account modal:', {
        error: err?.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
  <div className="
    bg-white dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    rounded-lg p-6 sm:p-8 shadow-sm dark:shadow-lg dark:shadow-black/20
  ">
    <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="
          flex-shrink-0 w-8 h-8 rounded-full
          bg-red-100 dark:bg-red-900/30
          flex items-center justify-center
          border border-red-200 dark:border-red-700/50
        ">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 5v-1" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">
            Danger Zone
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Irreversible actions — proceed with extreme caution
          </p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="
        p-4 rounded-lg border-2
        bg-red-50/50 dark:bg-red-950/15
        border-red-300 dark:border-red-700/60
      ">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
              Delete Your Account
            </p>
            <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
              This will permanently delete your account and all associated data, including all your notes and settings. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDeleteClick}
        className="
          w-full px-4 py-3 rounded-md text-sm font-semibold
          bg-red-600 hover:bg-red-700 active:bg-red-800
          dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-800
          text-white shadow-sm dark:shadow-md dark:shadow-red-900/20
          border border-red-700 dark:border-red-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
          group flex items-center justify-center gap-2
        "
        aria-label="Delete account permanently - this action cannot be undone"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Delete Account Permanently</span>
      </button>

      <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-2">
        You will be asked to confirm this action
      </p>
    </div>
  </div>
  );
};

DangerZoneTab.propTypes = {
  setDeleteModal: PropTypes.func.isRequired,
};

export default DangerZoneTab;
