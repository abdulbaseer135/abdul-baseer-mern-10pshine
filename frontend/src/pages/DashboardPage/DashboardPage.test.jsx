import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { AuthContext } from '../../context/AuthContext';
import { NotesContext } from '../../context/NotesContext';

const mockUser = { name: 'Abdul', email: 'abdul@test.com' };

const mockNotesContext = {
  notes: [
    { _id: '1', title: 'Test Note', content: 'Test content', updatedAt: new Date().toISOString() },
  ],
  loading: false,
  error: '',
  fetchNotes: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
};

const renderDashboard = (notesCtx = mockNotesContext) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: mockUser, logout: jest.fn() }}>
        <NotesContext.Provider value={notesCtx}>
          <DashboardPage />
        </NotesContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  it('renders dashboard with notes', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('My Notes')).toBeInTheDocument();
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });
  });

  it('shows empty state when no notes', async () => {
    renderDashboard({ ...mockNotesContext, notes: [] });
    await waitFor(() => {
      expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
    });
  });

  it('opens note editor on New Note click', async () => {
    renderDashboard();
    fireEvent.click(screen.getByText('+ New Note'));
    await waitFor(() => {
      expect(screen.getByText('➕ New Note')).toBeInTheDocument();
    });
  });
});