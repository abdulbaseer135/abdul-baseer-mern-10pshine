import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  it('renders modal when isOpen is true', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test Modal"
        message="This is a test message"
      />
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Modal 
        isOpen={false} 
        onClose={() => {}} 
        title="Test Modal"
        message="This is a test message"
      />
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders modal title when provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="My Test Title"
        message="Message content"
      />
    );
    
    expect(screen.getByText('My Test Title')).toBeInTheDocument();
  });

  it('renders message text when provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Title"
        message="Important message here"
      />
    );
    
    expect(screen.getByText('Important message here')).toBeInTheDocument();
  });

  it('renders confirm button when onConfirm provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}} 
        confirmText="Delete"
        message="Are you sure?"
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        cancelText="No, Cancel"
        message="Confirm action?"
      />
    );
    
    expect(screen.getByText('No, Cancel')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal 
        isOpen={true} 
        onClose={mockOnClose}
        cancelText="Close"
        message="Test"
      />
    );
    
    const cancelButton = screen.getByText('Close');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = jest.fn();
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={mockOnConfirm}
        confirmText="Confirm"
        message="Confirm?"
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
