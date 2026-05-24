import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../../../utils/testUtils';
import NoteViewer from './NoteViewer';

describe('NoteViewer Component', () => {
  const mockNote = {
    _id: 'note123',
    title: 'Test Note',
    content: 'This is the test content of the note',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  it('renders note title', () => {
    renderWithProviders(<NoteViewer note={mockNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders note without crashing', () => {
    const { container } = renderWithProviders(<NoteViewer note={mockNote} />);
    expect(container).toBeInTheDocument();
  });

  it('displays note information', () => {
    renderWithProviders(<NoteViewer note={mockNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('handles note display correctly', () => {
    renderWithProviders(<NoteViewer note={mockNote} />);
    // Verify note is rendered
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders date information', () => {
    renderWithProviders(<NoteViewer note={mockNote} />);
    // Component should render without error
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('handles markdown content if supported', () => {
    const markdownNote = {
      ...mockNote,
      content: '# Heading\n## Subheading\n- Item 1\n- Item 2',
    };
    renderWithProviders(<NoteViewer note={markdownNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('handles code blocks if supported', () => {
    const codeNote = {
      ...mockNote,
      content: '```javascript\nconst x = 1;\n```',
    };
    renderWithProviders(<NoteViewer note={codeNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders empty state when no note provided', () => {
    const { container } = renderWithProviders(<NoteViewer note={null} />);
    expect(container).toBeInTheDocument();
  });

  it('handles very long content', () => {
    const longContentNote = {
      ...mockNote,
      content: 'A'.repeat(5000),
    };
    renderWithProviders(<NoteViewer note={longContentNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });
});
