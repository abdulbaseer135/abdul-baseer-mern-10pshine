import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const MenuBar = ({ editor, onVoiceToggle, isVoiceListening, isVoiceSupported, isTitleListening }) => {
  if (!editor) return null;

  // Disable content voice button if title voice is active
  const canUseVoice = !isTitleListening;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] rounded-t-lg">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive('bold') ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 text-sm rounded italic transition-colors ${editor.isActive('italic') ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-2 py-1 text-sm rounded line-through transition-colors ${editor.isActive('strike') ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>S</button>
      <div className="w-px bg-gray-300 dark:bg-white/[0.08] mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>H2</button>
      <div className="w-px bg-gray-300 dark:bg-white/[0.08] mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive('bulletList') ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive('orderedList') ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>1. List</button>
      <div className="w-px bg-gray-300 dark:bg-white/[0.08] mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-2 py-1 text-sm rounded transition-colors ${editor.isActive('blockquote') ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15]'}`}>" Quote</button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-2 py-1 text-sm rounded bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15] transition-colors">— HR</button>
      <div className="w-px bg-gray-300 dark:bg-white/[0.08] mx-1" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="px-2 py-1 text-sm rounded bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15] transition-colors disabled:opacity-40">↩ Undo</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="px-2 py-1 text-sm rounded bg-white dark:bg-white/[0.08] border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-white/[0.15] transition-colors disabled:opacity-40">↪ Redo</button>
      <div className="w-px bg-gray-300 dark:bg-white/[0.08] mx-1" />
      
      {isVoiceSupported && (
        <button
          type="button"
          onClick={onVoiceToggle}
          disabled={!canUseVoice}
          aria-label={isVoiceListening ? 'Stop voice input' : 'Start voice input'}
          title={isTitleListening ? 'Stop title voice to use content voice' : ''}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            !canUseVoice
              ? 'opacity-50 cursor-not-allowed text-gray-400 border border-gray-300 dark:border-gray-700'
              : isVoiceListening
              ? 'text-white bg-red-500 border border-red-500 shadow-md shadow-red-500/30'
              : 'text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600'
          }`}
        >
          {isVoiceListening ? (
            <>
              <span className="flex items-end gap-[2px] h-3">
                {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                  <span
                    key={i}
                    className="w-[3px] bg-white rounded-full animate-soundBar"
                    style={{
                      animationDelay: `${delay}s`,
                      height: i === 2 ? '100%' : i % 2 === 0 ? '40%' : '70%',
                    }}
                  />
                ))}
              </span>
              <span>Listening</span>
              <span className="text-red-200 text-[10px]">tap to stop</span>
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
    <div className="flex flex-col gap-2">
      <div className="border border-gray-300 dark:border-white/[0.08] rounded-lg overflow-hidden focus-within:ring-2 dark:focus-within:ring-indigo-500/30 focus-within:ring-blue-500">
        <MenuBar
          editor={editor}
          onVoiceToggle={onContentVoiceToggle}
          isVoiceListening={contentVoiceIsListening}
          isVoiceSupported={contentVoiceIsSupported}
          isTitleListening={isTitleListening}
        />

        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none p-3 min-h-[200px] focus:outline-none text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
