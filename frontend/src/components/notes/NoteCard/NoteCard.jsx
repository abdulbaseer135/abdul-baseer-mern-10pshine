const NoteCard = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {note.title}
        </h3>
        <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
          {formatDate(note.updatedAt || note.createdAt)}
        </span>
      </div>

      {/* ✅ Renders bold, italic, lists correctly */}
      <div
        className="text-sm text-gray-600 line-clamp-3 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: note.content || 'No content' }}
      />

      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
        <button
          onClick={() => onEdit(note)}
          className="flex-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg transition"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(note._id)}
          className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-500 font-medium py-2 rounded-lg transition"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;