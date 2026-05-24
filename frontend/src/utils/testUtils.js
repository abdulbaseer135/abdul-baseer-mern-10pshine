import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import authReducer from '../store/slices/authSlice';
import notesReducer from '../store/slices/notesSlice';
import themeReducer from '../store/slices/themeSlice';

// Create a test store
export const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: notesReducer,
      theme: themeReducer,
    },
  });
};

// Render with Redux Provider and Router
export const renderWithProviders = (component, { store = createTestStore(), initialEntries = ['/'] } = {}) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

// For components that need just Router
export const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

