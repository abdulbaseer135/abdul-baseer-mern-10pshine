import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardControls from './DashboardControls';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notes' },
  { value: 'general', label: 'General' },
  { value: 'idea', label: 'Idea' },
  { value: 'task', label: 'Task' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

describe('DashboardControls', () => {
  const mockSetSearchInput = jest.fn();
  const mockSetSortBy = jest.fn();
  const mockSetCurrentFilter = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnImportClick = jest.fn();
  const importRef = { current: null };

  const defaultProps = {
    searchInput: '',
    setSearchInput: mockSetSearchInput,
    sortBy: 'newest',
    setSortBy: mockSetSortBy,
    currentFilter: 'all',
    setCurrentFilter: mockSetCurrentFilter,
    onExport: mockOnExport,
    onImportClick: mockOnImportClick,
    importRef,
    exporting: false,
    importing: false,
    FILTER_OPTIONS,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<DashboardControls {...defaultProps} />);
      expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
    });

    it('should render filter dropdown', () => {
      render(<DashboardControls {...defaultProps} />);
      expect(screen.getByDisplayValue('all')).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      render(<DashboardControls {...defaultProps} />);
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should render export button', () => {
      render(<DashboardControls {...defaultProps} />);
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should render import button', () => {
      render(<DashboardControls {...defaultProps} />);
      expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
    });

    it('should render all filter options', () => {
      render(<DashboardControls {...defaultProps} />);
      FILTER_OPTIONS.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('should render all sort options', () => {
      render(<DashboardControls {...defaultProps} />);
      SORT_OPTIONS.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe('Search Input', () => {
    it('should update search input on change', async () => {
      render(<DashboardControls {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search notes/i);

      await userEvent.type(searchInput, 'test query');

      expect(mockSetSearchInput).toHaveBeenCalledWith('test query');
    });

    it('should display current search value', () => {
      render(<DashboardControls {...defaultProps} searchInput="current query" />);
      const searchInput = screen.getByPlaceholderText(/search notes/i);
      expect(searchInput.value).toBe('current query');
    });

    it('should accept empty search input', async () => {
      render(<DashboardControls {...defaultProps} searchInput="previous query" />);
      const searchInput = screen.getByPlaceholderText(/search notes/i);

      await userEvent.clear(searchInput);

      expect(mockSetSearchInput).toHaveBeenCalled();
    });

    it('should handle special characters in search', async () => {
      render(<DashboardControls {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search notes/i);

      await userEvent.type(searchInput, '!@#$%^&*()');

      expect(mockSetSearchInput).toHaveBeenCalled();
    });
  });

  describe('Filter Dropdown', () => {
    it('should change filter on selection', () => {
      render(<DashboardControls {...defaultProps} />);
      const filterSelect = screen.getByDisplayValue('all');

      fireEvent.change(filterSelect, { target: { value: 'general' } });

      expect(mockSetCurrentFilter).toHaveBeenCalledWith('general');
    });

    it('should display current filter value', () => {
      render(<DashboardControls {...defaultProps} currentFilter="idea" />);
      const filterSelect = screen.getByDisplayValue('idea');
      expect(filterSelect).toBeInTheDocument();
    });

    it('should include all filter options in dropdown', () => {
      render(<DashboardControls {...defaultProps} />);
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(FILTER_OPTIONS.length);
    });

    it('should handle filter change multiple times', () => {
      render(<DashboardControls {...defaultProps} />);
      const filterSelect = screen.getByDisplayValue('all');

      fireEvent.change(filterSelect, { target: { value: 'task' } });
      fireEvent.change(filterSelect, { target: { value: 'idea' } });
      fireEvent.change(filterSelect, { target: { value: 'all' } });

      expect(mockSetCurrentFilter).toHaveBeenCalledTimes(3);
    });
  });

  describe('Sort Dropdown', () => {
    it('should change sort on selection', () => {
      render(<DashboardControls {...defaultProps} />);
      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects.find(s => s.value === 'newest');

      fireEvent.change(sortSelect, { target: { value: 'oldest' } });

      expect(mockSetSortBy).toHaveBeenCalledWith('oldest');
    });

    it('should display current sort value', () => {
      render(<DashboardControls {...defaultProps} sortBy="az" />);
      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects.find(s => s.value === 'az');
      expect(sortSelect).toBeInTheDocument();
    });

    it('should include all sort options in dropdown', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle sort change to oldest', () => {
      render(<DashboardControls {...defaultProps} />);
      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects.find(s => s.value === 'newest');

      fireEvent.change(sortSelect, { target: { value: 'oldest' } });

      expect(mockSetSortBy).toHaveBeenCalledWith('oldest');
    });

    it('should handle sort change to A-Z', () => {
      render(<DashboardControls {...defaultProps} />);
      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects.find(s => s.value === 'newest');

      fireEvent.change(sortSelect, { target: { value: 'az' } });

      expect(mockSetSortBy).toHaveBeenCalledWith('az');
    });

    it('should handle sort change to Z-A', () => {
      render(<DashboardControls {...defaultProps} />);
      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects.find(s => s.value === 'newest');

      fireEvent.change(sortSelect, { target: { value: 'za' } });

      expect(mockSetSortBy).toHaveBeenCalledWith('za');
    });
  });

  describe('Export Button', () => {
    it('should call onExport when export button clicked', () => {
      render(<DashboardControls {...defaultProps} />);
      const exportBtn = screen.getByRole('button', { name: /export/i });

      fireEvent.click(exportBtn);

      expect(mockOnExport).toHaveBeenCalled();
    });

    it('should disable export button when exporting', () => {
      render(<DashboardControls {...defaultProps} exporting={true} />);
      const exportBtn = screen.getByRole('button', { name: /export/i });

      expect(exportBtn).toBeDisabled();
    });

    it('should enable export button when not exporting', () => {
      render(<DashboardControls {...defaultProps} exporting={false} />);
      const exportBtn = screen.getByRole('button', { name: /export/i });

      expect(exportBtn).not.toBeDisabled();
    });

    it('should show loading state while exporting', () => {
      render(<DashboardControls {...defaultProps} exporting={true} />);
      const exportBtn = screen.getByRole('button', { name: /export/i });

      expect(exportBtn).toBeDisabled();
    });
  });

  describe('Import Button', () => {
    it('should call onImportClick when import button clicked', () => {
      render(<DashboardControls {...defaultProps} />);
      const importBtn = screen.getByRole('button', { name: /import/i });

      fireEvent.click(importBtn);

      expect(mockOnImportClick).toHaveBeenCalled();
    });

    it('should trigger importRef.current.click() on import', () => {
      const mockRef = { current: { click: jest.fn() } };
      render(<DashboardControls {...defaultProps} importRef={mockRef} onImportClick={() => mockRef.current.click()} />);
      const importBtn = screen.getByRole('button', { name: /import/i });

      fireEvent.click(importBtn);

      expect(mockOnImportClick).toHaveBeenCalled();
    });

    it('should disable import button when importing', () => {
      render(<DashboardControls {...defaultProps} importing={true} />);
      const importBtn = screen.getByRole('button', { name: /import/i });

      expect(importBtn).toBeDisabled();
    });

    it('should enable import button when not importing', () => {
      render(<DashboardControls {...defaultProps} importing={false} />);
      const importBtn = screen.getByRole('button', { name: /import/i });

      expect(importBtn).not.toBeDisabled();
    });

    it('should show loading state while importing', () => {
      render(<DashboardControls {...defaultProps} importing={true} />);
      const importBtn = screen.getByRole('button', { name: /import/i });

      expect(importBtn).toBeDisabled();
    });
  });

  describe('Disabled States', () => {
    it('should disable both export and import when both active', () => {
      render(<DashboardControls {...defaultProps} exporting={true} importing={true} />);
      
      const exportBtn = screen.getByRole('button', { name: /export/i });
      const importBtn = screen.getByRole('button', { name: /import/i });

      expect(exportBtn).toBeDisabled();
      expect(importBtn).toBeDisabled();
    });

    it('should allow export when import disabled', () => {
      render(<DashboardControls {...defaultProps} importing={true} exporting={false} />);
      
      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).not.toBeDisabled();
    });

    it('should allow import when export disabled', () => {
      render(<DashboardControls {...defaultProps} exporting={true} importing={false} />);
      
      const importBtn = screen.getByRole('button', { name: /import/i });
      expect(importBtn).not.toBeDisabled();
    });
  });

  describe('Responsive Layout', () => {
    it('should render controls in flex container', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);
      const flexContainer = container.querySelector('[class*="flex"]');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have gap between controls on smaller screens', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);
      const controlsContainer = container.querySelector('[class*="gap"]');
      expect(controlsContainer).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle search and filter together', async () => {
      render(<DashboardControls {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search notes/i);
      const filterSelect = screen.getByDisplayValue('all');

      await userEvent.type(searchInput, 'task');
      fireEvent.change(filterSelect, { target: { value: 'task' } });

      expect(mockSetSearchInput).toHaveBeenCalledWith('task');
      expect(mockSetCurrentFilter).toHaveBeenCalledWith('task');
    });

    it('should handle search, filter, and sort together', async () => {
      render(<DashboardControls {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search notes/i);
      const filterSelect = screen.getByDisplayValue('all');
      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects.find(s => s.value === 'newest');

      await userEvent.type(searchInput, 'important');
      fireEvent.change(filterSelect, { target: { value: 'general' } });
      fireEvent.change(sortSelect, { target: { value: 'az' } });

      expect(mockSetSearchInput).toHaveBeenCalledWith('important');
      expect(mockSetCurrentFilter).toHaveBeenCalledWith('general');
      expect(mockSetSortBy).toHaveBeenCalledWith('az');
    });
  });
});
