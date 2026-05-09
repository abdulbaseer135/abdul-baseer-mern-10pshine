import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';
import { useParams } from 'react-router-dom';
import { getSharedNoteService } from '../../services/notes.service';

const SharedNotePage = () => {
  const { token } = useParams();
  const [note, setNote]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  // ✅ Theme sync is now handled globally in App.jsx — removed from here

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await getSharedNoteService(token);
        setNote(res.data);
      } catch {
        setError('This note is not available or sharing has been disabled.');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
      <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Note Unavailable</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4 py-12 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">

        {/* Floating theme toggle */}
        <div className="relative">
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="absolute -top-2 right-0 w-9 h-9 rounded-xl flex items-center justify-center
              text-gray-500 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white
              hover:bg-gray-100 dark:hover:bg-white/10
              border border-gray-200 dark:border-white/10
              transition-all duration-200 z-20"
          >
            {mode === 'dark' ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="1"  x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="1"  y1="12" x2="3"  y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* ─── Header ───────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">📝 Shared Note</p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">{note.title}</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Shared by <span className="font-medium text-gray-600 dark:text-gray-300">{note.userId?.name || 'Anonymous'}</span>
          </p>
        </div>

        {/* ─── Content ──────────────────────────────── */}
        <div
          className="shared-note-content bg-white dark:bg-[#141414] border border-gray-200/60 dark:border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-none prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none transition-colors duration-200"
          style={{ wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        {/* ─── Footer ───────────────────────────────── */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">This note was shared via NotesApp</p>

      </div>
    </div>
  );
};

export default SharedNotePage;