import { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import RichTextEditor from './RichTextEditor';
import useSpeechToText from '../../../hooks/useSpeechToText';
import { NOTE_CATEGORIES, TASK_STATUSES, CATEGORY_INFO, TASK_STATUS_INFO } from '../../../utils/noteConstants';
import { stripHtmlTags } from '../../../utils/helpers';
import { openDialog, closeDialog } from '../../../utils/dialogUtils';

const NoteEditor = ({ note, onSave, onClose, loading }) => {
  const { handleSubmit, reset, formState: { errors } } = useForm();
  const dialogRef = useRef(null);
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [taskStatus, setTaskStatus] = useState('todo');
  const richTextEditorRef = useRef(null);

  const contentVoice = useSpeechToText();
  const previousInterimRef = useRef('');
  const previousFinalRef = useRef('');

  const titleVoice = useSpeechToText();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      openDialog(dialog);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (dialog?.open) closeDialog(dialog);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (note) {
      reset({ title: note.title });
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || 'general');
      setTaskStatus(note.taskStatus || 'todo');
    } else {
      reset({ title: '' });
      setTitle('');
      setContent('');
      setCategory('general');
      setTaskStatus('todo');
    }
    setContentError('');
  }, [note, reset]);

  useEffect(() => {
    if (!titleVoice.finalText) return;

    setTitle((prev) => {
      const updated = (prev + titleVoice.finalText).slice(0, 100);
      return updated;
    });
    titleVoice.resetFinalText();
    titleVoice.stopListening();
  }, [titleVoice.finalText]);

  useEffect(() => {
    if (!richTextEditorRef.current || !contentVoice.isListening) return;

    const editor = richTextEditorRef.current.getEditor?.();
    if (!editor) return;

    const currentInterim = contentVoice.interimText;
    const prevInterim = previousInterimRef.current;

    if (currentInterim.length > prevInterim.length) {
      const newText = currentInterim.slice(prevInterim.length);

      if (newText.trim()) {
        editor
          .chain()
          .focus()
          .insertContent(newText)
          .run();
      }

      previousInterimRef.current = currentInterim;
    }
  }, [contentVoice.interimText, contentVoice.isListening]);

  useEffect(() => {
    if (!contentVoice.finalText || !richTextEditorRef.current) return;

    const editor = richTextEditorRef.current.getEditor?.();
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertContent(' ')
      .run();

    previousInterimRef.current = '';
    previousFinalRef.current = contentVoice.finalText;
    contentVoice.resetFinalText();
  }, [contentVoice.finalText]);

  useEffect(() => {
    if (!contentVoice.isListening) {
      previousInterimRef.current = '';
    }
  }, [contentVoice.isListening]);

  const handleTitleVoiceToggle = useCallback(() => {
    if (titleVoice.isListening) {
      titleVoice.stopListening();
    } else {
      titleVoice.startListening();
    }
  }, [titleVoice]);

  const handleContentVoiceToggle = useCallback(() => {
    if (contentVoice.isListening) {
      contentVoice.stopListening();
    } else {
      contentVoice.startListening();
    }
  }, [contentVoice]);

  const onSubmit = (data) => {
    const plainText = stripHtmlTags(content).trim();
    if (!plainText) {
      setContentError('Content cannot be empty');
      return;
    }

    onSave({
      title: data.title || title || 'Untitled Note',
      content,
      category,
      taskStatus: category === 'task' ? taskStatus : undefined,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        px-3 sm:px-4 py-3 sm:py-6
        m-0 p-0 w-full max-w-none max-h-none
        border-0 bg-transparent
      "
      aria-labelledby="note-editor-heading"
      onClose={(event) => {
        // StrictMode cleanup can queue a close event before reopening the dialog.
        if (!event.currentTarget.open) onClose();
      }}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs cursor-default"
        aria-label="Close note editor"
        onClick={onClose}
      />

      {/* Editor Modal Window */}
      <div
        className="
          relative z-10 w-full max-w-2xl
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-2xl shadow-2xl
          flex flex-col
          max-h-[94vh] sm:max-h-[90vh]
          animate-in overflow-hidden
        "
      >
        {/* Modal Header */}
        <div className="
          flex items-center justify-between
          px-4 sm:px-6 py-3.5 sm:py-4
          border-b border-slate-100 dark:border-slate-800
          shrink-0
        ">
          <div className="flex items-center gap-2.5">
            <div className="
              w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs
              bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400
              border border-cyan-200 dark:border-cyan-800/60
            ">
              {note ? <EditIcon /> : <PlusIcon />}
            </div>
            <div>
              <h2 id="note-editor-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {note ? 'Edit Note' : 'Create New Note'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center
              text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-150
            "
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4 sm:px-6 py-4 overflow-y-auto flex-1"
        >
          {/* Note Title */}
          <div className="flex flex-col gap-1.5 relative">
            <label htmlFor="note-editor-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Note Title
            </label>

            {titleVoice.isListening && (
              <div className="flex items-center gap-1.5 py-0.5 text-rose-500">
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-rose-500 rounded-full animate-soundBar" style={{ height: '50%' }} />
                  <span className="w-1 bg-rose-500 rounded-full animate-soundBar" style={{ height: '100%', animationDelay: '0.15s' }} />
                  <span className="w-1 bg-rose-500 rounded-full animate-soundBar" style={{ height: '70%', animationDelay: '0.3s' }} />
                </span>
                <span className="text-xs font-semibold tracking-wide">
                  Listening for title...
                </span>
              </div>
            )}

            <div className="relative flex items-center group">
              <input
                id="note-editor-title"
                type="text"
                placeholder="Give your note a title..."
                value={title + titleVoice.interimText}
                onChange={(e) => {
                  setTitle(e.target.value.slice(0, 100));
                  reset({ title: e.target.value.slice(0, 100) }, { keepValues: true });
                }}
                className={`
                  w-full pr-11 pl-3.5 py-2.5 rounded-xl text-base font-semibold
                  bg-white dark:bg-slate-800/90
                  text-slate-900 dark:text-white
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none transition-all duration-200 border
                  ${titleVoice.isListening
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 group-hover:border-slate-300 dark:group-hover:border-slate-600'
                  }
                  ${errors.title ? 'border-rose-500' : ''}
                `}
              />

              {titleVoice.isSupported && (
                <button
                  type="button"
                  onClick={handleTitleVoiceToggle}
                  aria-label={titleVoice.isListening ? 'Stop voice input' : 'Start voice input'}
                  title={titleVoice.isListening ? 'Stop voice listening' : 'Speak title'}
                  className={`
                    absolute right-2 top-1/2 -translate-y-1/2
                    w-8 h-8 flex items-center justify-center rounded-lg
                    transition-all duration-200
                    ${titleVoice.isListening
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
                    }
                  `}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                </button>
              )}
            </div>

            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-rose-500">
                <ErrorIcon />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category Selector */}
          <fieldset className="flex flex-col gap-1.5 border-0 p-0 m-0">
            <legend className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category
            </legend>
            <div className="flex gap-2 flex-wrap">
              {NOTE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (cat !== 'task') {
                      setTaskStatus('todo');
                    }
                  }}
                  className={`
                    min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold
                    border transition-all duration-150 flex items-center gap-1.5
                    ${category === cat
                      ? 'border-cyan-600 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-400 hover:bg-cyan-50/40 dark:hover:bg-slate-750'
                    }
                  `}
                >
                  {CATEGORY_INFO[cat]?.icon} {CATEGORY_INFO[cat]?.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Task Status Selector (when Category is Task) */}
          {category === 'task' && (
            <fieldset className="flex flex-col gap-1.5 border-0 p-0 m-0">
              <legend className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Task Status
              </legend>
              <div className="flex gap-2 flex-wrap">
                {TASK_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTaskStatus(status)}
                    className={`
                      min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold
                      border transition-all duration-150 flex items-center gap-1.5
                      ${taskStatus === status
                        ? 'border-cyan-600 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-400 hover:bg-cyan-50/40 dark:hover:bg-slate-750'
                      }
                    `}
                  >
                    {TASK_STATUS_INFO[status]?.icon} {TASK_STATUS_INFO[status]?.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Note Content Editor */}
          <fieldset className="flex flex-col gap-1.5 border-0 p-0 m-0">
            <legend className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Content
            </legend>
            <div
              className={`
                rounded-xl overflow-hidden
                ${contentError ? 'ring-2 ring-rose-500/50' : ''}
              `}
            >
              <RichTextEditor
                ref={richTextEditorRef}
                content={content}
                onChange={(val) => {
                  setContent(val);
                  const plain = stripHtmlTags(val).trim();
                  if (plain) setContentError('');
                }}
                placeholder="Write your note here..."
                isTitleListening={titleVoice.isListening}
                onContentVoiceToggle={handleContentVoiceToggle}
                contentVoiceIsListening={contentVoice.isListening}
                contentVoiceIsSupported={contentVoice.isSupported}
              />
            </div>
            {contentError && (
              <p className="flex items-center gap-1 text-xs text-rose-500">
                <ErrorIcon />
                {contentError}
              </p>
            )}
          </fieldset>

          {/* Sticky Bottom Action Buttons */}
          <div className="flex gap-3 pt-3 pb-1 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 min-h-[44px] py-2.5 rounded-xl text-sm font-semibold
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-300
                bg-white dark:bg-slate-800
                hover:bg-slate-50 dark:hover:bg-slate-750
                hover:border-slate-300 dark:hover:border-slate-600
                transition-all duration-150
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 min-h-[44px] py-2.5 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500
                text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                shadow-sm hover:shadow-md transition-all duration-150
              "
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Note</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

NoteEditor.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    category: PropTypes.string,
    taskStatus: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default NoteEditor;
