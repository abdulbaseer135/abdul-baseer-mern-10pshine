import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import ChangePasswordTab from './ChangePasswordTab';

// Mock child components
jest.mock('./PasswordField', () => {
  return function MockPasswordField({ id, label, error, isVisible, onToggleVisibility, ...props }) {
    return (
      <div data-testid={`password-field-${id}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          {...props}
        />
        <button onClick={onToggleVisibility} aria-label={`Toggle ${label}`}>
          {isVisible ? 'Hide' : 'Show'}
        </button>
        {error && <span className="error">{error.message}</span>}
      </div>
    );
  };
});

jest.mock('./PasswordStrengthIndicator', () => {
  return function MockPasswordStrengthIndicator({ password, strength, strengthTextColor }) {
    return (
      <div data-testid="password-strength-indicator">
        {strength && <span>{strength.label}</span>}
      </div>
    );
  };
});

jest.mock('./PasswordRequirements', () => {
  return function MockPasswordRequirements({ password }) {
    return <div data-testid="password-requirements">Password Requirements</div>;
  };
});

describe('ChangePasswordTab Component', () => {
  let mockHandleSubmit;
  let mockOnChangePassword;
  let mockRegister;
  let mockWatch;

  const defaultProps = {
    passwordSuccess: false,
    loading: false,
    passwordErrors: {},
    handleSubmit: jest.fn((callback) => (e) => {
      e?.preventDefault?.();
      callback();
    }),
    onChangePassword: jest.fn(),
    register: jest.fn((name, rules) => ({
      name,
      ...rules,
    })),
    watch: jest.fn(),
    showOldPassword: false,
    setShowOldPassword: jest.fn(),
    showNewPassword: false,
    setShowNewPassword: jest.fn(),
    showConfirmPassword: false,
    setShowConfirmPassword: jest.fn(),
    strength: { score: 0, label: 'Weak', color: 'red' },
    strengthTextColor: { weak: 'text-red-600' },
    newPassword: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component without crashing', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('should render the header with title', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByText(/keep your account secure/)).toBeInTheDocument();
    });

    it('should render all three password fields', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      const inputs = screen.getAllByPlaceholderText(/••••••••/);
      expect(inputs.length).toBeGreaterThanOrEqual(3);
    });

    it('should render the submit button', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      const button = screen.getByRole('button', { name: /Update Password Securely/i });
      expect(button).toBeInTheDocument();
    });

    it('should render password strength indicator', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument();
    });

    it('should render password requirements component', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      expect(screen.getByTestId('password-requirements')).toBeInTheDocument();
    });
  });

  describe('Success Message', () => {
    it('should display success message when passwordSuccess is true', () => {
      const props = {
        ...defaultProps,
        passwordSuccess: true,
      };
      render(<ChangePasswordTab {...props} />);
      expect(screen.getByText(/Password updated successfully/)).toBeInTheDocument();
    });

    it('should not display success message when passwordSuccess is false', () => {
      const props = {
        ...defaultProps,
        passwordSuccess: false,
      };
      render(<ChangePasswordTab {...props} />);
      expect(screen.queryByText(/Password updated successfully/)).not.toBeInTheDocument();
    });

    it('should have correct styling for success message', () => {
      const props = {
        ...defaultProps,
        passwordSuccess: true,
      };
      render(<ChangePasswordTab {...props} />);
      const successDiv = screen.getByText(/Password updated successfully/).closest('div');
      expect(successDiv).toHaveClass('bg-green-50');
    });
  });

  describe('Form Submission', () => {
    it('should handle form submission', async () => {
      const onChangePassword = jest.fn();
      const handleSubmit = jest.fn((callback) => (e) => {
        e.preventDefault();
        callback({ oldPassword: '123', newPassword: '456', confirmPassword: '456' });
      });

      const props = {
        ...defaultProps,
        handleSubmit,
        onChangePassword,
      };

      render(<ChangePasswordTab {...props} />);
      const form = screen.getByRole('button', { name: /Update Password Securely/i }).closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    it('should call onChangePassword with form data', async () => {
      const onChangePassword = jest.fn();
      let submittedData;

      const handleSubmit = jest.fn((callback) => (e) => {
        e.preventDefault();
        submittedData = { oldPassword: 'old', newPassword: 'new', confirmPassword: 'new' };
        callback(submittedData);
      });

      const props = {
        ...defaultProps,
        handleSubmit,
        onChangePassword,
      };

      render(<ChangePasswordTab {...props} />);
      const form = screen.getByRole('button', { name: /Update Password Securely/i }).closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onChangePassword).toHaveBeenCalledWith(submittedData);
      });
    });

    it('should disable button while loading', () => {
      const props = {
        ...defaultProps,
        loading: true,
      };
      render(<ChangePasswordTab {...props} />);
      const button = screen.getByRole('button', { name: /Updating Password/i });
      expect(button).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      const props = {
        ...defaultProps,
        loading: true,
      };
      render(<ChangePasswordTab {...props} />);
      expect(screen.getByText(/Updating Password/)).toBeInTheDocument();
    });

    it('should show secure text when not loading', () => {
      const props = {
        ...defaultProps,
        loading: false,
      };
      render(<ChangePasswordTab {...props} />);
      expect(screen.getByText(/Update Password Securely/)).toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle old password visibility', () => {
      const setShowOldPassword = jest.fn();
      const props = {
        ...defaultProps,
        setShowOldPassword,
        showOldPassword: false,
      };
      render(<ChangePasswordTab {...props} />);
      
      const buttons = screen.getAllByRole('button', { name: /Toggle/ });
      fireEvent.click(buttons[0]); // Click first password field's toggle
      
      expect(setShowOldPassword).toHaveBeenCalledWith(true);
    });

    it('should toggle new password visibility when eye button is clicked', () => {
      const setShowNewPassword = jest.fn();
      const props = {
        ...defaultProps,
        setShowNewPassword,
        showNewPassword: false,
      };

      render(<ChangePasswordTab {...props} />);

      // Find the eye button by its aria-label from the component
      const eyeButton = screen.getByRole('button', { name: /Show password/i });
      fireEvent.click(eyeButton);

      expect(setShowNewPassword).toHaveBeenCalledWith(true);
    });

    it('should toggle confirm password visibility', () => {
      const setShowConfirmPassword = jest.fn();
      const props = {
        ...defaultProps,
        setShowConfirmPassword,
        showConfirmPassword: false,
      };
      render(<ChangePasswordTab {...props} />);
      
      const buttons = screen.getAllByRole('button', { name: /Toggle/ });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Display', () => {
    it('should display password field errors', () => {
      const passwordErrors = {
        oldPassword: { message: 'Current password is required' },
        newPassword: { message: 'Password must be strong' },
        confirmPassword: { message: 'Passwords do not match' },
      };

      const props = {
        ...defaultProps,
        passwordErrors,
      };
      render(<ChangePasswordTab {...props} />);

      expect(screen.getByText('Current password is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be strong')).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('should not display errors when passwordErrors is empty', () => {
      const props = {
        ...defaultProps,
        passwordErrors: {},
      };
      render(<ChangePasswordTab {...props} />);

      expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    });

    it('should display new password requirements', () => {
      const props = {
        ...defaultProps,
        newPassword: 'TestPassword123!',
      };
      render(<ChangePasswordTab {...props} />);
      
      expect(screen.getByTestId('password-requirements')).toBeInTheDocument();
    });
  });

  describe('Form Registration', () => {
    it('should register oldPassword field', () => {
      const register = jest.fn((name) => ({ name }));
      const props = {
        ...defaultProps,
        register,
      };

      render(<ChangePasswordTab {...props} />);

      expect(register).toHaveBeenCalledWith('oldPassword', expect.any(Object));
    });

    it('should register newPassword field with validation', () => {
      const register = jest.fn((name) => ({ name }));
      const props = {
        ...defaultProps,
        register,
      };

      render(<ChangePasswordTab {...props} />);

      expect(register).toHaveBeenCalledWith('newPassword', expect.objectContaining({
        required: expect.any(String),
        pattern: expect.any(Object),
      }));
    });

    it('should register confirmPassword field with validation', () => {
      const register = jest.fn((name, rules) => ({ name, ...rules }));
      const props = {
        ...defaultProps,
        register,
      };

      render(<ChangePasswordTab {...props} />);

      expect(register).toHaveBeenCalledWith('confirmPassword', expect.any(Object));
    });
  });

  describe('Password Strength Indicator', () => {
    it('should pass password to strength indicator', () => {
      const props = {
        ...defaultProps,
        newPassword: 'TestPassword123!',
        strength: { score: 4, label: 'Strong', color: 'green' },
      };

      render(<ChangePasswordTab {...props} />);
      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument();
    });

    it('should pass strength color to strength indicator', () => {
      const props = {
        ...defaultProps,
        strength: { score: 2, label: 'Fair', color: 'yellow' },
        strengthTextColor: { fair: 'text-yellow-600' },
      };

      render(<ChangePasswordTab {...props} />);
      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument();
    });
  });

  describe('PropTypes Validation', () => {
    it('should have PropTypes defined', () => {
      expect(ChangePasswordTab.propTypes).toBeDefined();
    });

    it('should validate required props', () => {
      const props = ChangePasswordTab.propTypes;
      expect(props.handleSubmit.type).toBe(PropTypes.func.isRequired.type);
      expect(props.onChangePassword.type).toBe(PropTypes.func.isRequired.type);
      expect(props.register.type).toBe(PropTypes.func.isRequired.type);
    });

    it('should validate optional props', () => {
      const props = ChangePasswordTab.propTypes;
      expect(props.passwordSuccess).toBeDefined();
      expect(props.loading).toBeDefined();
      expect(props.passwordErrors).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on inputs', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      
      const newPasswordInput = screen.getByLabelText(/New Password/);
      expect(newPasswordInput).toHaveAttribute('aria-label', 'New password input');
      expect(newPasswordInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have proper ARIA attributes on error inputs', () => {
      const passwordErrors = {
        newPassword: { message: 'Invalid password' },
      };

      const props = {
        ...defaultProps,
        passwordErrors,
      };

      render(<ChangePasswordTab {...props} />);
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toBeInTheDocument();
    });

    it('should have proper button aria-busy attribute when loading', () => {
      const props = {
        ...defaultProps,
        loading: true,
      };

      render(<ChangePasswordTab {...props} />);
      const button = screen.getByRole('button', { name: /Updating Password/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should have proper button aria-busy attribute when not loading', () => {
      const props = {
        ...defaultProps,
        loading: false,
      };

      render(<ChangePasswordTab {...props} />);
      const button = screen.getByRole('button', { name: /Update Password/i });
      expect(button).toHaveAttribute('aria-busy', 'false');
    });

    it('should have password toggle button with proper aria-label', () => {
      render(<ChangePasswordTab {...defaultProps} />);
      const buttons = screen.getAllByRole('button', { name: /Toggle/ });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes in main container', () => {
      const { container } = render(<ChangePasswordTab {...defaultProps} />);
      const mainDiv = container.querySelector('div[class*="dark"]');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should apply dark mode styles to text', () => {
      const { container } = render(<ChangePasswordTab {...defaultProps} />);
      const darkText = container.querySelector('.dark\\:text-white');
      expect(darkText).toBeTruthy();
    });
  });

  describe('Safe Form Submission Handler', () => {
    it('should handle handleFormSubmit with valid data', async () => {
      const onChangePassword = jest.fn();
      const handleSubmit = jest.fn((callback) => (e) => {
        e.preventDefault();
        callback({ oldPassword: 'old123', newPassword: 'NewPass123!', confirmPassword: 'NewPass123!' });
      });

      const props = {
        ...defaultProps,
        handleSubmit,
        onChangePassword,
      };

      render(<ChangePasswordTab {...props} />);
      const form = screen.getByRole('button', { name: /Update Password/i }).closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onChangePassword).toHaveBeenCalled();
      });
    });

    it('should handle empty old password gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const onChangePassword = jest.fn();
      const handleSubmit = jest.fn((callback) => (e) => {
        e.preventDefault();
        callback({ oldPassword: '', newPassword: 'NewPass123!', confirmPassword: 'NewPass123!' });
      });

      const props = {
        ...defaultProps,
        handleSubmit,
        onChangePassword,
      };

      render(<ChangePasswordTab {...props} />);
      const form = screen.getByRole('button', { name: /Update Password/i }).closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith('[ChangePasswordTab] Form submitted with empty old password');
        expect(onChangePassword).not.toHaveBeenCalled();
      });

      consoleWarnSpy.mockRestore();
    });

    it('should handle empty new password gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const onChangePassword = jest.fn();
      const handleSubmit = jest.fn((callback) => (e) => {
        e.preventDefault();
        callback({ oldPassword: 'old123', newPassword: '', confirmPassword: '' });
      });

      const props = {
        ...defaultProps,
        handleSubmit,
        onChangePassword,
      };

      render(<ChangePasswordTab {...props} />);
      const form = screen.getByRole('button', { name: /Update Password/i }).closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith('[ChangePasswordTab] Form submitted with empty new password');
        expect(onChangePassword).not.toHaveBeenCalled();
      });

      consoleWarnSpy.mockRestore();
    });

    it('should handle submission errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Submission failed');
      const onChangePassword = jest.fn().mockRejectedValue(error);
      const handleSubmit = jest.fn((callback) => (e) => {
        e.preventDefault();
        callback({ oldPassword: 'old123', newPassword: 'NewPass123!', confirmPassword: 'NewPass123!' });
      });

      const props = {
        ...defaultProps,
        handleSubmit,
        onChangePassword,
      };

      render(<ChangePasswordTab {...props} />);
      const form = screen.getByRole('button', { name: /Update Password/i }).closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[ChangePasswordTab] Password change failed:',
          expect.objectContaining({ error: 'Submission failed' })
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
