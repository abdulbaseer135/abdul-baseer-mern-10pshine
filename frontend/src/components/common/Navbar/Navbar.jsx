import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { logoutService } from '../../../services/auth.service';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (_) {}
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-blue-600">📝 Notes App</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Hello, <span className="font-semibold">{user?.name}</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;