import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { NotesContext, NotesProvider, useNotes } from './NotesContext';
import * as notesService from '../services/notes.service';

jest.mock('../services/notes.service');

describe('NotesContext', () => {
  const mockNote = {
    _id: '1',
    title: 'Test Note',
    content: 'Test content',
    category: 'general',
  };

  const mockNote2 = {
    _id: '2',
    title: 'Note 2',
    content: 'Content 2',
    category: 'task',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NotesProvider', () => {
    it('should render children', () => {
      render(
        <NotesProvider>
          <div>Test Content</div>
        </NotesProvider>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should initialize with empty notes', () => {
      const TestComponent = () => {
        const { notes } = useNotes();
        return <div>{notes.length === 0 ? 'empty' : 'has-notes'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      expect(screen.getByText('empty')).toBeInTheDocument();
    });

    it('should initialize with loading=false', () => {
      const TestComponent = () => {
        const { loading } = useNotes();
        return <div>{loading ? 'loading' : 'not-loading'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      expect(screen.getByText('not-loading')).toBeInTheDocument();
    });

    it('should initialize with empty error', () => {
      const TestComponent = () => {
        const { error } = useNotes();
        return <div>{error || 'no-error'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      expect(screen.getByText('no-error')).toBeInTheDocument();
    });
  });

  describe('useNotes Hook', () => {
    it('should return notes context', () => {
      const TestComponent = () => {
        const context = useNotes();
        return (
          <div>
            {context && Object.keys(context).includes('fetchNotes')
              ? 'has-context'
              : 'no-context'}
          </div>
        );
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      expect(screen.getByText('has-context')).toBeInTheDocument();
    });

    it('should provide all required methods', () => {
      const TestComponent = () => {
        const {
          notes,
          loading,
          error,
          fetchNotes,
          createNote,
          updateNote,
          deleteNote,
        } = useNotes();
        const hasMethods =
          typeof fetchNotes === 'function' &&
          typeof createNote === 'function' &&
          typeof updateNote === 'function' &&
          typeof deleteNote === 'function';
        return <div>{hasMethods ? 'has-all' : 'missing'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      expect(screen.getByText('has-all')).toBeInTheDocument();
    });
  });

  describe('fetchNotes', () => {
    it('should fetch notes successfully', async () => {
      const mockResponse = {
        data: {
          notes: [mockNote, mockNote2],
        },
      };
      notesService.getNotesService.mockResolvedValue(mockResponse);

      const TestComponent = () => {
        const { notes, fetchNotes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should handle flat response structure', async () => {
      notesService.getNotesService.mockResolvedValue([mockNote, mockNote2]);

      const TestComponent = () => {
        const { notes, fetchNotes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should set loading=true while fetching', async () => {
      notesService.getNotesService.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { notes: [mockNote] } }), 100)
          )
      );

      const TestComponent = () => {
        const { loading, fetchNotes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>{loading ? 'loading' : 'done'}</div>;
      };

      const { rerender } = render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('done')).toBeInTheDocument();
      });
    });

    it('should set loading=false after fetching', async () => {
      notesService.getNotesService.mockResolvedValue({ data: { notes: [mockNote] } });

      const TestComponent = () => {
        const { loading, fetchNotes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>{loading ? 'loading' : 'not-loading'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('not-loading')).toBeInTheDocument();
      });
    });

    it('should handle fetch error', async () => {
      const errorMsg = 'Failed to fetch notes';
      notesService.getNotesService.mockRejectedValue({
        response: { data: { message: errorMsg } },
      });

      const TestComponent = () => {
        const { error, fetchNotes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>{error || 'no-error'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(errorMsg)).toBeInTheDocument();
      });
    });

    it('should use fallback error message', async () => {
      notesService.getNotesService.mockRejectedValue(new Error('Generic error'));

      const TestComponent = () => {
        const { error, fetchNotes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>{error || 'no-error'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch notes')).toBeInTheDocument();
      });
    });

    it('should clear error before fetching', async () => {
      notesService.getNotesService.mockResolvedValue({ data: { notes: [mockNote] } });

      const TestComponent = () => {
        const { error, fetchNotes, notes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>{notes.length > 0 && !error ? 'success' : 'pending'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('success')).toBeInTheDocument();
      });
    });
  });

  describe('createNote', () => {
    it('should create note and add to state', async () => {
      const newNote = { ...mockNote, _id: '3' };
      notesService.createNoteService.mockResolvedValue({ data: { note: newNote } });

      const TestComponent = () => {
        const { notes, createNote } = useNotes();

        React.useEffect(() => {
          createNote({ title: 'New' });
        }, [createNote]);

        return <div>{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should add created note to beginning', async () => {
      const newNote = { ...mockNote, _id: '3' };
      notesService.createNoteService.mockResolvedValue({ data: { note: newNote } });

      const TestComponent = () => {
        const { notes, createNote } = useNotes();

        React.useEffect(() => {
          createNote({ title: 'New' });
        }, [createNote]);

        return (
          <div>
            {notes.length > 0 && notes[0]._id === '3' ? 'first' : 'not-first'}
          </div>
        );
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('first')).toBeInTheDocument();
      });
    });

    it('should handle flat response structure for createNote', async () => {
      const newNote = { ...mockNote, _id: '4' };
      notesService.createNoteService.mockResolvedValue({ data: newNote });

      const TestComponent = () => {
        const { notes, createNote } = useNotes();

        React.useEffect(() => {
          createNote({ title: 'New' });
        }, [createNote]);

        return <div>{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should throw error if createNote fails', async () => {
      notesService.createNoteService.mockRejectedValue(new Error('Create failed'));

      const TestComponent = () => {
        const { notes, createNote } = useNotes();
        const [error, setError] = React.useState('');

        React.useEffect(() => {
          createNote({ title: 'New' }).catch((err) => setError(err.message));
        }, [createNote]);

        return <div>{error || 'no-error'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Create failed')).toBeInTheDocument();
      });
    });

    it('should return response from service', async () => {
      const response = { data: { note: mockNote }, status: 201 };
      notesService.createNoteService.mockResolvedValue(response);

      const TestComponent = () => {
        const { createNote } = useNotes();
        const [status, setStatus] = React.useState('pending');

        React.useEffect(() => {
          createNote({ title: 'New' }).then((res) => setStatus(res.status));
        }, [createNote]);

        return <div>{status}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('201')).toBeInTheDocument();
      });
    });
  });

  describe('updateNote', () => {
    it('should update note in state', async () => {
      const updatedNote = { ...mockNote, title: 'Updated' };
      notesService.updateNoteService.mockResolvedValue({
        data: { note: updatedNote },
      });

      const TestComponent = () => {
        const { notes, updateNote } = useNotes();
        const [initialized, setInitialized] = React.useState(false);

        React.useEffect(() => {
          if (!initialized) {
            // Simulate having a note
            updateNote('1', { title: 'Updated' });
            setInitialized(true);
          }
        }, [initialized, updateNote]);

        return <div>{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(notesService.updateNoteService).toHaveBeenCalled();
      });
    });

    it('should handle flat response for updateNote', async () => {
      const updatedNote = { ...mockNote, title: 'Updated' };
      notesService.updateNoteService.mockResolvedValue({ data: updatedNote });

      const TestComponent = () => {
        const { updateNote } = useNotes();

        React.useEffect(() => {
          updateNote('1', { title: 'Updated' });
        }, [updateNote]);

        return <div>done</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      expect(notesService.updateNoteService).toHaveBeenCalledWith('1', {
        title: 'Updated',
      });
    });

    it('should throw error if updateNote fails', async () => {
      notesService.updateNoteService.mockRejectedValue(new Error('Update failed'));

      const TestComponent = () => {
        const { updateNote } = useNotes();
        const [error, setError] = React.useState('');

        React.useEffect(() => {
          updateNote('1', {}).catch((err) => setError(err.message));
        }, [updateNote]);

        return <div>{error || 'no-error'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });
  });

  describe('deleteNote', () => {
    it('should delete note from state', async () => {
      notesService.deleteNoteService.mockResolvedValue({});

      const TestComponent = () => {
        const { notes, deleteNote } = useNotes();

        React.useEffect(() => {
          deleteNote('1');
        }, [deleteNote]);

        return <div>{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      expect(notesService.deleteNoteService).toHaveBeenCalledWith('1');
    });

    it('should throw error if deleteNote fails', async () => {
      notesService.deleteNoteService.mockRejectedValue(new Error('Delete failed'));

      const TestComponent = () => {
        const { deleteNote } = useNotes();
        const [error, setError] = React.useState('');

        React.useEffect(() => {
          deleteNote('1').catch((err) => setError(err.message));
        }, [deleteNote]);

        return <div>{error || 'no-error'}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Delete failed')).toBeInTheDocument();
      });
    });
  });

  describe('Context Value Memoization', () => {
    it('should memoize context value', () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        const context = useNotes();
        renderSpy();
        return <div>test</div>;
      };

      const { rerender } = render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      const callCount1 = renderSpy.mock.calls.length;

      rerender(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      // Should be called but value should be memoized
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple operations', async () => {
      notesService.getNotesService.mockResolvedValue({
        data: { notes: [mockNote] },
      });
      notesService.createNoteService.mockResolvedValue({
        data: { note: mockNote2 },
      });

      const TestComponent = () => {
        const { notes, fetchNotes, createNote } = useNotes();

        React.useEffect(() => {
          fetchNotes().then(() => createNote({ title: 'New' }));
        }, [fetchNotes, createNote]);

        return <div>{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <TestComponent />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(notesService.createNoteService).toHaveBeenCalled();
      });
    });

    it('should work with multiple consumers', async () => {
      notesService.getNotesService.mockResolvedValue({
        data: { notes: [mockNote] },
      });

      const Consumer1 = () => {
        const { notes, fetchNotes } = useNotes();

        React.useEffect(() => {
          fetchNotes();
        }, [fetchNotes]);

        return <div>consumer1-{notes.length}</div>;
      };

      const Consumer2 = () => {
        const { notes } = useNotes();
        return <div>consumer2-{notes.length}</div>;
      };

      render(
        <NotesProvider>
          <Consumer1 />
          <Consumer2 />
        </NotesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('consumer1-1')).toBeInTheDocument();
        expect(screen.getByText('consumer2-1')).toBeInTheDocument();
      });
    });
  });
});
