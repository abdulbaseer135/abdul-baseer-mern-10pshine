import { renderHook, act } from '@testing-library/react';
import useDeleteModal from './useDeleteModal';

describe('useDeleteModal', () => {
  it('opens with note details and cancels', () => {
    const { result } = renderHook(() => useDeleteModal(jest.fn()));
    act(() => result.current.handleDeleteClick({ _id: 'n1', title: 'Draft' }));
    expect(result.current.deleteModal).toEqual({ isOpen: true, noteId: 'n1', noteTitle: 'Draft' });
    act(() => result.current.handleDeleteCancel());
    expect(result.current.deleteModal.isOpen).toBe(false);
  });
  it('deletes the selected note and refreshes', async () => {
    const remove = jest.fn().mockResolvedValue(true);
    const refresh = jest.fn();
    const { result } = renderHook(() => useDeleteModal(remove, refresh));
    act(() => result.current.handleDeleteClick({ _id: 'n1', title: 'Draft' }));
    await act(async () => result.current.handleDeleteConfirm());
    expect(remove).toHaveBeenCalledWith('n1');
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(result.current.deleteModal.isOpen).toBe(false);
  });
  it('does not delete without a selection', async () => {
    const remove = jest.fn();
    const { result } = renderHook(() => useDeleteModal(remove));
    await act(async () => result.current.handleDeleteConfirm());
    expect(remove).not.toHaveBeenCalled();
  });
  it('recovers loading state and retains selection on rejection', async () => {
    const { result } = renderHook(() => useDeleteModal(jest.fn().mockRejectedValue(new Error('Offline'))));
    act(() => result.current.handleDeleteClick({ _id: 'n1', title: 'Draft' }));
    await act(async () => { await expect(result.current.handleDeleteConfirm()).rejects.toThrow('Offline'); });
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.deleteModal.isOpen).toBe(true);
  });
});
