import PropTypes from 'prop-types';

// Sort options with labels
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

/**
 * Dashboard controls for search, sort, and filter
 * Extracted to reduce DashboardPage complexity
 */
const DashboardControls = ({
  searchInput,
  setSearchInput,
  sortBy,
  setSortBy,
  currentFilter,
  setCurrentFilter,
  onExport,
  onImportClick,
  importRef,
  exporting,
  importing,
  FILTER_OPTIONS,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-3">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search notes..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-gray-50 dark:bg-white/[0.04]
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-700
          border border-gray-200 dark:border-white/[0.08]
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          transition-all duration-200
        "
      />

      {/* Controls: Filter | Sort | Export | Import */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Filter Dropdown */}
        <select
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value)}
          className="
            px-3 py-2 rounded-lg text-sm font-medium
            bg-gray-50 dark:bg-white/[0.04]
            border border-gray-200 dark:border-white/[0.08]
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            transition-all duration-200 cursor-pointer
          "
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="
            px-3 py-2 rounded-lg text-sm font-medium
            bg-gray-50 dark:bg-white/[0.04]
            border border-gray-200 dark:border-white/[0.08]
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            transition-all duration-200 cursor-pointer
          "
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={exporting}
          className="
            px-3 py-2 rounded-lg text-sm font-medium
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            dark:bg-blue-500 dark:hover:bg-blue-600
            text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {exporting ? 'Exporting...' : 'Export'}
        </button>

        {/* Import Button */}
        <button
          onClick={() => importRef.current?.click()}
          disabled={importing}
          className="
            px-3 py-2 rounded-lg text-sm font-medium
            bg-green-600 hover:bg-green-700 active:bg-green-800
            dark:bg-green-500 dark:hover:bg-green-600
            text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {importing ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  );
};

DashboardControls.propTypes = {
  searchInput: PropTypes.string.isRequired,
  setSearchInput: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  currentFilter: PropTypes.string.isRequired,
  setCurrentFilter: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onImportClick: PropTypes.func,
  importRef: PropTypes.object,
  exporting: PropTypes.bool,
  importing: PropTypes.bool,
  FILTER_OPTIONS: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
};

export default DashboardControls;
