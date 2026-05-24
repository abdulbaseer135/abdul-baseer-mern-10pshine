import PropTypes from 'prop-types';

const NoFilterMatchState = ({ onResetFilters }) => (
  <div className="text-center py-12">
    <p className="text-5xl mb-3">✨</p>
    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
      No notes match your filters
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
      Try adjusting your search or filter
    </p>
    <button
      type="button"
      onClick={onResetFilters}
      className="
        px-3 py-1.5 rounded-md text-sm font-medium
        border border-slate-300 dark:border-slate-600
        text-slate-700 dark:text-slate-300
        hover:bg-slate-50 dark:hover:bg-slate-700
        transition-all duration-150
      "
    >
      Reset filters
    </button>
  </div>
);

NoFilterMatchState.propTypes = {
  onResetFilters: PropTypes.func.isRequired,
};

export default NoFilterMatchState;
