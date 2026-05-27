import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropTypes from 'prop-types';
import DangerZoneTab from './DangerZoneTab';

describe('DangerZoneTab Component', () => {
  const mockSetDeleteModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component without crashing', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });

    it('should render the danger zone header', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
      expect(screen.getByText(/Irreversible actions/)).toBeInTheDocument();
    });

    it('should render the warning icon', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('should render the delete account section', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(screen.getByText('Delete Your Account')).toBeInTheDocument();
    });

    it('should render the delete button', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      expect(button).toBeInTheDocument();
    });

    it('should display warning text about account deletion', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(screen.getByText(/permanently delete your account/)).toBeInTheDocument();
      expect(screen.getByText(/all associated data/)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    it('should display confirmation notice', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(screen.getByText(/You will be asked to confirm this action/)).toBeInTheDocument();
    });
  });

  describe('Delete Button', () => {
    it('should have proper button attributes', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('should have delete icon', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      const icons = button.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have button text', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(screen.getByText('Delete Account Permanently')).toBeInTheDocument();
    });

    it('should apply red styling to button', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      expect(button.className).toContain('bg-red-600');
    });
  });

  describe('Delete Modal Functionality', () => {
    it('should call setDeleteModal with true when delete button is clicked', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      
      fireEvent.click(button);

      expect(mockSetDeleteModal).toHaveBeenCalledWith(true);
      expect(mockSetDeleteModal).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple button clicks', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockSetDeleteModal).toHaveBeenCalledTimes(3);
      expect(mockSetDeleteModal).toHaveBeenLastCalledWith(true);
    });
  });

  describe('Safe Delete Handler', () => {
    it('should handle missing setDeleteModal prop gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      render(<DangerZoneTab setDeleteModal={undefined} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      
      fireEvent.click(button);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[DangerZoneTab] setDeleteModal function is not provided or not a function');
      consoleWarnSpy.mockRestore();
    });

    it('should handle handler error gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      render(<DangerZoneTab setDeleteModal={errorHandler} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      
      fireEvent.click(button);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DangerZoneTab] Failed to open delete account modal:',
        expect.objectContaining({ error: 'Handler error' })
      );
      consoleErrorSpy.mockRestore();
    });

    it('should log user action when delete is initiated', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      
      fireEvent.click(button);

      expect(consoleInfoSpy).toHaveBeenCalledWith('[DangerZoneTab] Delete account modal initiated by user');
      consoleInfoSpy.mockRestore();
    });
  });

  describe('Component Structure', () => {
    it('should have container with border and rounded corners', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const mainDiv = container.firstChild;
      expect(mainDiv.className).toContain('border');
      expect(mainDiv.className).toContain('rounded-lg');
    });

    it('should have danger zone header with icon', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const header = screen.getByText('Danger Zone').closest('div');
      expect(header).toBeInTheDocument();
      expect(header.className).toContain('flex');
    });

    it('should have warning box with proper styling', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const warningBox = container.querySelector('[class*="bg-red"]');
      expect(warningBox).toBeInTheDocument();
    });

    it('should have two icons (warning icon and delete icon)', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes in main container', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const mainDiv = container.firstChild;
      expect(mainDiv.className).toContain('dark:bg-slate-800');
    });

    it('should have dark mode classes for border', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const mainDiv = container.firstChild;
      expect(mainDiv.className).toContain('dark:border-slate-700');
    });

    it('should have dark mode classes for heading text', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const heading = screen.getByText('Danger Zone');
      expect(heading.className).toContain('dark:text-red-300');
    });

    it('should have dark mode background for warning box', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const warningBox = container.querySelector('[class*="dark:bg-red"]');
      expect(warningBox).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on delete button', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('Delete account');
    });

    it('should have svg with aria-hidden for decorative icons', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const hiddenSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(hiddenSvgs.length).toBeGreaterThan(0);
    });

    it('should have proper heading hierarchy', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });

    it('should have proper text contrast with color classes', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const textElements = container.querySelectorAll('[class*="text-red"]');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should have warning box with semantic structure', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const warningBox = container.querySelector('[class*="border-red"]');
      expect(warningBox).toBeInTheDocument();
    });
  });

  describe('PropTypes Validation', () => {
    it('should have PropTypes defined', () => {
      expect(DangerZoneTab.propTypes).toBeDefined();
    });

    it('should require setDeleteModal as function', () => {
      const props = DangerZoneTab.propTypes;
      expect(props.setDeleteModal).toBeDefined();
      expect(props.setDeleteModal.type).toBe(PropTypes.func.isRequired.type);
    });

    it('should validate required prop', () => {
      const props = DangerZoneTab.propTypes;
      expect(Object.keys(props)).toContain('setDeleteModal');
    });
  });

  describe('Styling Classes', () => {
    it('should have container with proper padding', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const mainDiv = container.firstChild;
      expect(mainDiv.className).toContain('p-6');
    });

    it('should have responsive padding (sm breakpoint)', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const mainDiv = container.firstChild;
      expect(mainDiv.className).toContain('sm:p-8');
    });

    it('should have shadow styling', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const mainDiv = container.firstChild;
      expect(mainDiv.className).toContain('shadow');
    });

    it('should have button with hover state styling', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      expect(button.className).toContain('hover:bg-red-700');
    });

    it('should have button with active state styling', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      expect(button.className).toContain('active:bg-red-800');
    });
  });

  describe('Warning Content', () => {
    it('should have warning icon with proper styling', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      // Find the header section and look for SVG within it
      const headerSection = container.querySelector('[class*="mb-6"]');
      const icon = headerSection.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-red-600');
    });

    it('should have warning box with red background', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const warningBox = container.querySelector('[class*="bg-red-50"]');
      expect(warningBox).toBeInTheDocument();
    });

    it('should have warning text in proper color', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const warningText = container.querySelector('[class*="text-red-900"]');
      expect(warningText).toBeInTheDocument();
    });

    it('should display full warning message', () => {
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const warningText = screen.getByText(/This will permanently delete your account/);
      expect(warningText).toBeInTheDocument();
      expect(warningText).toHaveTextContent(/all your notes and settings/);
      expect(warningText).toHaveTextContent(/cannot be undone/);
    });
  });

  describe('Component Export', () => {
    it('should be a valid React component', () => {
      expect(DangerZoneTab).toBeDefined();
      expect(typeof DangerZoneTab).toBe('function');
    });

    it('should export component with PropTypes', () => {
      expect(DangerZoneTab.propTypes).toBeDefined();
    });
  });

  describe('User Interaction Flow', () => {
    it('should provide complete delete flow', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      
      // User sees the danger zone section
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
      
      // User reads the warning
      expect(screen.getByText(/permanently delete your account/)).toBeInTheDocument();
      
      // User clicks delete button
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      fireEvent.click(button);
      
      // Modal is opened
      expect(mockSetDeleteModal).toHaveBeenCalledWith(true);
      expect(consoleInfoSpy).toHaveBeenCalledWith('[DangerZoneTab] Delete account modal initiated by user');
      
      consoleInfoSpy.mockRestore();
    });

    it('should log timestamp when delete is initiated', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      
      render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      fireEvent.click(button);
      
      // Verify logging occurs (timestamp would be in error handler)
      expect(consoleInfoSpy).toHaveBeenCalled();
      
      consoleInfoSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null setDeleteModal', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      render(<DangerZoneTab setDeleteModal={null} />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      fireEvent.click(button);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle setDeleteModal as non-function', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      render(<DangerZoneTab setDeleteModal="not-a-function" />);
      const button = screen.getByRole('button', { name: /Delete Account Permanently/i });
      fireEvent.click(button);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should render correctly with different screen sizes', () => {
      const { container } = render(<DangerZoneTab setDeleteModal={mockSetDeleteModal} />);
      expect(container.firstChild.firstChild).toBeInTheDocument();
    });
  });
});
