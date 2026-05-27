import PropTypes from 'prop-types';

const PaginationControls = ({ page, totalPages, onPageChange }) => (
  <div className="flex justify-center gap-2 mt-6">
    <button
      type="button"
      onClick={() => onPageChange(Math.max(page - 1, 1))}
      disabled={page === 1}
      className="
        px-3 py-1.5 rounded-md text-sm font-medium
        border border-slate-300 dark:border-slate-600
        text-slate-700 dark:text-slate-300
        hover:bg-slate-50 dark:hover:bg-slate-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150
      "
    >← Prev</button>
    <span className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
      Page {page} of {totalPages}
    </span>
    <button
      type="button"
      onClick={() => onPageChange(Math.min(page + 1, totalPages))}
      disabled={page === totalPages}
      className="
        px-3 py-1.5 rounded-md text-sm font-medium
        border border-slate-300 dark:border-slate-600
        text-slate-700 dark:text-slate-300
        hover:bg-slate-50 dark:hover:bg-slate-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150
      "
    >Next →</button>
  </div>
);

PaginationControls.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default PaginationControls;
