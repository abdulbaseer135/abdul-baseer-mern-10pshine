import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// ✅ Read token from Redux store (falls back to localStorage for page refresh)
api.interceptors.request.use((config) => {
  try {
    const state = window.__REDUX_STORE__?.getState();
    const token = state?.auth?.token || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  
  // ✅ Set Content-Type only for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// ✅ These endpoints return 401 for wrong credentials — NOT expired token
const SKIP_AUTO_LOGOUT = [
  '/auth/login',
  '/users/change-password',
];

// ✅ Handle 401 globally — skip auto-logout for credential-based endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    const isCredentialEndpoint = SKIP_AUTO_LOGOUT.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (status === 401 && !isCredentialEndpoint) {
      try {
        window.__REDUX_STORE__?.dispatch({ type: 'auth/logout' });
      } catch {}
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;  // ✅ default export — THIS is what was missing