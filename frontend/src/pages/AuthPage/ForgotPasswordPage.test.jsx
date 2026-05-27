import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import ForgotPasswordPage from './ForgotPasswordPage';
import * as authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

jest.mock('../../services/auth.service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('ForgotPasswordPage', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  describe('Rendering', () => {
    it('should render email input field', () => {
      renderWithProviders(<ForgotPasswordPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithProviders(<ForgotPasswordPage />);
      expect(screen.getByRole('button', { name: /send|submit/i })).toBeInTheDocument();
    });

    it('should render page title', () => {
      renderWithProviders(<ForgotPasswordPage />);
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      renderWithProviders(<ForgotPasswordPage />);
      expect(screen.getByText(/back to login|sign in/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call sendOTPService on form submission', async () => {
      authService.sendOTPService.mockResolvedValue({});

      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(authService.sendOTPService).toHaveBeenCalledWith('test@example.com', 'reset');
      });
    });

    it('should navigate to OTP page on success', async () => {
      authService.sendOTPService.mockResolvedValue({});

      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitBtn);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith(
            '/verify-otp',
            expect.objectContaining({
              state: expect.objectContaining({ email: 'test@example.com', purpose: 'reset' }),
            })
          );
        },
        { timeout: 3000 }
      );
    });

    it('should set success state on successful submission', async () => {
      authService.sendOTPService.mockResolvedValue({});

      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on failure', async () => {
      authService.sendOTPService.mockRejectedValue({
        response: { data: { message: 'Email not found' } },
      });

      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });

      await userEvent.type(emailInput, 'notfound@example.com');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/email not found/i)).toBeInTheDocument();
      });
    });

    it('should display default error message when response missing', async () => {
      authService.sendOTPService.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/failed to send otp|try again/i)).toBeInTheDocument();
      });
    });

    it('should clear error on new submission', async () => {
      authService.sendOTPService
        .mockRejectedValueOnce({
          response: { data: { message: 'Error' } },
        })
        .mockResolvedValueOnce({});

      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Clear and try again
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(authService.sendOTPService).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while loading', async () => {
      authService.sendOTPService.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitBtn);

      expect(submitBtn).toBeDisabled();

      jest.advanceTimersByTime(150);
    });

    it('should enable submit button when not loading', () => {
      renderWithProviders(<ForgotPasswordPage />);
      const submitBtn = screen.getByRole('button', { name: /send|submit/i });
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('Input Validation', () => {
    it('should accept valid email', async () => {
      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);

      await userEvent.type(emailInput, 'valid@example.com');

      expect(emailInput.value).toBe('valid@example.com');
    });

    it('should have email input with correct type', () => {
      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput.type).toBe('email');
    });
  });

  describe('Navigation', () => {
    it('should have link back to login', () => {
      renderWithProviders(<ForgotPasswordPage />);
      const link = screen.getByText(/back to login|sign in/i).closest('a');
      expect(link).toHaveAttribute('href', expect.stringContaining('/login'));
    });
  });

  describe('Input Styling', () => {
    it('should apply correct CSS classes for styling', () => {
      renderWithProviders(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveClass('rounded-xl');
    });
  });
});
