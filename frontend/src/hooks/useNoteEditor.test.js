import { renderHook, act } from '@testing-library/react';
import useNoteEditor from './useNoteEditor';

describe('useNoteEditor', () => {
  it('opens an existing note and closes without saving', () => {
    const { result } = renderHook(() => useNoteEditor(jest.fn()));
    const note = { _id: 'n1', title: 'Task' };
    act(() => result.current.handleEdit(note));
    expect(result.current.editingNote).toEqual(note);
    expect(result.current.showEditor).toBe(true);
    act(() => result.current.handleClose());
    expect(result.current.editingNote).toBeNull();
    expect(result.current.showEditor).toBe(false);
  });
  it('saves edits and refreshes after success', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const refresh = jest.fn();
    const { result } = renderHook(() => useNoteEditor(save, refresh));
    act(() => result.current.handleEdit({ _id: 'n1' }));
    await act(async () => result.current.handleSave({ title: 'Changed' }));
    expect(save).toHaveBeenCalledWith('n1', { title: 'Changed' }, true);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(result.current.showEditor).toBe(false);
  });
  it('retains the editor when saving fails', async () => {
    const { result } = renderHook(() => useNoteEditor(jest.fn().mockResolvedValue(false)));
    act(() => result.current.setShowEditor(true));
    await act(async () => result.current.handleSave({ title: 'Draft' }));
    expect(result.current.showEditor).toBe(true);
    expect(result.current.saving).toBe(false);
  });
  it('clears saving state after an unexpected rejection', async () => {
    const { result } = renderHook(() => useNoteEditor(jest.fn().mockRejectedValue(new Error('Offline'))));
    await act(async () => { await expect(result.current.handleSave({})).rejects.toThrow('Offline'); });
    expect(result.current.saving).toBe(false);
  });
});
