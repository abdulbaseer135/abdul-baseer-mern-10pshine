import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const MenuBar = ({ editor, onVoiceToggle, isVoiceListening, isVoiceSupported, isTitleListening }) => {
  if (!editor) return null;

  const canUseVoice = !isTitleListening;

  let voiceButtonClassName = 'text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-slate-700';
  if (!canUseVoice) {
    voiceButtonClassName = 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500';
  } else if (isVoiceListening) {
    voiceButtonClassName = 'text-white bg-rose-500 border border-rose-600 shadow-sm shadow-rose-500/30';
  }

  const toolbarBtnClass = (isActive) => `
    min-w-[32px] min-h-[32px] sm:min-w-[30px] sm:min-h-[30px] px-2 py-1 text-xs rounded-lg transition-all duration-150 font-semibold flex items-center justify-center
    ${isActive
      ? 'bg-cyan-600 dark:bg-cyan-500 text-white shadow-xs'
      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-600'
    }
  `;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 rounded-t-xl">
      {/* Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={toolbarBtnClass(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={toolbarBtnClass(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={toolbarBtnClass(editor.isActive('strike'))}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <s>S</s>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={toolbarBtnClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
        aria-label="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toolbarBtnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
        aria-label="Heading 2"
      >
        H2
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={toolbarBtnClass(editor.isActive('bulletList'))}
        title="Bullet list"
        aria-label="Bullet list"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="6" x2="20" y2="6"/>
          <line x1="9" y1="12" x2="20" y2="12"/>
          <line x1="9" y1="18" x2="20" y2="18"/>
          <circle cx="4" cy="6" r="2"/>
          <circle cx="4" cy="12" r="2"/>
          <circle cx="4" cy="18" r="2"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={toolbarBtnClass(editor.isActive('orderedList'))}
        title="Numbered list"
        aria-label="Numbered list"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="6" x2="21" y2="6"/>
          <line x1="10" y1="12" x2="21" y2="12"/>
          <line x1="10" y1="18" x2="21" y2="18"/>
          <path d="M4 6h1v4"/>
          <path d="M4 10h2"/>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={toolbarBtnClass(editor.isActive('blockquote'))}
        title="Blockquote"
        aria-label="Blockquote"
      >
        &ldquo;
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={toolbarBtnClass(false)}
        title="Divider"
        aria-label="Divider line"
      >
        ―
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${toolbarBtnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"/>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${toolbarBtnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"/>
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
        </svg>
      </button>

      {/* Voice Input */}
      {isVoiceSupported && (
        <>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
          <button
            type="button"
            onClick={onVoiceToggle}
            disabled={!canUseVoice}
            aria-label={isVoiceListening ? 'Stop voice input' : 'Start voice input'}
            title={isTitleListening ? 'Stop title voice to use content voice' : 'Speech to text'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${voiceButtonClassName}`}
          >
            {isVoiceListening ? (
              <>
                <span className="flex items-end gap-[2px] h-3">
                  {[
                    { delay: 0, height: '40%' },
                    { delay: 0.15, height: '70%' },
                    { delay: 0.3, height: '100%' },
                    { delay: 0.15, height: '70%' },
                    { delay: 0, height: '40%' },
                  ].map((bar, i) => (
                    <span
                      key={`voice-bar-${i}`}
                      className="w-[2px] bg-white rounded-full animate-soundBar"
                      style={{
                        animationDelay: `${bar.delay}s`,
                        height: bar.height,
                      }}
                    />
                  ))}
                </span>
                <span>Listening</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
                <span>Voice</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

MenuBar.propTypes = {
  editor: PropTypes.shape({
    chain: PropTypes.func,
    isActive: PropTypes.func,
    can: PropTypes.func,
  }),
  onVoiceToggle: PropTypes.func,
  isVoiceListening: PropTypes.bool,
  isVoiceSupported: PropTypes.bool,
  isTitleListening: PropTypes.bool,
};

const RichTextEditor = forwardRef((props, ref) => {
  const {
    content = '',
    onChange,
    placeholder = 'Write your note here...',
    isTitleListening = false,
    onContentVoiceToggle = () => {},
    contentVoiceIsListening = false,
    contentVoiceIsSupported = false
  } = props;

  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  editorRef.current = editor;

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  useImperativeHandle(
    ref,
    () => ({
      stopContentVoice: () => {
        if (contentVoiceIsListening) {
          onContentVoiceToggle();
        }
      },
      getEditor: () => editor,
    }),
    [contentVoiceIsListening, onContentVoiceToggle, editor]
  );

  return (
    <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <MenuBar
        editor={editor}
        onVoiceToggle={onContentVoiceToggle}
        isVoiceListening={contentVoiceIsListening}
        isVoiceSupported={contentVoiceIsSupported}
        isTitleListening={isTitleListening}
      />

      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none p-3.5 min-h-[180px] sm:min-h-[220px] focus:outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
      />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

RichTextEditor.propTypes = {
  content: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  isTitleListening: PropTypes.bool,
  onContentVoiceToggle: PropTypes.func,
  contentVoiceIsListening: PropTypes.bool,
  contentVoiceIsSupported: PropTypes.bool,
};

export default RichTextEditor;
