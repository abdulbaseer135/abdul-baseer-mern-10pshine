import axios from 'axios';

// Mock axios before importing api module
jest.mock('axios');

// Setup mock axios.create to return a proper mock instance
const mockApiInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

axios.create = jest.fn(() => mockApiInstance);

// Now import the interceptors after mocking
const { requestInterceptor, responseInterceptor } = require('./api');

describe('API Service - api.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete globalThis.__REDUX_STORE__;
    
    // Create a basic localStorage mock object
    globalThis.localStorage = {
      getItem: () => null,
      removeItem: () => {},
      setItem: () => {},
      clear: () => {},
    };
    
    // Use jest.spyOn to wrap the methods
    jest.spyOn(globalThis.localStorage, 'getItem');
    jest.spyOn(globalThis.localStorage, 'removeItem');
    jest.spyOn(globalThis.localStorage, 'setItem');
    jest.spyOn(globalThis.localStorage, 'clear');
    
    // Mock location with a writable href property
    Object.defineProperty(globalThis, 'location', {
      value: { href: '/dashboard' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete globalThis.__REDUX_STORE__;
  });

describe('Request Interceptor', () => {
    it('should add Authorization header with token from Redux store', () => {
      const mockToken = 'redux-token-123';
      globalThis.__REDUX_STORE__ = {
        getState: jest.fn(() => ({
          auth: { token: mockToken },
        })),
      };

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should fallback to localStorage token when Redux store is unavailable', () => {
      const mockToken = 'local-token-456';
      delete globalThis.__REDUX_STORE__;
      
      globalThis.localStorage.getItem.mockReturnValue(mockToken);

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should handle Redux store error and fallback to localStorage', () => {
      const mockToken = 'fallback-token';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      globalThis.__REDUX_STORE__ = {
        getState: jest.fn(() => {
          throw new Error('Redux store error');
        }),
      };
      
      globalThis.localStorage.getItem.mockReturnValue(mockToken);

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should not add Authorization header if no token available', () => {
      globalThis.__REDUX_STORE__ = {
        getState: jest.fn(() => ({
          auth: { token: null },
        })),
      };

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should set Content-Type to application/json for non-FormData requests', () => {
      globalThis.__REDUX_STORE__ = undefined;

      const config = { headers: {}, data: { test: 'data' } };
      const result = requestInterceptor(config);

      expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('should NOT set Content-Type for FormData requests', () => {
      globalThis.__REDUX_STORE__ = undefined;

      const formData = new FormData();
      const config = { headers: {}, data: formData };
      const result = requestInterceptor(config);

      expect(result.headers['Content-Type']).toBeUndefined();
    });

    it('should return the config object', () => {
      globalThis.__REDUX_STORE__ = undefined;

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result).toBe(config);
    });

    it('should preserve existing headers', () => {
      globalThis.__REDUX_STORE__ = {
        getState: jest.fn(() => ({ auth: { token: 'token123' } })),
      };

      const config = {
        headers: { 'X-Custom-Header': 'custom-value' },
        data: { test: 'data' },
      };
      const result = requestInterceptor(config);

      expect(result.headers['X-Custom-Header']).toBe('custom-value');
      expect(result.headers.Authorization).toBe('Bearer token123');
      expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('should be a function', () => {
      expect(typeof requestInterceptor).toBe('function');
    });
  });

  describe('Response Interceptor', () => {
    it('should reject error promise', async () => {
      const error = {
        response: { status: 500 },
        config: { url: '/api/v1/notes' },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown error');
      } catch (err) {
        expect(err).toBe(error);
      }
    });

    it('should dispatch logout on 401 error for non-credential endpoints', async () => {
      const dispatchSpy = jest.fn();
      globalThis.__REDUX_STORE__ = { dispatch: dispatchSpy };
      const removeItemSpy = jest.fn();
      global.localStorage = { removeItem: removeItemSpy };
      global.location = { href: '/dashboard' };

      const error = {
        response: { status: 401 },
        config: { url: '/api/v1/notes' },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown error');
      } catch (err) {
        expect(err).toBe(error);
      }

      expect(dispatchSpy).toHaveBeenCalledWith({ type: 'auth/logout' });
    });

    it('should NOT dispatch logout for /auth/login endpoint on 401', async () => {
      const dispatchSpy = jest.fn();
      globalThis.__REDUX_STORE__ = { dispatch: dispatchSpy };
      const removeItemSpy = jest.fn();
      global.localStorage = { removeItem: removeItemSpy };
      global.location = { href: '/dashboard' };

      const error = {
        response: { status: 401 },
        config: { url: '/auth/login' },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown error');
      } catch (err) {
        expect(err).toBe(error);
      }

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should NOT dispatch logout for /users/change-password endpoint on 401', async () => {
      const dispatchSpy = jest.fn();
      globalThis.__REDUX_STORE__ = { dispatch: dispatchSpy };
      const removeItemSpy = jest.fn();
      global.localStorage = { removeItem: removeItemSpy };
      global.location = { href: '/dashboard' };

      const error = {
        response: { status: 401 },
        config: { url: '/users/change-password' },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown error');
      } catch (err) {
        expect(err).toBe(error);
      }

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should remove token from localStorage on 401', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/v1/notes' },
      };

      try {
        await responseInterceptor(error);
      } catch (err) {
        // Expected
      }

      expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith('token');
    });

    it('should redirect to /login on 401 if not already there', async () => {
      globalThis.location.href = '/dashboard';

      const error = {
        response: { status: 401 },
        config: { url: '/api/v1/notes' },
      };

      try {
        await responseInterceptor(error);
      } catch (err) {
        // Expected
      }

      expect(globalThis.location.href).toBe('/login');
    });

    it('should not redirect if already on /login', async () => {
      globalThis.location.href = '/login';

      const error = {
        response: { status: 401 },
        config: { url: '/api/v1/notes' },
      };

      try {
        await responseInterceptor(error);
      } catch (err) {
        // Expected
      }

      expect(globalThis.location.href).toBe('/login');
    });

    it('should handle missing response in error', async () => {
      const error = {
        config: { url: '/api/v1/notes' },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown error');
      } catch (err) {
        expect(err).toBe(error);
      }
    });

    it('should handle missing config in error', async () => {
      const error = {
        response: { status: 500 },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown error');
      } catch (err) {
        expect(err).toBe(error);
      }
    });

    it('should be a function', () => {
      expect(typeof responseInterceptor).toBe('function');
    });

    it('should handle non-401 errors silently', async () => {
      const dispatchSpy = jest.fn();
      globalThis.__REDUX_STORE__ = { dispatch: dispatchSpy };

      const error = {
        response: { status: 500 },
        config: { url: '/api/v1/notes' },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown error');
      } catch (err) {
        expect(err).toBe(error);
      }

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });
});

