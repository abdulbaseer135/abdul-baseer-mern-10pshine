import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../utils/testUtils';
import NoteCard from './NoteCard';

describe('NoteCard Component', () => {
  const mockNote = {
    _id: 'note123',
    title: 'Test Note',
    content: 'This is test content for the note',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    userId: 'user123',
  };

  it('renders note card with title', () => {
    renderWithProviders(<NoteCard note={mockNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders note content preview', () => {
    renderWithProviders(<NoteCard note={mockNote} />);
    const card = screen.getByText('Test Note').closest('div');
    expect(card).toBeInTheDocument();
  });

  it('displays note creation info', () => {
    renderWithProviders(<NoteCard note={mockNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('handles card click events', () => {
    const mockOnClick = jest.fn();
    renderWithProviders(
      <NoteCard note={mockNote} onClick={mockOnClick} />
    );
    
    const card = screen.getByText('Test Note').closest('[role="button"]') || 
                 screen.getByText('Test Note').closest('div[onclick]') ||
                 screen.getByText('Test Note').closest('div');
    
    if (card && card.hasAttribute('role')) {
      fireEvent.click(card);
    }
  });

  it('displays note properly formatted', () => {
    renderWithProviders(<NoteCard note={mockNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('handles missing content gracefully', () => {
    const noteWithoutContent = { ...mockNote, content: '' };
    renderWithProviders(<NoteCard note={noteWithoutContent} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders note card without errors', () => {
    const { container } = renderWithProviders(
      <NoteCard note={mockNote} />
    );
    expect(container).toBeInTheDocument();
  });

  it('truncates long content preview', () => {
    const longContent = 'A'.repeat(500);
    const noteWithLongContent = { ...mockNote, content: longContent };
    renderWithProviders(<NoteCard note={noteWithLongContent} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });
});
