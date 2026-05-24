import PropTypes from 'prop-types';

const EmptyNotesState = ({ searchInput, onAddNote }) => (
  <div className="text-center py-12">
    <p className="text-5xl mb-3">📝</p>
    {searchInput ? (
      <>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
          No notes found
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Try a different search term
        </p>
      </>
    ) : (
      <>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
          No notes yet
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Create your first note to get started
        </p>
        <button
          type="button"
          onClick={onAddNote}
          className="
            px-3 py-1.5 rounded-md text-sm font-semibold
            bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
            dark:bg-indigo-500 dark:hover:bg-indigo-600
            text-white transition-all duration-150
          "
        >
          + New Note
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
