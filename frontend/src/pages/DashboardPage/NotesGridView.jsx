import PropTypes from 'prop-types';
import NoteCard from '../../components/notes/NoteCard/NoteCard';

const noteShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string,
  content: PropTypes.string,
  category: PropTypes.string,
  taskStatus: PropTypes.string,
  isPinned: PropTypes.bool,
  isPublic: PropTypes.bool,
});

const NotesGridView = ({ visibleNotes, isSearching, onEdit, onDelete, onView, onPin, onShare }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}>
    {visibleNotes.map((note) => (
      <NoteCard
        key={note._id}
        note={note}
        onEdit={() => onEdit(note)}
        onDelete={() => onDelete(note)}
        onView={() => onView(note)}
        onPin={onPin}
        onShare={onShare}
      />
    ))}
  </div>
);

NotesGridView.propTypes = {
  visibleNotes: PropTypes.arrayOf(noteShape).isRequired,
  isSearching: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onPin: PropTypes.func,
  onShare: PropTypes.func,
};

export default NotesGridView;
