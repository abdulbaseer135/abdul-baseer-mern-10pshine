import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';
import { AuthProvider } from '../../context/AuthContext';
import * as authService from '../../services/auth.service';

jest.mock('../../services/auth.service');

const renderSignup = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <SignupPage />
      </AuthProvider>
    </MemoryRouter>
  );

describe('SignupPage', () => {
  it('renders signup form', () => {
    renderSignup();
    expect(screen.getByPlaceholderText(/Abdul Baseer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors when form is empty', async () => {
    renderSignup();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows server error on duplicate email', async () => {
    authService.signupService.mockRejectedValue({
      response: { data: { message: 'Email already exists' } },
    });
    renderSignup();
    fireEvent.change(screen.getByPlaceholderText(/Abdul Baseer/i), {
      target: { value: 'Abdul' },
    });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'taken@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});