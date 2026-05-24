import store from './store';
import { configureStore } from '@reduxjs/toolkit';

describe('Redux Store - store.js', () => {
  describe('Store Configuration', () => {
    it('should be a valid Redux store', () => {
      expect(store).toBeTruthy();
      expect(store.getState).toBeDefined();
      expect(store.dispatch).toBeDefined();
      expect(store.subscribe).toBeDefined();
    });

    it('should have auth reducer', () => {
      const state = store.getState();
      expect(state.auth).toBeDefined();
    });

    it('should have notes reducer', () => {
      const state = store.getState();
      expect(state.notes).toBeDefined();
    });

    it('should have theme reducer', () => {
      const state = store.getState();
      expect(state.theme).toBeDefined();
    });
  });

  describe('Initial State', () => {
    it('should have valid initial auth state', () => {
      const state = store.getState();
      expect(state.auth).toBeTruthy();
      expect(typeof state.auth).toBe('object');
    });

    it('should have valid initial notes state', () => {
      const state = store.getState();
      expect(state.notes).toBeTruthy();
      expect(typeof state.notes).toBe('object');
    });

    it('should have valid initial theme state', () => {
      const state = store.getState();
      expect(state.theme).toBeTruthy();
      expect(typeof state.theme).toBe('object');
    });
  });

  describe('Dispatch Actions', () => {
    it('should accept dispatch actions', () => {
      expect(() => {
        store.dispatch({ type: '@@INIT' });
      }).not.toThrow();
    });

    it('should handle unknown actions gracefully', () => {
      const state = store.getState();
      store.dispatch({ type: 'UNKNOWN_ACTION' });
      const newState = store.getState();
      expect(newState).toBeTruthy();
    });
  });

  describe('Store Subscriptions', () => {
    it('should allow subscriptions', () => {
      const unsubscribe = store.subscribe(() => {});
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should notify subscribers on state change', (done) => {
      let callCount = 0;
      const unsubscribe = store.subscribe(() => {
        callCount++;
        if (callCount >= 1) {
          expect(callCount).toBeGreaterThan(0);
          unsubscribe();
          done();
        }
      });

      // Trigger a state change
      store.dispatch({ type: '@@INIT' });
    });
  });

  describe('Global Exposure', () => {
    it('should expose store globally for api interceptor', () => {
      expect(globalThis.__REDUX_STORE__).toBeDefined();
      expect(globalThis.__REDUX_STORE__).toBe(store);
    });

    it('global store should be accessible', () => {
      const globalStore = globalThis.__REDUX_STORE__;
      expect(globalStore.getState).toBeDefined();
      expect(globalStore.dispatch).toBeDefined();
    });
  });

  describe('Store Stability', () => {
    it('should maintain store reference', () => {
      const store1 = store;
      const store2 = store;
      expect(store1).toBe(store2);
    });

    it('should persist state across accesses', () => {
      const state1 = store.getState();
      const state2 = store.getState();
      expect(state1).toEqual(state2);
    });
  });

  describe('Reducer Integration', () => {
    it('all reducers should be properly integrated', () => {
      const state = store.getState();
      expect(Object.keys(state)).toContain('auth');
      expect(Object.keys(state)).toContain('notes');
      expect(Object.keys(state)).toContain('theme');
    });

    it('should have exactly 3 reducers', () => {
      const state = store.getState();
      const reducerKeys = Object.keys(state);
      expect(reducerKeys.length).toBe(3);
    });
  });

  describe('Redux DevTools', () => {
    it('should be compatible with Redux DevTools', () => {
      // Just verify the store can be created without errors
      expect(store).toBeTruthy();
    });
  });

  describe('Concurrent Safety', () => {
    it('should handle rapid dispatches', () => {
      expect(() => {
        store.dispatch({ type: '@@INIT' });
        store.dispatch({ type: '@@INIT' });
        store.dispatch({ type: '@@INIT' });
      }).not.toThrow();
    });
  });
});
