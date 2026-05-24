import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchProfile } from '../../store/slices/authSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  // ✅ Restore user on reload — token exists but Redux user wiped
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [token, user, dispatch]); // Properly include all dependencies

  if (!token) return <Navigate to="/login" replace />;

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;