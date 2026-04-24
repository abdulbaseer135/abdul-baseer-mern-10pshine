import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 text-sm rounded ${editor.isActive('bold') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 text-sm rounded italic ${editor.isActive('italic') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-2 py-1 text-sm rounded line-through ${editor.isActive('strike') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>S</button>
      <div className="w-px bg-gray-300 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 text-sm rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 text-sm rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>H2</button>
      <div className="w-px bg-gray-300 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 text-sm rounded ${editor.isActive('bulletList') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 text-sm rounded ${editor.isActive('orderedList') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>1. List</button>
      <div className="w-px bg-gray-300 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-2 py-1 text-sm rounded ${editor.isActive('blockquote') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>" Quote</button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-2 py-1 text-sm rounded bg-white border border-gray-300 hover:bg-gray-100">— HR</button>
      <div className="w-px bg-gray-300 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="px-2 py-1 text-sm rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-40">↩ Undo</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="px-2 py-1 text-sm rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-40">↪ Redo</button>
    </div>
  );
};

const RichTextEditor = ({ content = '', onChange, placeholder = 'Write your note here...' }) => {
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

  // ✅ Sync editor when content prop changes (e.g. opening existing note)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose max-w-none p-3 min-h-[200px] focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;