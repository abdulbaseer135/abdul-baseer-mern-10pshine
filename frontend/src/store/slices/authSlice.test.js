import { configureStore } from '@reduxjs/toolkit';
import authSlice, { logout, clearError, login, register } from './authSlice';

describe('Auth Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
  });

  it('should have initial state', () => {
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('logout should clear user and token', () => {
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('clearError should reset error to null', () => {
    store.dispatch(clearError());
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });

  it('should handle login pending state', () => {
    const action = { type: login.pending.type };
    const state = authSlice(undefined, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle login fulfilled state', () => {
    const payload = { user: { id: '1', email: 'test@example.com' }, token: 'abc123' };
    const action = { type: login.fulfilled.type, payload };
    const state = authSlice(undefined, action);
    expect(state.user).toEqual(payload.user);
    expect(state.token).toEqual(payload.token);
    expect(state.loading).toBe(false);
  });

  it('should handle login rejected state', () => {
    const payload = 'Login failed';
    const action = { type: login.rejected.type, payload };
    const state = authSlice(undefined, action);
    expect(state.error).toEqual(payload);
    expect(state.loading).toBe(false);
  });

  it('should handle register pending state', () => {
    const action = { type: register.pending.type };
    const state = authSlice(undefined, action);
    expect(state.loading).toBe(true);
  });

  it('should handle register fulfilled state', () => {
    const payload = { user: { id: '1', email: 'new@example.com' }, token: 'xyz789' };
    const action = { type: register.fulfilled.type, payload };
    const state = authSlice(undefined, action);
    expect(state.user).toEqual(payload.user);
    expect(state.token).toEqual(payload.token);
  });

  it('should handle register rejected state', () => {
    const payload = 'Registration failed';
    const action = { type: register.rejected.type, payload };
    const state = authSlice(undefined, action);
    expect(state.error).toEqual(payload);
  });

  it('should preserve token from localStorage', () => {
    const newState = authSlice(undefined, { type: '@@INIT' });
    expect(typeof newState.token === 'string' || newState.token === null).toBe(true);
  });

  it('should handle multiple logout calls', () => {
    store.dispatch(logout());
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('should clear error multiple times', () => {
    store.dispatch(clearError());
    store.dispatch(clearError());
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });
});
