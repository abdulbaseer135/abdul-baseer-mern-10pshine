import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import RichTextEditor from './RichTextEditor';
import useSpeechToText from '../../../hooks/useSpeechToText';


const NoteEditor = ({ note, onSave, onClose, loading }) => {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const [content, setContent]           = useState('');
  const [contentError, setContentError] = useState('');
  const [title, setTitle]               = useState('');
  const richTextEditorRef              = useRef(null);

  // ✅ CONTENT VOICE — separate hook instance
  const contentVoice = useSpeechToText();
  const previousInterimRef = useRef(''); // Track previous interim to detect new words
  const previousFinalRef = useRef(''); // Track previous final to detect completion

  // ✅ TITLE VOICE — separate hook instance (never runs simultaneously)
  const titleVoice = useSpeechToText();

  useEffect(() => {
    if (note) {
      reset({ title: note.title });
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      reset({ title: '' });
      setTitle('');
      setContent('');
    }
    setContentError('');
  }, [note, reset]);

  // ═══════════════════════════════════════════════════════════════════
  // TITLE VOICE HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // ✅ Handle title FINAL text → commit to title state
  useEffect(() => {
    if (!titleVoice.finalText) return

    setTitle((prev) => {
      const updated = (prev + titleVoice.finalText).slice(0, 100)
      return updated
    })
    titleVoice.resetFinalText()
    titleVoice.stopListening() // auto-stop after sentence
  }, [titleVoice.finalText])

  // ═══════════════════════════════════════════════════════════════════
  // CONTENT VOICE HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // ✅ Handle content INTERIM text → append only NEW words, word-by-word
  useEffect(() => {
    if (!richTextEditorRef.current || !contentVoice.isListening) return;
    
    const editor = richTextEditorRef.current.getEditor?.();
    if (!editor) return;

    const currentInterim = contentVoice.interimText;
    const prevInterim = previousInterimRef.current;

    // Only append if interim text is longer than before (new words added)
    if (currentInterim.length > prevInterim.length) {
      // Find the new part by removing the old part
      const newText = currentInterim.slice(prevInterim.length);
      
      if (newText.trim()) {
        console.debug('[Voice] Appending interim:', newText);
        // Append WITHOUT formatting for smooth, clean display
        editor
          .chain()
          .focus()
          .insertContent(newText)
          .run();
      }
      
      previousInterimRef.current = currentInterim;
    }
  }, [contentVoice.interimText, contentVoice.isListening]);

  // ✅ Handle content FINAL text → commit with space and reset for next phrase
  useEffect(() => {
    if (!contentVoice.finalText || !richTextEditorRef.current) return;

    const editor = richTextEditorRef.current.getEditor?.();
    if (!editor) return;

    console.debug('[Voice] Final text:', contentVoice.finalText);
    
    // The final text has already been shown as interim, just add a space
    editor
      .chain()
      .focus()
      .insertContent(' ')
      .run();
    
    // Reset tracking for next phrase
    previousInterimRef.current = '';
    previousFinalRef.current = contentVoice.finalText;
    contentVoice.resetFinalText();
    console.debug('[Voice] Ready for next phrase');
  }, [contentVoice.finalText]);

  // ✅ Reset when voice listening stops
  useEffect(() => {
    if (!contentVoice.isListening) {
      previousInterimRef.current = '';
    }
  }, [contentVoice.isListening]);

  // ═══════════════════════════════════════════════════════════════════
  // VOICE BUTTON HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const handleTitleVoiceToggle = useCallback(() => {
    if (titleVoice.isListening) {
      titleVoice.stopListening()
    } else {
      // Stop content voice if running
      if (contentVoice.isListening) {
        if (richTextEditorRef.current?.stopContentVoice) {
          richTextEditorRef.current.stopContentVoice()
        }
        contentVoice.stopListening()
      }
      titleVoice.startListening()
    }
  }, [titleVoice.isListening, contentVoice.isListening])

  const handleContentVoiceToggle = useCallback(() => {
    if (contentVoice.isListening) {
      // Stop listening and reset
      contentVoice.stopListening()
      previousInterimRef.current = ''
    } else {
      // Stop title voice if running
      if (titleVoice.isListening) {
        titleVoice.stopListening()
      }
      previousInterimRef.current = ''
      contentVoice.startListening()
    }
  }, [contentVoice.isListening, titleVoice.isListening])

  const onSubmit = (data) => {
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (!plainText) { setContentError('Content is required'); return; }
    setContentError('');
    onSave({ title: title || data.title, content });
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

            {/* Floating animated label while listening */}
            {titleVoice.isListening && (
              <div className="absolute -top-6 left-0 flex items-center gap-1.5 pt-2">
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" 
                    style={{ height: '40%', animationDelay: '0s' }} />
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" 
                    style={{ height: '100%', animationDelay: '0.15s' }} />
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" 
                    style={{ height: '60%', animationDelay: '0.3s' }} />
                  <span className="w-0.5 bg-red-500 rounded-full animate-bar1" 
                    style={{ height: '80%', animationDelay: '0.45s' }} />
                </span>
                <span className="text-xs font-medium text-red-500 tracking-wide">
                  Listening for title...
                </span>
              </div>
            )}

            {/* Title input with voice mic button */}
            <div className="relative flex items-center group">
              <input
                type="text"
                placeholder="Give your note a title..."
                value={title + titleVoice.interimText}
                onChange={(e) => {
                  setTitle(e.target.value.slice(0, 100));
                  reset({ title: e.target.value.slice(0, 100) }, { keepValues: true });
                }}
                className={`
                  w-full pr-12 pl-4 py-3 rounded-xl text-base font-semibold
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none
                  transition-all duration-300
                  border-2
                  ${titleVoice.isListening
                    ? 'border-red-400 dark:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] dark:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] bg-red-50/30 dark:bg-red-900/10'
                    : `border-gray-200 dark:border-gray-700
                       focus:border-indigo-400 dark:focus:border-indigo-500
                       group-hover:border-gray-300 dark:group-hover:border-gray-600`
                  }
                  ${errors.title ? 'border-red-400 dark:border-red-500' : ''}
                `}
              />

              {/* Voice mic button inside input (modern design) */}
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
                ref={richTextEditorRef}
                content={content}
                onChange={(val) => {
                  setContent(val);
                  const plain = val.replace(/<[^>]+>/g, '').trim();
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
