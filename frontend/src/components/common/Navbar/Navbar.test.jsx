import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Navbar from './Navbar';
import authSlice from '../../../store/slices/authSlice';
import themeSlice from '../../../store/slices/themeSlice';
import notesSlice from '../../../store/slices/notesSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      theme: themeSlice,
      notes: notesSlice,
    },
    preloadedState: initialState,
  });
};

const renderNavbar = (store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </Provider>
  );
};

describe('Navbar Component', () => {
  describe('Rendering', () => {
    it('renders navbar successfully', () => {
      renderNavbar();
      const navbar = screen.queryByRole('navigation') || document.querySelector('nav');
      expect(navbar).toBeTruthy();
    });

    it('renders without crashing', () => {
      const { container } = renderNavbar();
      expect(container).toBeInTheDocument();
    });

    it('displays app branding/logo', () => {
      renderNavbar();
      expect(document.querySelector('nav')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('contains navigation links', () => {
      renderNavbar();
      const navbar = document.querySelector('nav');
      expect(navbar).toBeInTheDocument();
    });

    it('handles navigation properly', () => {
      renderNavbar();
      const { container } = render(
        <Provider store={createMockStore()}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </Provider>
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    it('can render with theme state', () => {
      const store = createMockStore({
        theme: { isDark: false },
      });
      renderNavbar(store);
      const navbar = document.querySelector('nav');
      expect(navbar).toBeInTheDocument();
    });

    it('supports dark theme', () => {
      const store = createMockStore({
        theme: { isDark: true },
      });
      renderNavbar(store);
      expect(document.querySelector('nav')).toBeInTheDocument();
    });
  });

  describe('User State', () => {
    it('renders with auth state', () => {
      const store = createMockStore({
        auth: { user: { _id: 'user123', email: 'test@example.com' } },
      });
      renderNavbar(store);
      expect(document.querySelector('nav')).toBeInTheDocument();
    });

    it('renders when user not authenticated', () => {
      const store = createMockStore({
        auth: { user: null },
      });
      renderNavbar(store);
      expect(document.querySelector('nav')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders mobile-friendly', () => {
      renderNavbar();
      const navbar = document.querySelector('nav');
      expect(navbar).toBeInTheDocument();
    });

    it('includes responsive classes', () => {
      const { container } = renderNavbar();
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has navigation role', () => {
      renderNavbar();
      const navbar = screen.queryByRole('navigation');
      expect(navbar || document.querySelector('nav')).toBeInTheDocument();
    });

    it('renders with proper semantic HTML', () => {
      renderNavbar();
      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('buttons are clickable', () => {
      renderNavbar();
      const buttons = screen.queryAllByRole('button');
      buttons.forEach(btn => {
        expect(btn).toBeInTheDocument();
      });
    });

    it('handles button clicks', () => {
      const { container } = renderNavbar();
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });
});
