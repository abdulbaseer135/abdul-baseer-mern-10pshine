import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { toggleTheme } from '../../../store/slices/themeSlice';
import { logoutService } from '../../../services/auth.service';


const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);


const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleLogout = async () => {
    try { await logoutService(); } catch (_) {}
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar-glass sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2">

      {/* ─── Logo ─────────────────────────────────── */}
      <Link to="/dashboard" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
        <span className="text-lg sm:text-xl flex-shrink-0">📝</span>
        <span className="
          text-base sm:text-lg font-bold
          text-gray-900 dark:text-white
          group-hover:text-indigo-600 dark:group-hover:text-indigo-400
          transition-colors duration-200 truncate
        ">
          Notes
        </span>
      </Link>

      {/* ─── Right Actions ────────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="
            w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center
            text-gray-500 dark:text-gray-400
            hover:text-gray-900 dark:hover:text-white
            hover:bg-gray-100 dark:hover:bg-white/10
            border border-gray-200 dark:border-white/10
            hover:border-gray-300 dark:hover:border-white/20
            transition-all duration-200
          "
        >
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Divider */}
        <div className="w-px h-5 sm:h-6 bg-gray-200 dark:bg-white/10 mx-0.5 sm:mx-1" />

        {/* Profile */}
        <Link
          to="/profile"
          className="
            flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-2 py-1.5 rounded-xl
            hover:bg-gray-100 dark:hover:bg-white/[0.08]
            transition-all duration-200 group
          "
        >
          {/* Gradient avatar ring */}
          <div className="
            w-7 h-7 sm:w-8 sm:h-8 rounded-full p-[2px] shrink-0
            bg-gradient-to-br from-indigo-500 to-blue-500
            shadow-lg shadow-indigo-500/25
          ">
            <div className="
              w-full h-full rounded-full
              bg-white dark:bg-gray-900
              flex items-center justify-center
            ">
              <span className="text-xs font-bold
                text-indigo-600 dark:text-indigo-400">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <span className="
            text-sm font-medium hidden sm:block
            text-gray-700 dark:text-gray-300
            group-hover:text-gray-900 dark:group-hover:text-white
            transition-colors duration-200
          ">
            {user?.name}
          </span>
        </Link>

        {/* Logout — ghost style */}
        <button
          onClick={handleLogout}
          className="
            text-sm px-4 py-2 rounded-xl font-medium
            bg-red-500/10 dark:bg-red-500/15
            hover:bg-red-500 dark:hover:bg-red-500
            text-red-600 dark:text-red-400
            hover:text-white dark:hover:text-white
            border border-red-200 dark:border-red-500/20
            hover:border-red-500
            transition-all duration-200
          "
        >
          Logout
        </button>

      </div>
    </nav>
  );
};


export default Navbar;