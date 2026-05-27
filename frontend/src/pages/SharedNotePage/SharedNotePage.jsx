import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedNoteService } from '../../services/notes.service';

const SharedNotePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [note, setNote]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);
  const [readTime, setReadTime] = useState(0);
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  // Calculate read time and extract text for word count
  const calculateReadTime = (htmlContent) => {
    const text = htmlContent.replaceAll(/<[^>]*>/g, ''); // Sonar: prefer replaceAll
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed
    return { words, minutes };
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy share link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(globalThis.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  // Share via social media
  const shareOnSocial = (platform) => {
    const url = globalThis.location.href;
    const title = note?.title || 'Check out this note';
    let shareUrl = '';

    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        if (navigator.share) {
          navigator.share({
            title: title,
            text: title,
            url: url
          }).catch(() => {
            // Fallback if native share is cancelled or fails
            console.log('Share cancelled');
          });
        } else {
          shareUrl = `https://wa.me/?text=${encodeURIComponent(title + '\n\n' + url)}`;
          globalThis.open(shareUrl, '_blank');
        }
        return;
      default:
        return;
    }
    globalThis.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Print functionality
  const handlePrint = () => {
    globalThis.print();
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await getSharedNoteService(token);
        setNote(res.data);
        if (res.data?.content) {
          const { minutes } = calculateReadTime(res.data.content);
          setReadTime(minutes);
        }
      } catch {
        setError('This note is not available or sharing has been disabled.');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#111111]">
      <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#111111] px-4">
      <div className="text-center max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Go Back
        </button>
        <p className="text-6xl mb-6">🔒</p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Note Unavailable</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-6">{error}</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Create Your Own Notes
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#0d1117] dark:to-[#0a0a0a] px-4 py-6 sm:py-8 lg:py-10 transition-colors duration-200 relative overflow-hidden">
      
      {/* ✨ Subtle premium background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/[0.03] rounded-full blur-3xl opacity-40 dark:opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/[0.03] rounded-full blur-3xl opacity-30 dark:opacity-15" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* ─── HEADER WITH NAVIGATION ───────────────────────────────── */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white
              hover:bg-gray-100 dark:hover:bg-white/8
              border border-gray-200 dark:border-white/10
              transition-all duration-200 backdrop-blur-sm
              group
            "
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint()}
              className="
                w-10 h-10 rounded-lg flex items-center justify-center
                text-gray-600 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/8
                border border-gray-200 dark:border-white/10
                transition-all duration-200 backdrop-blur-sm
                print:hidden
              "
              aria-label="Print note"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              </svg>
            </button>
            <button
              onClick={() => dispatch(toggleTheme())}
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="
                w-10 h-10 rounded-lg flex items-center justify-center
                text-gray-600 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/8
                border border-gray-200 dark:border-white/10
                transition-all duration-200 backdrop-blur-sm
              "
            >
              {mode === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1"  x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1"  y1="12" x2="3"  y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ─── TOP HERO SECTION ───────────────────────────────── */}
        <div className="mb-8 lg:mb-10">
          
          {/* Premium label badge */}
          <div className="inline-block mb-4">
            <div className="
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-gradient-to-r from-indigo-50 to-purple-50
              dark:from-indigo-500/10 dark:to-purple-500/10
              border border-indigo-200 dark:border-indigo-500/20
              backdrop-blur-sm
              animate-fadeIn
            ">
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                📝 Shared Note
              </span>
            </div>
          </div>

          {/* Title — refined typography hierarchy */}
          <h1 className="
            text-2xl sm:text-3xl lg:text-4xl font-bold
            text-gray-950 dark:text-white
            leading-tight sm:leading-tight lg:leading-tight
            tracking-tight
            mb-4 sm:mb-5
          ">
            {note.title}
          </h1>

          {/* Author line — refined and intentional */}
          <div className="
            flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6
            py-4 px-4 rounded-xl
            bg-gray-50 dark:bg-white/5
            border border-gray-100 dark:border-white/10
          ">
            <div className="flex items-center gap-3">
              <div className="
                w-10 h-10 rounded-full shrink-0
                bg-gradient-to-br from-indigo-500 to-purple-500
                flex items-center justify-center text-xs font-bold text-white
                shadow-lg
              ">
                {(note.userId?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                  {note.userId?.name || 'Anonymous'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                  Shared via NotesApp
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 sm:ml-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span>{note.content?.replaceAll(/<[^>]*>/g, '').trim().split(/\s+/).length || 0} words</span>
              </div>
            </div>
          </div>

          {/* Enhanced date info */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-500">
            <span>📅 Created: {formatDate(note.createdAt)}</span>
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <span>✏️ Updated: {formatDate(note.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* ─── DIVIDER / SEPARATOR ───────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent mb-8 lg:mb-10" />

        {/* ─── CONTENT CARD — PREMIUM READING EXPERIENCE ───────────────────────────────── */}
        <div className="mb-8 lg:mb-10">
          <div
            className="
              shared-note-content
              bg-white dark:bg-[#111827]
              border border-gray-200 dark:border-white/5
              rounded-2xl
              p-6 sm:p-8 lg:p-10
              shadow-lg dark:shadow-2xl
              prose prose-sm sm:prose-base lg:prose-lg
              dark:prose-invert
              max-w-none
              transition-colors duration-200
              ring-1 ring-inset ring-gray-100 dark:ring-white/10
              backdrop-blur-sm
            "
            style={{ wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>

        {/* ─── SHARE & ACTION SECTION ───────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Share this note</span>
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                bg-white dark:bg-white/10
                border border-gray-200 dark:border-white/20
                text-gray-700 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-white/20
                font-medium text-sm
                transition-all duration-200
                hover:shadow-md
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {/* Twitter */}
            <button
              onClick={() => shareOnSocial('twitter')}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                bg-white dark:bg-white/10
                border border-gray-200 dark:border-white/20
                text-gray-700 dark:text-gray-200
                hover:bg-sky-50 dark:hover:bg-sky-500/20 hover:border-sky-200 dark:hover:border-sky-500/30
                font-medium text-sm
                transition-all duration-200
                hover:shadow-md
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z"/>
              </svg>
              <span>Twitter</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => shareOnSocial('linkedin')}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                bg-white dark:bg-white/10
                border border-gray-200 dark:border-white/20
                text-gray-700 dark:text-gray-200
                hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:border-blue-200 dark:hover:border-blue-500/30
                font-medium text-sm
                transition-all duration-200
                hover:shadow-md
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              <span>LinkedIn</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => shareOnSocial('whatsapp')}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                bg-white dark:bg-white/10
                border border-gray-200 dark:border-white/20
                text-gray-700 dark:text-gray-200
                hover:bg-green-50 dark:hover:bg-green-500/20 hover:border-green-200 dark:hover:border-green-500/30
                font-medium text-sm
                transition-all duration-200
                hover:shadow-md
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-600 dark:text-green-400">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.016.263 2.01.75 2.905l-1.196 4.413 4.527-1.123c.834.464 1.793.755 2.687.755h.001c3.181 0 5.767-2.586 5.768-5.766 0-1.543-.565-2.991-1.589-4.077-1.024-1.086-2.388-1.675-3.83-1.675zM12.03 17.884h-.016c-.84 0-1.66-.227-2.368-.646l-.17-.1-1.761.438.446-1.635-.106-.17c-.464-.776-.708-1.669-.708-2.571 0-2.653 2.159-4.812 4.815-4.812 1.289 0 2.501.501 3.413 1.412 1.012 1.012 1.605 2.37 1.605 3.813 0 2.653-2.159 4.812-4.812 4.812z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* ─── CTA SECTION ───────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl p-6 sm:p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">Love this note-taking experience?</h3>
              <p className="text-indigo-100 dark:text-indigo-200 text-sm">Start creating and sharing your own notes with NotesApp</p>
            </div>
            <a
              href="/"
              className="
                inline-flex items-center justify-center gap-2 px-6 py-3
                bg-white dark:bg-white/20
                text-indigo-600 dark:text-white
                hover:bg-indigo-50 dark:hover:bg-white/30
                font-semibold rounded-lg
                transition-all duration-200
                hover:shadow-lg
                shrink-0
              "
            >
              <span>Try NotesApp</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ─── FOOTER — INTENTIONAL & ELEGANT ───────────────────────────────── */}
        <div className="
          flex flex-col items-center gap-4 pt-6 sm:pt-8
          border-t border-gray-100 dark:border-white/5
          print:hidden
        ">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            This note was shared from <span className="font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">NotesApp</span>
          </p>
          <div className="
            h-1 w-16 rounded-full
            bg-gradient-to-r from-indigo-400 to-purple-400
            opacity-50
          " />
          <p className="text-xs text-gray-500 dark:text-gray-600">
            Pro tip: You can print or save this note using your browser's print feature.
          </p>
        </div>

      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .shared-note-content {
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SharedNotePage;