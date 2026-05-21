import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const MenuBar = ({ editor, onVoiceToggle, isVoiceListening, isVoiceSupported, isTitleListening }) => {
  if (!editor) return null;

  // Disable content voice button if title voice is active
  const canUseVoice = !isTitleListening;

  // Toolbar button class
  const toolbarBtnClass = (isActive) => `
    px-2 py-1.5 text-xs rounded-md transition-all duration-150 font-medium
    ${isActive 
      ? 'bg-indigo-600 dark:bg-indigo-500 text-white' 
      : 'bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-500'
    }
  `;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-t-md">
      {/* ─── Text Formatting ──────────────────── */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
        className={toolbarBtnClass(editor.isActive('bold'))}>
        <strong>B</strong>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={toolbarBtnClass(editor.isActive('italic'))}>
        <em>I</em>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}
        className={toolbarBtnClass(editor.isActive('strike'))}>
        <s>S</s>
      </button>

      {/* Divider */}
      <div className="w-px bg-slate-300 dark:bg-slate-500 mx-0.5" />

      {/* ─── Headings ──────────────────────────── */}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={toolbarBtnClass(editor.isActive('heading', { level: 1 }))}>
        H1
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toolbarBtnClass(editor.isActive('heading', { level: 2 }))}>
        H2
      </button>

      {/* Divider */}
      <div className="w-px bg-slate-300 dark:bg-slate-500 mx-0.5" />

      {/* ─── Lists & Blocks ──────────────────────── */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={toolbarBtnClass(editor.isActive('bulletList'))}>
        • List
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={toolbarBtnClass(editor.isActive('orderedList'))}>
        1. List
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={toolbarBtnClass(editor.isActive('blockquote'))}>
        " Quote
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={toolbarBtnClass(false)}>
        — HR
      </button>

      {/* Divider */}
      <div className="w-px bg-slate-300 dark:bg-slate-500 mx-0.5" />

      {/* ─── Undo/Redo ──────────────────────────── */}
      <button type="button" onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${toolbarBtnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}>
        ↩ Undo
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${toolbarBtnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}>
        ↪ Redo
      </button>

      {/* Divider */}
      <div className="w-px bg-slate-300 dark:bg-slate-500 mx-0.5" />
      
      {/* ─── Voice Input ──────────────────────────── */}
      {isVoiceSupported && (
        <button
          type="button"
          onClick={onVoiceToggle}
          disabled={!canUseVoice}
          aria-label={isVoiceListening ? 'Stop voice input' : 'Start voice input'}
          title={isTitleListening ? 'Stop title voice to use content voice' : ''}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
            !canUseVoice
              ? 'opacity-40 cursor-not-allowed text-slate-500 dark:text-slate-400'
              : isVoiceListening
              ? 'text-white bg-red-500 border border-red-600 shadow-sm shadow-red-500/30'
              : 'text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-500 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-slate-600'
          }`}
        >
          {isVoiceListening ? (
            <>
              <span className="flex items-end gap-[2px] h-3">
                {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                  <span
                    key={i}
                    className="w-[2px] bg-white rounded-full animate-soundBar"
                    style={{
                      animationDelay: `${delay}s`,
                      height: i === 2 ? '100%' : i % 2 === 0 ? '40%' : '70%',
                    }}
                  />
                ))}
              </span>
              <span>Listening</span>
            </>
          ) : (
            <>
              <span>🎤</span>
              <span>Voice</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

const RichTextEditor = forwardRef((props, ref) => {
  const { content = '', onChange, placeholder = 'Write your note here...', isTitleListening = false, onContentVoiceToggle = () => {}, contentVoiceIsListening = false, contentVoiceIsSupported = false } = props;
  
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

  // ✅ Sync editor when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // ✅ Expose stopContentVoice method to parent via ref
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
    <div className="flex flex-col gap-0">
      <div className="border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden">
        <MenuBar
          editor={editor}
          onVoiceToggle={onContentVoiceToggle}
          isVoiceListening={contentVoiceIsListening}
          isVoiceSupported={contentVoiceIsSupported}
          isTitleListening={isTitleListening}
        />

        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none p-3 min-h-[160px] focus:outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
        />
      </div>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
