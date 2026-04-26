import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchProfile } from '../../store/slices/authSlice'; // ✅ two levels up only

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  // ✅ Restore user on reload — token exists but Redux user wiped
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [token]); // eslint-disable-line

  if (!token) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;