import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import RichTextEditor from './RichTextEditor';


const NoteEditor = ({ note, onSave, onClose, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [content, setContent]           = useState('');
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
    if (!plainText) { setContentError('Content is required'); return; }
    setContentError('');
    onSave({ title: data.title, content });
  };


  return (
    /* ─── Backdrop ──────────────────────────────────── */
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        px-4 py-6
        bg-black/50 dark:bg-black/70
        backdrop-blur-sm
      "
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >

      {/* ─── Modal Panel ─────────────────────────────── */}
      <div className="
        w-full max-w-2xl
        bg-white dark:bg-[#141414]
        border border-gray-200/60 dark:border-white/[0.07]
        rounded-2xl shadow-2xl dark:shadow-black/60
        flex flex-col
        max-h-[90vh]
        animate-in
      ">

        {/* ─── Header ──────────────────────────────────── */}
        <div className="
          flex items-center justify-between
          px-6 py-4
          border-b border-gray-100 dark:border-white/[0.06]
          shrink-0
        ">
          <div className="flex items-center gap-2.5">
            {/* Icon badge */}
            <div className="
              w-8 h-8 rounded-xl flex items-center justify-center
              bg-indigo-50 dark:bg-indigo-500/[0.12]
              border border-indigo-100 dark:border-indigo-500/[0.15]
            ">
              {note ? <EditIcon /> : <PlusIcon />}
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {note ? 'Edit Note' : 'New Note'}
            </h2>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="
              w-8 h-8 rounded-xl flex items-center justify-center
              text-gray-400 dark:text-gray-600
              hover:text-gray-700 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-white/[0.07]
              border border-transparent
              hover:border-gray-200 dark:hover:border-white/[0.08]
              transition-all duration-200
            "
          >
            <CloseIcon />
          </button>
        </div>

        {/* ─── Form Body ───────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-5 overflow-y-auto"
        >

          {/* Title field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider
              text-gray-400 dark:text-gray-600">
              Title
            </label>
            <input
              type="text"
              placeholder="Give your note a title..."
              className={`
                w-full px-4 py-2.5 rounded-xl text-sm
                bg-gray-50 dark:bg-white/[0.04]
                border ${errors.title
                  ? 'border-red-400 dark:border-red-500/60 focus:ring-red-400/20 dark:focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-white/[0.08] focus:border-indigo-400 dark:focus:border-indigo-500/60'
                }
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-700
                focus:outline-none focus:ring-3
                focus:ring-indigo-400/15 dark:focus:ring-indigo-500/20
                transition-all duration-200
              `}
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                <ErrorIcon />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider
              text-gray-400 dark:text-gray-600">
              Content
            </label>
            <div className={`
              rounded-xl overflow-hidden
              border transition-all duration-200
              ${contentError
                ? 'border-red-400 dark:border-red-500/60'
                : 'border-gray-200 dark:border-white/[0.08]'
              }
              bg-gray-50 dark:bg-white/[0.03]
              focus-within:border-indigo-400 dark:focus-within:border-indigo-500/60
              focus-within:ring-3 focus-within:ring-indigo-400/15 dark:focus-within:ring-indigo-500/20
            `}>
              <RichTextEditor
                content={content}
                onChange={(val) => {
                  setContent(val);
                  const plain = val.replace(/<[^>]+>/g, '').trim();
                  if (plain) setContentError('');
                }}
                placeholder="Write your note here..."
              />
            </div>
            {contentError && (
              <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                <ErrorIcon />
                {contentError}
              </p>
            )}
          </div>

          {/* ─── Footer Buttons ──────────────────────── */}
          <div className="flex gap-3 pt-1 pb-1">

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-medium
                border border-gray-200 dark:border-white/[0.08]
                text-gray-600 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-white/[0.06]
                hover:text-gray-900 dark:hover:text-gray-200
                hover:border-gray-300 dark:hover:border-white/[0.14]
                transition-all duration-200
              "
            >
              Cancel
            </button>

            {/* Save / Update */}
            <button
              type="submit"
              disabled={loading}
              className="
                btn-primary
                flex-1 py-2.5 rounded-xl text-sm font-semibold
                bg-indigo-600 hover:bg-indigo-500
                dark:bg-indigo-600 dark:hover:bg-indigo-500
                text-white
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-lg shadow-indigo-500/25
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving...
                </>
              ) : note ? 'Update Note' : 'Create Note'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};


/* ─── Icons ──────────────────────────────────────────── */

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5"  y1="12" x2="19" y2="12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);


export default NoteEditor;