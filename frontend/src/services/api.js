import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
});

// Read token from Redux store, fallback to localStorage
export const requestInterceptor = (config) => {
  try {
    const state = globalThis.__REDUX_STORE__?.getState();
    const token = state?.auth?.token || globalThis.localStorage?.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('[API] Failed to retrieve token from Redux store:', err?.message);

    try {
      const token = globalThis.localStorage?.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (localStorageErr) {
      console.error('[API] Failed to retrieve token from localStorage:', localStorageErr?.message);
    }
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
};

const SKIP_AUTO_LOGOUT = ['/auth/login', '/users/change-password'];

export const responseInterceptor = (error) => {
  const status = error.response?.status;
  const requestUrl = error.config?.url || '';

  const isCredentialEndpoint = SKIP_AUTO_LOGOUT.some((endpoint) =>
    requestUrl.includes(endpoint)
  );

  if (status === 401 && !isCredentialEndpoint) {
    try {
      globalThis.__REDUX_STORE__?.dispatch({ type: 'auth/logout' });
    } catch (err) {
      console.error('[API] Failed to dispatch logout action:', err?.message);
    }

    try {
      globalThis.localStorage?.removeItem('token');
    } catch (err) {
      console.error('[API] Failed to remove token from localStorage:', err?.message);
    }

    try {
      if (globalThis.location && globalThis.location.pathname !== '/login') {
        globalThis.location.href = '/login';
      }
    } catch (err) {
      console.error('[API] Failed to redirect to login:', err?.message);
    }
  }

  return Promise.reject(error);
};

if (api && api.interceptors) {
  api.interceptors.request.use(requestInterceptor);
  api.interceptors.response.use(
    (response) => response,
    responseInterceptor
  );
}

// Dedicated helper for notes list
export const getNotes = async (params = {}) => {
  const response = await api.get('/notes', {
    params,
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });

  return response.data;
};

export default api;