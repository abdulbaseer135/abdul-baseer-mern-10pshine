import PropTypes from 'prop-types';

const NoFilterMatchState = ({ onResetFilters }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 backdrop-blur-xs my-6">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-teal-500/20 dark:from-cyan-500/20 dark:to-teal-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 shadow-sm border border-cyan-500/20">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    </div>
    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1.5">
      No notes match your active filter
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
      Try switching to all notes, clearing your search query, or selecting another category.
    </p>
    <button
      type="button"
      onClick={onResetFilters}
      className="
        min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold
        border border-slate-300 dark:border-slate-700
        bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
        hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400
        shadow-xs hover:shadow-sm transition-all duration-200
      "
    >
      Reset Filters
    </button>
  </div>
);

NoFilterMatchState.propTypes = {
  onResetFilters: PropTypes.func.isRequired,
};

export default NoFilterMatchState;
