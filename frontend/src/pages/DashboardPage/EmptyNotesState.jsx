import PropTypes from 'prop-types';

const EmptyNotesState = ({ searchInput, onAddNote }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 backdrop-blur-xs my-6">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-teal-500/20 dark:from-cyan-500/20 dark:to-teal-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 shadow-sm border border-cyan-500/20">
      {searchInput ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      )}
    </div>

    {searchInput ? (
      <>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1.5">
          No notes match &ldquo;{searchInput}&rdquo;
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Try searching for different keywords, categories, or clear your query.
        </p>
      </>
    ) : (
      <>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1.5">
          Your notebook is empty
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
          Capture your thoughts, daily plans, tasks, and ideas in a clean, distraction-free space.
        </p>
        <button
          type="button"
          onClick={onAddNote}
          className="
            min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800
            dark:bg-cyan-500 dark:hover:bg-cyan-600
            text-white shadow-sm hover:shadow-md transition-all duration-200
            flex items-center gap-2
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Create Note</span>
        </button>
      </>
    )}
  </div>
);

EmptyNotesState.propTypes = {
  searchInput: PropTypes.string,
  onAddNote: PropTypes.func,
};

export default EmptyNotesState;
