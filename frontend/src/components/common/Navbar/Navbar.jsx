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
    <nav className="navbar-glass sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2" style={{
      backgroundColor: 'var(--surface-panel)',
      borderBottomColor: 'var(--border-default)',
      borderBottomWidth: '1px',
      boxShadow: 'var(--shadow-sm)'
    }}>

      {/* ─── Logo — Premium Brand ─────────────────────────────────── */}
      <Link to="/dashboard" className="flex items-center gap-2 group min-w-0 flex-shrink-0">
        <span className="text-xl sm:text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">📝</span>
        <span className="
          text-base sm:text-lg font-bold tracking-tight
          transition-colors duration-200 hidden sm:block
        " style={{ color: 'var(--text-primary)' }}>
          Notes
        </span>
      </Link>

      {/* ─── Right Actions — Premium Controls ────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

        {/* Theme Toggle — More premium size and styling */}
        <button
          onClick={() => dispatch(toggleTheme())}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="
            w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
            border transition-all duration-200 flex-shrink-0
          "
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Divider — More prominent */}
        <div className="w-px h-6 sm:h-7 mx-1 flex-shrink-0" style={{ backgroundColor: 'var(--border-default)' }} />

        {/* Profile — Better spacing and hierarchy */}
        <Link
          to="/profile"
          className="
            hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg
            transition-all duration-200 group
          "
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* ✅ Show image if available, fallback to letter avatar */}
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
              style={{ borderColor: 'var(--border-default)', borderWidth: '1px' }}
            />
          ) : (
            <div className="
              w-8 h-8 rounded-full p-0.5 shrink-0
              flex items-center justify-center
            " style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: '1px solid #818cf8'
            }}>
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="
            text-sm font-medium
            transition-colors duration-200 line-clamp-1
          " style={{ color: 'var(--text-secondary)' }}>
            {user?.name}
          </span>
        </Link>

        {/* Mobile Profile Button */}
        <Link
          to="/profile"
          className="
            sm:hidden w-9 h-9 rounded-lg flex items-center justify-center
            transition-all duration-200
          "
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="
              w-9 h-9 rounded-full
              flex items-center justify-center
            " style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: '1px solid #818cf8'
            }}>
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        {/* Logout Button — Premium styling */}
        <button
          onClick={handleLogout}
          className="
            px-3 sm:px-4 py-2 rounded-lg font-medium text-sm
            border transition-all duration-200 flex-shrink-0
          "
          style={{
            backgroundColor: 'transparent',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
            e.currentTarget.style.borderColor = '#ff6b6b';
            e.currentTarget.style.color = '#ff6b6b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">↪</span>
        </button>

      </div>
    </nav>
  );
};


export default Navbar;