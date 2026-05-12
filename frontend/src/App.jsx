import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux'; // ✅ add this
import { useEffect } from 'react';          // ✅ add this
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/AuthPage/LoginPage';
import SignupPage from './pages/AuthPage/SignupPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import SharedNotePage from './pages/SharedNotePage/SharedNotePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

const App = () => {
  const { mode } = useSelector((state) => state.theme); // ✅ read theme from Redux

  // ✅ Sync Redux theme → <html class="dark"> for ALL routes globally
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ✅ Public shared note route — no auth required */}
        <Route path="/shared/:token" element={<SharedNotePage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        toastClassName={() =>
          'relative flex items-center p-3 px-4 mb-2 rounded-xl shadow-lg ' +
          'bg-white dark:bg-[#1c1c1c] text-gray-800 dark:text-gray-100 ' +
          'border border-gray-100 dark:border-white/10 text-sm font-medium ' +
          'min-w-[280px] max-w-[360px]'
        }
        progressClassName="bg-indigo-500 rounded-full"
      />
    </BrowserRouter>
  );
};

export default App;