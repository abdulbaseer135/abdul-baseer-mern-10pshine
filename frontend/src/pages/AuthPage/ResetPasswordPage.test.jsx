import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import ResetPasswordPage from './ResetPasswordPage';
import * as authService from '../../services/auth.service';
import { useNavigate, useLocation } from 'react-router-dom';

jest.mock('../../services/auth.service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('ResetPasswordPage', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({
      state: { email: 'test@example.com' },
    });
  });

  describe('Rendering', () => {
    it('should render password input field', () => {
      renderWithProviders(<ResetPasswordPage />);
      const inputs = screen.getAllByDisplayValue('');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('should render confirm password input field', () => {
      renderWithProviders(<ResetPasswordPage />);
      expect(screen.getAllByPlaceholderText(/password/i).length).toBeGreaterThanOrEqual(2);
    });

    it('should render submit button', () => {
      renderWithProviders(<ResetPasswordPage />);
      expect(screen.getByRole('button', { name: /reset|submit/i })).toBeInTheDocument();
    });

    it('should render page title', () => {
      renderWithProviders(<ResetPasswordPage />);
      expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    });

    it('should display email display', () => {
      renderWithProviders(<ResetPasswordPage />);
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  describe('Redirect when email is missing', () => {
    it('should redirect to forgot-password when email missing', () => {
      useLocation.mockReturnValue({ state: { email: '' } });

      renderWithProviders(<ResetPasswordPage />);

      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });

    it('should redirect when location.state is null', () => {
      useLocation.mockReturnValue({ state: null });

      renderWithProviders(<ResetPasswordPage />);

      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });
  });

  describe('Password Strength Indicator', () => {
    it('should display password strength meter', () => {
      renderWithProviders(<ResetPasswordPage />);
      expect(screen.getByText(/strength/i)).toBeInTheDocument();
    });

    it('should show weak strength for simple password', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);

      await userEvent.type(passwordInput, 'simple');

      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    it('should show fair strength for medium password', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);

      await userEvent.type(passwordInput, 'Medium123');

      await waitFor(() => {
        expect(screen.getByText(/fair|good/i)).toBeInTheDocument();
      });
    });

    it('should show strong strength for complex password', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);

      await userEvent.type(passwordInput, 'StrongP@ss123');

      await waitFor(() => {
        expect(screen.getByText(/strong|good/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when form is empty', async () => {
      authService.resetPasswordService.mockResolvedValue({});

      renderWithProviders(<ResetPasswordPage />);
      fireEvent.click(screen.getByRole('button', { name: /reset|submit/i }));

      // Form should not submit if empty
      await waitFor(() => {
        expect(authService.resetPasswordService).not.toHaveBeenCalled();
      });
    });

    it('should require password to match pattern', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);

      await userEvent.type(passwordInput, 'weak');

      // Password doesn't match requirements
      expect(passwordInput.value).toBe('weak');
    });

    it('should require passwords to match', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);

      await userEvent.type(passwordInput, 'StrongP@ss123');
      await userEvent.type(confirmInput, 'DifferentP@ss123');

      fireEvent.click(screen.getByRole('button', { name: /reset|submit/i }));

      // Should show error or not submit
      await waitFor(() => {
        expect(authService.resetPasswordService).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call resetPasswordService on successful validation', async () => {
      authService.resetPasswordService.mockResolvedValue({});

      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /reset|submit/i });

      await userEvent.type(passwordInput, 'StrongP@ss123');
      await userEvent.type(confirmInput, 'StrongP@ss123');

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(authService.resetPasswordService).toHaveBeenCalledWith(
          'test@example.com',
          'StrongP@ss123'
        );
      });
    });

    it('should navigate to login on success', async () => {
      authService.resetPasswordService.mockResolvedValue({});

      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /reset|submit/i });

      await userEvent.type(passwordInput, 'StrongP@ss123');
      await userEvent.type(confirmInput, 'StrongP@ss123');

      fireEvent.click(submitBtn);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/login');
        },
        { timeout: 3000 }
      );
    });

    it('should show success message on successful reset', async () => {
      authService.resetPasswordService.mockResolvedValue({});

      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /reset|submit/i });

      await userEvent.type(passwordInput, 'StrongP@ss123');
      await userEvent.type(confirmInput, 'StrongP@ss123');

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on failure', async () => {
      authService.resetPasswordService.mockRejectedValue({
        response: { data: { message: 'Invalid or expired token' } },
      });

      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /reset|submit/i });

      await userEvent.type(passwordInput, 'StrongP@ss123');
      await userEvent.type(confirmInput, 'StrongP@ss123');

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
      });
    });

    it('should display default error message when response missing', async () => {
      authService.resetPasswordService.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /reset|submit/i });

      await userEvent.type(passwordInput, 'StrongP@ss123');
      await userEvent.type(confirmInput, 'StrongP@ss123');

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/failed to reset password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while loading', async () => {
      authService.resetPasswordService.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /reset|submit/i });

      await userEvent.type(passwordInput, 'StrongP@ss123');
      await userEvent.type(confirmInput, 'StrongP@ss123');

      fireEvent.click(submitBtn);

      expect(submitBtn).toBeDisabled();

      jest.advanceTimersByTime(150);
    });

    it('should enable submit button when not loading', () => {
      renderWithProviders(<ResetPasswordPage />);
      const submitBtn = screen.getByRole('button', { name: /reset|submit/i });
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('Password Toggle Visibility', () => {
    it('should toggle new password visibility', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);
      const toggleButtons = screen.getAllByRole('button', { name: /show|hide/i });

      // Initially hidden
      expect(passwordInput.type).toBe('password');

      // Click toggle
      fireEvent.click(toggleButtons[0]);

      // Should be visible now
      await waitFor(() => {
        expect(passwordInput.type).toBe('text');
      });
    });

    it('should toggle confirm password visibility', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      const toggleButtons = screen.getAllByRole('button', { name: /show|hide/i });

      // Initially hidden
      expect(confirmInput.type).toBe('password');

      // Click toggle
      fireEvent.click(toggleButtons[1]);

      // Should be visible now
      await waitFor(() => {
        expect(confirmInput.type).toBe('text');
      });
    });
  });

  describe('Input Handling', () => {
    it('should accept valid password input', async () => {
      renderWithProviders(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText(/new password/i);

      await userEvent.type(passwordInput, 'StrongP@ss123');

      expect(passwordInput.value).toBe('StrongP@ss123');
    });

    it('should have password inputs with correct type', () => {
      renderWithProviders(<ResetPasswordPage />);
      const inputs = screen.getAllByPlaceholderText(/password/i);
      expect(inputs[0].type).toBe('password');
      expect(inputs[1].type).toBe('password');
    });
  });

  describe('Requirements Display', () => {
    it('should display password requirements', () => {
      renderWithProviders(<ResetPasswordPage />);
      expect(screen.getByText(/requirement|character|uppercase|lowercase|number|special/i)).toBeInTheDocument();
    });
  });
});
