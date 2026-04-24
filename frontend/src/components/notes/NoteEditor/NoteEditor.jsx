import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import RichTextEditor from './RichTextEditor';

const NoteEditor = ({ note, onSave, onClose, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    if (note) {
      reset({ title: note.title });
      setContent(note.content || '');
    } else {
      reset({ title: '' });
      setContent('');
    }
    setContentError('');
  }, [note, reset]);

  const onSubmit = (data) => {
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (!plainText) {
      setContentError('Content is required');
      return;
    }
    setContentError('');
    onSave({ title: data.title, content });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {note ? '✏️ Edit Note' : '➕ New Note'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Note title..."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Rich Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <RichTextEditor
              content={content}
              onChange={(val) => {
                setContent(val);
                const plain = val.replace(/<[^>]+>/g, '').trim();
                if (plain) setContentError('');
              }}
              placeholder="Write your note here..."
            />
            {contentError && (
              <p className="text-red-500 text-xs mt-1">{contentError}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditor;