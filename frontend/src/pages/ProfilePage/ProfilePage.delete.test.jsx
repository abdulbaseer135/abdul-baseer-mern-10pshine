import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { renderWithProviders } from '../../utils/testUtils';
import authReducer from '../../store/slices/authSlice';
import { deleteProfileService, getProfileService } from '../../services/profile.service';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import ProfilePage from './ProfilePage';
import LandingPage from '../LandingPage/LandingPage';

jest.mock('../../services/profile.service', () => ({ deleteProfileService: jest.fn(), getProfileService: jest.fn() }));
jest.mock('../../hooks/useProfileImage', () => ({ __esModule: true, default: () => ({ fileInputRef: { current: null }, handleImageUpload: jest.fn() }) }));

test('confirming account deletion clears the session and displays landing page details', async () => {
  const user = { name: 'Test User', email: 'test@example.com', isEmailVerified: true };
  getProfileService.mockResolvedValue(user);
  deleteProfileService.mockResolvedValue(undefined);
  const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const store = configureStore({
    reducer: { auth: authReducer, theme: (state = { mode: 'light' }) => state },
    preloadedState: { auth: { user, token: 'test-token', loading: false } },
  });
  localStorage.setItem('token', 'test-token');
  await act(async () => {
    renderWithProviders(<Routes>
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<h1>Login page</h1>} />
    </Routes>, { store, initialEntries: ['/profile'] });
  });
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: 'Danger Zone' })); });
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: /Delete account permanently/i })); });
  expect(deleteProfileService).not.toHaveBeenCalled();
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: 'Delete My Account' })); });
  expect(deleteProfileService).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('A clear space.');
  expect(screen.getByRole('heading', { name: 'Voice-to-text' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Public links for friends' })).toBeInTheDocument();
  expect(store.getState().auth.token).toBeNull();
  expect(store.getState().auth.user).toBeNull();
  expect(localStorage.getItem('token')).toBeNull();
  expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  scrollSpy.mockRestore();
});

