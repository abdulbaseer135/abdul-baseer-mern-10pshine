import React, { StrictMode, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import NoteEditor from './NoteEditor';

jest.mock('./RichTextEditor', () => {
  const { forwardRef } = require('react');
  return forwardRef(function MockRichTextEditor({ content, onChange }, ref) {
    return <textarea ref={ref} aria-label="Note content" value={content} onChange={(event) => onChange(event.target.value)} />;
  });
});

jest.mock('../../../hooks/useSpeechToText', () => () => ({
  isListening: false,
  isSupported: false,
  finalText: '',
  interimText: '',
}));

const note = { _id: 'note-1', title: 'Existing note', content: '<p>Existing content</p>' };

function EditFlow({ onSave }) {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <button onClick={() => setEditing(true)}>Edit note</button>
      {editing && <NoteEditor note={note} onSave={onSave} onClose={() => setEditing(false)} />}
    </>
  );
}

describe('Note editor dialog lifecycle', () => {
  let originalShowModal;
  let originalClose;

  beforeEach(() => {
    jest.useFakeTimers();
    originalShowModal = HTMLDialogElement.prototype.showModal;
    originalClose = HTMLDialogElement.prototype.close;
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
      // Browsers dispatch the native close event asynchronously.
      setTimeout(() => this.dispatchEvent(new Event('close')), 0);
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it('keeps the existing note open after StrictMode cleanup and allows closing and reopening', () => {
    render(<StrictMode><EditFlow onSave={jest.fn()} /></StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: 'Edit note' }));
    act(() => jest.runOnlyPendingTimers());

    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    expect(screen.getByDisplayValue('Existing note')).toBeInTheDocument();
    expect(screen.getByLabelText('Note content')).toHaveValue('<p>Existing content</p>');

    fireEvent.click(screen.getByRole('button', { name: 'Close note editor' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit note' }));
    act(() => jest.runOnlyPendingTimers());
    expect(screen.getByRole('dialog')).toHaveAttribute('open');

    act(() => {
      screen.getByRole('dialog').close();
      jest.runOnlyPendingTimers();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
