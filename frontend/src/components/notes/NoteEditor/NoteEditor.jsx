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
  const [content, setContent]           = useState('');
  const [contentError, setContentError] = useState('');
  const [title, setTitle]               = useState('');
  const [category, setCategory]         = useState('general');
  const [taskStatus, setTaskStatus]     = useState('todo');
  const richTextEditorRef               = useRef(null);

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
        console.debug('[Voice] Appending interim:', newText);
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

    console.debug('[Voice] Final text:', contentVoice.finalText);

    editor
      .chain()
      .focus()
      .insertContent(' ')
      .run();

    previousInterimRef.current = '';
    previousFinalRef.current = contentVoice.finalText;
    contentVoice.resetFinalText();
    console.debug('[Voice] Ready for next phrase');
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
      if (contentVoice.isListening) {
        if (richTextEditorRef.current?.stopContentVoice) {
          richTextEditorRef.current.stopContentVoice();
        }
        contentVoice.stopListening();
      }
      titleVoice.startListening();
    }
  }, [titleVoice, contentVoice]);

  const handleContentVoiceToggle = useCallback(() => {
    if (contentVoice.isListening) {
      contentVoice.stopListening();
      previousInterimRef.current = '';
    } else {
      if (titleVoice.isListening) {
        titleVoice.stopListening();
      }
      previousInterimRef.current = '';
      contentVoice.startListening();
    }
  }, [contentVoice, titleVoice]);

  const onSubmit = (data) => {
    const plainText = stripHtmlTags(content).trim();
    if (!plainText) {
      setContentError('Content is required');
      return;
    }
    setContentError('');

    const noteData = {
      title: title || data.title,
      content,
      category,
      isPinned: note?.isPinned || false,
    };

    if (category === 'task') {
      noteData.taskStatus = taskStatus;
    }

    onSave(noteData);
  };

  let saveButtonLabel = 'Create Note';
  if (note) {
    saveButtonLabel = 'Update Note';
  }

  return (
    <dialog
      ref={dialogRef}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        px-3 sm:px-4 py-4 sm:py-6
        m-0 p-0 w-full max-w-none max-h-none
        border-0 bg-transparent
      "
      aria-labelledby="note-editor-heading"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm cursor-default"
        aria-label="Close note editor"
        onClick={onClose}
      />
      <div
        className="
          relative z-10 w-full max-w-2xl
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          rounded-lg sm:rounded-xl shadow-xl dark:shadow-black/40
          flex flex-col
          max-h-[92vh] sm:max-h-[90vh]
          animate-in
        "
      >
        <div className="
          flex items-center justify-between
          px-4 sm:px-5 py-3 sm:py-3
          border-b border-slate-200 dark:border-slate-700
          shrink-0
        ">
          <div className="flex items-center gap-2">
            <div className="
              w-8 h-8 rounded-md flex items-center justify-center text-xs
              bg-indigo-100 dark:bg-indigo-950
              border border-indigo-200 dark:border-indigo-800
            ">
              {note ? <EditIcon /> : <PlusIcon />}
            </div>
            <h2 id="note-editor-heading" className="text-sm font-semibold text-slate-900 dark:text-white">
              {note ? 'Edit Note' : 'New Note'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              w-8 h-8 rounded-md flex items-center justify-center text-xs
              text-slate-500 dark:text-slate-400
              hover:text-slate-700 dark:hover:text-slate-200
              hover:bg-slate-100 dark:hover:bg-slate-700
              border border-transparent
              transition-all duration-150
            "
          >
            <CloseIcon />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 px-4 sm:px-5 py-3 sm:py-4 overflow-y-auto"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="note-editor-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Title
            </label>

            {titleVoice.isListening && (
              <div className="absolute -top-6 left-0 flex items-center gap-1.5 pt-2">
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" style={{ height: '40%', animationDelay: '0s' }} />
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" style={{ height: '100%', animationDelay: '0.15s' }} />
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" style={{ height: '60%', animationDelay: '0.3s' }} />
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" style={{ height: '80%', animationDelay: '0.45s' }} />
                </span>
                <span className="text-xs font-medium text-red-500 tracking-wide">
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
                  w-full pr-10 pl-3 py-2 rounded-md text-base font-semibold
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none
                  transition-all duration-200
                  border
                  ${titleVoice.isListening
                    ? 'border-red-500 dark:border-red-500 shadow-sm shadow-red-500/10 dark:shadow-red-500/10 bg-red-50/30 dark:bg-red-950/20'
                    : `border-slate-300 dark:border-slate-600
                       focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                       group-hover:border-slate-400 dark:group-hover:border-slate-500`
                  }
                  ${errors.title ? 'border-red-500 dark:border-red-500' : ''}
                `}
              />

              {titleVoice.isSupported && (
                <button
                  type="button"
                  onClick={handleTitleVoiceToggle}
                  aria-label={titleVoice.isListening ? 'Stop voice input' : 'Start voice input'}
                  className={`
                    absolute right-3 top-1/2 -translate-y-1/2
                    w-8 h-8 flex items-center justify-center rounded-full
                    text-gray-400 hover:text-indigo-500
                    hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                    transition-all duration-200 hover:scale-110
                    ${titleVoice.isListening
                      ? 'bg-red-500 text-white scale-110 shadow-[0_0_0_0_rgba(239,68,68,1)] animate-[voicePulse_1.2s_cubic-bezier(0.4,0,0.6,1)_infinite]'
                      : ''
                    }
                  `}
                >
                  {titleVoice.isListening ? '🛑' : '🎤'}
                </button>
              )}
            </div>

            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
                <ErrorIcon />
                {errors.title.message}
              </p>
            )}
          </div>

          <fieldset className="flex flex-col gap-1 border-0 p-0 m-0">
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
                    px-3 py-1.5 rounded-md text-xs font-semibold
                    border transition-all duration-150
                    ${category === cat
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  {CATEGORY_INFO[cat].icon} {CATEGORY_INFO[cat].label}
                </button>
              ))}
            </div>
          </fieldset>

          {category === 'task' && (
            <fieldset className="flex flex-col gap-1 border-0 p-0 m-0">
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
                      px-3 py-1.5 rounded-md text-xs font-semibold
                      border transition-all duration-150
                      ${taskStatus === status
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-600'
                      }
                    `}
                  >
                    {TASK_STATUS_INFO[status].icon} {TASK_STATUS_INFO[status].label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="flex flex-col gap-1 border-0 p-0 m-0">
            <legend className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Content
            </legend>
            <div
              className={`
              rounded-md overflow-hidden
              border transition-all duration-150
              ${contentError
                ? 'border-red-500 dark:border-red-500'
                : 'border-slate-300 dark:border-slate-600'
              }
              bg-white dark:bg-slate-700
              focus-within:border-indigo-500 dark:focus-within:border-indigo-400
              focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:ring-indigo-400/20
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
              <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
                <ErrorIcon />
                {contentError}
              </p>
            )}
          </fieldset>

          <div className="flex gap-2 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 py-2 rounded-md text-sm font-medium
                border border-slate-300 dark:border-slate-600
                text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700
                hover:border-slate-400 dark:hover:border-slate-500
                transition-all duration-150
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 py-2 rounded-md text-sm font-semibold
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                dark:bg-indigo-500 dark:hover:bg-indigo-600
                text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                transition-all duration-150
              "
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : saveButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const editorNoteShape = PropTypes.shape({
  title: PropTypes.string,
  content: PropTypes.string,
  category: PropTypes.string,
  taskStatus: PropTypes.string,
  isPinned: PropTypes.bool,
});

NoteEditor.propTypes = {
  note: editorNoteShape,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default NoteEditor;