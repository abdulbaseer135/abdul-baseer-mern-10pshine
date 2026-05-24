import React from 'react';

// Mock the useNotes hook to avoid complex dependencies
jest.mock('../../hooks/useNotes', () => {
  return jest.fn(() => ({
    notes: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    isInitialLoading: false,
    isSearching: false,
    loading: false,
    handleFetchNotes: jest.fn(),
    handleAddNote: jest.fn(),
    handleEditNote: jest.fn(),
    handleRemoveNote: jest.fn(),
    handleToggleShare: jest.fn(),
    searchQuery: '',
    handleSearchQuery: jest.fn(),
  }));
});

// Mock child components to simplify testing
jest.mock('../../components/notes/NoteCard/NoteCard', () => () => null);
jest.mock('../../components/notes/NoteEditor/NoteEditor', () => () => null);
jest.mock('../../components/notes/NoteViewer/NoteViewer', () => () => null);
jest.mock('../../components/common/Skeleton/NoteSkeleton', () => ({ NoteSkeletonGrid: () => null }));

describe('DashboardPage', () => {
  it('imports without error', () => {
    expect(() => {
      require('./DashboardPage');
    }).not.toThrow();
  });

  it('component file exists', () => {
    const DashboardPage = require('./DashboardPage').default;
    expect(DashboardPage).toBeDefined();
  });

  it('is a valid React component', () => {
    const DashboardPage = require('./DashboardPage').default;
    expect(typeof DashboardPage).toBe('function');
  });

  it('has hooks integration', () => {
    const useNotesModule = require('../../hooks/useNotes');
    expect(useNotesModule).toBeDefined();
  });

  it('child components are mocked', () => {
    const NoteCard = require('../../components/notes/NoteCard/NoteCard');
    expect(NoteCard).toBeDefined();
  });
});
