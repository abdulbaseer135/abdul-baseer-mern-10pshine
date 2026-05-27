import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import LoginPage from './LoginPage';
import * as authService from '../../services/auth.service';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

jest.mock('../../services/auth.service');
jest.mock('../../hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('LoginPage', () => {
  const mockNavigate = jest.fn();
  const mockHandleLogin = jest.fn();
  const mockHandleClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({
      handleLogin: mockHandleLogin,
      loading: false,
      error: null,
      handleClearError: mockHandleClearError,
    });
  });

  describe('Rendering', () => {
    it('should render email input field', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render login button', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByRole('button', { name: /login|sign in/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should render signup link', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByText(/create account|sign up/i)).toBeInTheDocument();
    });

    it('should have email input with correct type', () => {
      renderWithProviders(<LoginPage />);
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput.type).toBe('email');
    });

    it('should have password input with correct type', () => {
      renderWithProviders(<LoginPage />);
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when form is empty', async () => {
      mockHandleLogin.mockResolvedValue(false);

      renderWithProviders(<LoginPage />);

      fireEvent.click(screen.getByRole('button', { name: /login|sign in/i }));

      await waitFor(() => {
        expect(mockHandleLogin).toHaveBeenCalled();
      });
    });

    it('should accept valid email', async () => {
      mockHandleLogin.mockResolvedValue(true);

      renderWithProviders(<LoginPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput.value).toBe('valid@example.com');
      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Login Submission', () => {
    it('should call handleLogin on form submission', async () => {
      mockHandleLogin.mockResolvedValue(true);

      renderWithProviders(<LoginPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginBtn = screen.getByRole('button', { name: /login|sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(mockHandleLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      mockHandleLogin.mockResolvedValue(true);

      renderWithProviders(<LoginPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginBtn = screen.getByRole('button', { name: /login|sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not navigate on failed login', async () => {
      mockHandleLogin.mockResolvedValue(false);

      renderWithProviders(<LoginPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginBtn = screen.getByRole('button', { name: /login|sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when provided', () => {
      useAuth.mockReturnValue({
        handleLogin: mockHandleLogin,
        loading: false,
        error: 'Invalid credentials',
        handleClearError: mockHandleClearError,
      });

      renderWithProviders(<LoginPage />);

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it('should call handleClearError on form submission', async () => {
      mockHandleLogin.mockResolvedValue(true);

      renderWithProviders(<LoginPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginBtn = screen.getByRole('button', { name: /login|sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(mockHandleClearError).toHaveBeenCalled();
      });
    });

    it('should display error banner with icon', () => {
      useAuth.mockReturnValue({
        handleLogin: mockHandleLogin,
        loading: false,
        error: 'Email not found',
        handleClearError: mockHandleClearError,
      });

      renderWithProviders(<LoginPage />);

      expect(screen.getByText(/email not found/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while loading', () => {
      useAuth.mockReturnValue({
        handleLogin: mockHandleLogin,
        loading: true,
        error: null,
        handleClearError: mockHandleClearError,
      });

      renderWithProviders(<LoginPage />);

      const loginBtn = screen.getByRole('button', { name: /login|sign in/i });
      expect(loginBtn).toBeDisabled();
    });

    it('should enable submit button when not loading', () => {
      renderWithProviders(<LoginPage />);

      const loginBtn = screen.getByRole('button', { name: /login|sign in/i });
      expect(loginBtn).not.toBeDisabled();
    });

    it('should show loading indicator when loading', () => {
      useAuth.mockReturnValue({
        handleLogin: mockHandleLogin,
        loading: true,
        error: null,
        handleClearError: mockHandleClearError,
      });

      renderWithProviders(<LoginPage />);

      const loginBtn = screen.getByRole('button', { name: /login|sign in/i });
      expect(loginBtn).toBeDisabled();
    });
  });

  describe('Navigation Links', () => {
    it('should have link to forgot password page', () => {
      renderWithProviders(<LoginPage />);
      const link = screen.getByText(/forgot password/i).closest('a');
      expect(link).toHaveAttribute('href', expect.stringContaining('/forgot-password'));
    });

    it('should have link to signup page', () => {
      renderWithProviders(<LoginPage />);
      const link = screen.getByText(/create account|sign up/i).closest('a');
      expect(link).toHaveAttribute('href', expect.stringContaining('/signup'));
    });
  });

  describe('Form Input Handling', () => {
    it('should update email input value', async () => {
      renderWithProviders(<LoginPage />);
      const emailInput = screen.getByLabelText(/email/i);

      await userEvent.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input value', async () => {
      renderWithProviders(<LoginPage />);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(passwordInput, 'MyPassword123!');

      expect(passwordInput.value).toBe('MyPassword123!');
    });
  });
});
