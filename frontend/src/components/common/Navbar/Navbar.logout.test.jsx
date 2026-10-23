import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../utils/testUtils';
import authReducer from '../../../store/slices/authSlice';
import ProtectedRoute from '../ProtectedRoute';
import LandingPage from '../../../pages/LandingPage/LandingPage';
import Navbar from './Navbar';
import { logoutService } from '../../../services/auth.service';

jest.mock('../../../services/auth.service', () => ({ logoutService: jest.fn() }));

test.each(['success', 'expired session'])('logout shows landing details after %s', async (outcome) => {
  if (outcome === 'success') logoutService.mockResolvedValue(undefined);
  else logoutService.mockRejectedValue({ response: { status: 401 } });
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const store = configureStore({
    reducer: { auth: authReducer, theme: (state = { mode: 'light' }) => state },
    preloadedState: { auth: { token: 'test-token', user: { name: 'Test', isEmailVerified: true } } },
  });
  localStorage.setItem('token', 'test-token');
  renderWithProviders(<Routes>
    <Route path="/dashboard" element={<ProtectedRoute><Navbar /></ProtectedRoute>} />
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<h1>Login page</h1>} />
  </Routes>, { store, initialEntries: ['/dashboard'] });
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: /logout|log out|sign out/i })); });
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('A clear space.');
  expect(screen.getByRole('heading', { name: 'Voice-to-text' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Public links for friends' })).toBeInTheDocument();
  expect(store.getState().auth.token).toBeNull();
  expect(localStorage.getItem('token')).toBeNull();
  expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  errorSpy.mockRestore();
  scrollSpy.mockRestore();
});
