import { screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../utils/testUtils';
import ProtectedRoute from './ProtectedRoute';

const renderRoute = (auth) => {
  const store = configureStore({ reducer: { auth: (state = auth) => state } });
  return renderWithProviders(
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
      <Route path="/" element={<div>Landing Page</div>} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/verify-otp" element={<div>Verify Email</div>} />
    </Routes>, { store, initialEntries: ['/dashboard'] }
  );
};
describe('ProtectedRoute', () => {
  it('shows content with a token and verified user', () => {
    renderRoute({ token: 'token', user: { _id: 'u1', isEmailVerified: true } });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  it('redirects a logged-out visitor', () => {
    renderRoute({ token: null, user: null });
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  it('requires verification for an incomplete account', () => {
    renderRoute({ token: 'token', user: { email: 'test@example.com', isEmailVerified: false } });
    expect(screen.getByText('Verify Email')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
