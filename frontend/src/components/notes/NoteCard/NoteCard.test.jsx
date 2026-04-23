import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard from './NoteCard';

const mockNote = {
  _id: '1',
  title: 'My Test Note',
  content: 'This is test content',
  updatedAt: new Date().toISOString(),
};

describe('NoteCard', () => {
  it('renders note title and content', () => {
    render(<NoteCard note={mockNote} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('My Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is test content')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button clicked', () => {
    const onEdit = jest.fn();
    render(<NoteCard note={mockNote} onEdit={onEdit} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByText('✏️ Edit'));
    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it('calls onDelete when Delete button clicked', () => {
    const onDelete = jest.fn();
    render(<NoteCard note={mockNote} onEdit={jest.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('🗑️ Delete'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});