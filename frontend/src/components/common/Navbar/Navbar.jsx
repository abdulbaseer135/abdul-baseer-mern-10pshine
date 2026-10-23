import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { toggleTheme } from '../../../store/slices/themeSlice';
import { logoutService } from '../../../services/auth.service';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const AppLogo = () => (
  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20 shrink-0">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  </div>
);

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error(err);
    }
    dispatch(logout());
    navigate('/', { replace: true });
  };

  return (
    <nav
      className="navbar-glass sticky top-0 z-50 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3"
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderBottomColor: 'var(--border-default)',
        borderBottomWidth: '1px',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Brand Logo & Title */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2.5 group min-w-0 shrink-0 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl"
        aria-label="Notes Dashboard"
      >
        <AppLogo />
        <div className="flex flex-col">
          <span
            className="text-base sm:text-lg font-bold tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Notes
          </span>
        </div>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Theme Toggle - Accessible 44px touch target on mobile */}
        <button
          onClick={() => dispatch(toggleTheme())}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="
            w-11 h-11 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
            border transition-all duration-200 shrink-0
            hover:border-cyan-500/50 hover:bg-cyan-500/10 focus-visible:ring-2 focus-visible:ring-cyan-500
          "
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
        >
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 sm:h-7 mx-0.5 sm:mx-1 shrink-0" style={{ backgroundColor: 'var(--border-default)' }} />

        {/* Desktop Profile Link */}
        <Link
          to="/profile"
          className="
            hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl
            border border-transparent hover:border-slate-200 dark:hover:border-slate-700
            hover:bg-slate-100/60 dark:hover:bg-slate-800/60
            transition-all duration-200 group no-underline
          "
          aria-label="View user profile"
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 border"
              style={{ borderColor: 'var(--border-default)' }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs"
              style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <span
            className="text-sm font-medium transition-colors duration-200 line-clamp-1 max-w-[120px] lg:max-w-[180px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {user?.name || 'Account'}
          </span>
        </Link>

        {/* Mobile Profile Icon Button - Accessible 44px touch target */}
        <Link
          to="/profile"
          aria-label="View user profile"
          className="
            sm:hidden w-11 h-11 rounded-xl flex items-center justify-center
            border transition-all duration-200 shrink-0 no-underline
            hover:border-cyan-500/50 hover:bg-cyan-500/10
          "
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--border-default)',
          }}
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          aria-label="Log out of account"
          className="
            min-h-[44px] min-w-[44px] px-3 sm:px-3.5 py-2 rounded-xl font-medium text-sm
            border transition-all duration-200 flex items-center justify-center gap-2 shrink-0
            hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-600 dark:hover:text-rose-400
          "
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
        >
          <LogoutIcon />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
