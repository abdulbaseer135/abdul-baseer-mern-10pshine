import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../utils/testUtils';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import LandingPage from './LandingPage';

function setup(auth = { token: null, user: null }) {
  const store = configureStore({ reducer: { auth: (state = auth) => state } });
  renderWithProviders(<Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/signup" element={<h1>Existing signup</h1>} />
    <Route path="/login" element={<h1>Existing login</h1>} />
    <Route path="/dashboard" element={<ProtectedRoute><h1>Dashboard</h1></ProtectedRoute>} />
    <Route path="/verify-otp" element={<h1>Email verification</h1>} />
  </Routes>, { store });
}

test('shows public content and navigates to existing signup', async () => {
  setup();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A clear space.');
  expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '#features');
  await act(async () => { await userEvent.click(screen.getAllByRole('link', { name: /Get Started/ })[0]); });
  expect(screen.getByRole('heading', { name: 'Existing signup' })).toBeInTheDocument();
});
test('navigates to existing login', async () => {
  setup();
  await act(async () => { await userEvent.click(screen.getAllByRole('link', { name: 'Login' })[0]); });
  expect(screen.getByRole('heading', { name: 'Existing login' })).toBeInTheDocument();
});
test('redirects authenticated visitors to dashboard', () => {
  setup({ token: 'test', user: { isEmailVerified: true } });
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
});
test('retains protected route email verification', () => {
  setup({ token: 'test', user: { isEmailVerified: false, email: 'test@example.com' } });
  expect(screen.getByRole('heading', { name: 'Email verification' })).toBeInTheDocument();
});

