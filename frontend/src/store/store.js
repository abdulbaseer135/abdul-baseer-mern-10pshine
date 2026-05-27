import { configureStore } from '@reduxjs/toolkit';
import authReducer  from './slices/authSlice';
import notesReducer from './slices/notesSlice';
import themeReducer from './slices/themeSlice'; // ✅ NEW


const store = configureStore({
  reducer: {
    auth:  authReducer,
    notes: notesReducer,
    theme: themeReducer, // ✅ NEW
  },
});


// ✅ Expose store globally so api.js interceptor can read token from Redux
globalThis.__REDUX_STORE__ = store; // Sonar: use globalThis


export default store;