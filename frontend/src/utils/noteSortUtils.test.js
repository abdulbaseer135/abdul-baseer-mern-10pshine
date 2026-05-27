import {
  SORT_OPTIONS,
  sortNotesByOption,
} from './noteSortUtils';

describe('Note Sort Utilities', () => {
  const mockNotes = [
    {
      _id: '1',
      title: 'Zebra Note',
      isPinned: false,
      createdAt: new Date('2026-05-20').toISOString(),
    },
    {
      _id: '2',
      title: 'Apple Note',
      isPinned: true,
      createdAt: new Date('2026-05-15').toISOString(),
    },
    {
      _id: '3',
      title: 'Beta Note',
      isPinned: false,
      createdAt: new Date('2026-05-25').toISOString(),
    },
    {
      _id: '4',
      title: 'Charlie Note',
      isPinned: true,
      createdAt: new Date('2026-05-10').toISOString(),
    },
  ];

  describe('SORT_OPTIONS', () => {
    it('should have all required sort options', () => {
      expect(SORT_OPTIONS.NEWEST).toBe('newest');
      expect(SORT_OPTIONS.OLDEST).toBe('oldest');
      expect(SORT_OPTIONS.A_TO_Z).toBe('az');
      expect(SORT_OPTIONS.Z_TO_A).toBe('za');
    });

    it('should have exactly 4 sort options', () => {
      expect(Object.keys(SORT_OPTIONS)).toHaveLength(4);
    });
  });

  describe('sortNotesByOption', () => {
    it('should sort by newest (default) with pinned first', () => {
      const sorted = sortNotesByOption(mockNotes, SORT_OPTIONS.NEWEST);

      // Pinned notes should come first
      expect(sorted[0].isPinned).toBe(true);
      expect(sorted[1].isPinned).toBe(true);

      // Pinned notes sorted by newest
      expect(new Date(sorted[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sorted[1].createdAt).getTime()
      );

      // Unpinned notes sorted by newest
      expect(new Date(sorted[2].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sorted[3].createdAt).getTime()
      );
    });

    it('should sort by oldest with pinned first', () => {
      const sorted = sortNotesByOption(mockNotes, SORT_OPTIONS.OLDEST);

      // Pinned notes should come first
      expect(sorted[0].isPinned).toBe(true);
      expect(sorted[1].isPinned).toBe(true);

      // Pinned notes sorted by oldest
      expect(new Date(sorted[0].createdAt)).toBeLessThanOrEqual(
        new Date(sorted[1].createdAt)
      );

      // Unpinned notes sorted by oldest
      expect(new Date(sorted[2].createdAt)).toBeLessThanOrEqual(
        new Date(sorted[3].createdAt)
      );
    });

    it('should sort A-Z with pinned first', () => {
      const sorted = sortNotesByOption(mockNotes, SORT_OPTIONS.A_TO_Z);

      // Pinned notes should come first
      expect(sorted[0].isPinned).toBe(true);
      expect(sorted[1].isPinned).toBe(true);

      // Pinned notes sorted A-Z
      const pinnedTitles = sorted
        .slice(0, 2)
        .map((n) => n.title)
        .sort();
      expect([sorted[0].title, sorted[1].title]).toEqual(pinnedTitles);

      // Unpinned notes sorted A-Z
      const unpinnedTitles = sorted
        .slice(2)
        .map((n) => n.title)
        .sort();
      expect([sorted[2].title, sorted[3].title]).toEqual(unpinnedTitles);
    });

    it('should sort Z-A with pinned first', () => {
      const sorted = sortNotesByOption(mockNotes, SORT_OPTIONS.Z_TO_A);

      // Pinned notes should come first
      expect(sorted[0].isPinned).toBe(true);
      expect(sorted[1].isPinned).toBe(true);

      // Pinned notes sorted Z-A
      const pinnedTitles = sorted
        .slice(0, 2)
        .map((n) => n.title)
        .sort()
        .reverse();
      expect([sorted[0].title, sorted[1].title]).toEqual(pinnedTitles);

      // Unpinned notes sorted Z-A
      const unpinnedTitles = sorted
        .slice(2)
        .map((n) => n.title)
        .sort()
        .reverse();
      expect([sorted[2].title, sorted[3].title]).toEqual(unpinnedTitles);
    });

    it('should handle empty array', () => {
      const result = sortNotesByOption([], SORT_OPTIONS.NEWEST);
      expect(result).toEqual([]);
    });

    it('should handle array with single note', () => {
      const result = sortNotesByOption([mockNotes[0]], SORT_OPTIONS.NEWEST);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockNotes[0]);
    });

    it('should handle array with only pinned notes', () => {
      const pinnedOnly = mockNotes.filter((n) => n.isPinned);
      const result = sortNotesByOption(pinnedOnly, SORT_OPTIONS.NEWEST);
      expect(result.every((n) => n.isPinned)).toBe(true);
    });

    it('should handle array with only unpinned notes', () => {
      const unpinnedOnly = mockNotes.filter((n) => !n.isPinned);
      const result = sortNotesByOption(unpinnedOnly, SORT_OPTIONS.NEWEST);
      expect(result.every((n) => !n.isPinned)).toBe(true);
    });

    it('should not mutate original array', () => {
      const original = [...mockNotes];
      sortNotesByOption(mockNotes, SORT_OPTIONS.NEWEST);
      expect(mockNotes).toEqual(original);
    });

    it('should use NEWEST as default sort option', () => {
      const result = sortNotesByOption(mockNotes);
      const resultDefault = sortNotesByOption(mockNotes, SORT_OPTIONS.NEWEST);
      expect(result).toEqual(resultDefault);
    });

    it('should handle notes with null titles', () => {
      const notesWithNull = [
        { ...mockNotes[0], title: null },
        { ...mockNotes[1], title: 'B Title' },
      ];
      const result = sortNotesByOption(notesWithNull, SORT_OPTIONS.A_TO_Z);
      // Should handle gracefully without error
      expect(result).toHaveLength(2);
    });

    it('should handle notes with empty string titles', () => {
      const notesWithEmpty = [
        { ...mockNotes[0], title: '' },
        { ...mockNotes[1], title: 'B Title' },
      ];
      const result = sortNotesByOption(notesWithEmpty, SORT_OPTIONS.A_TO_Z);
      // Should handle gracefully without error
      expect(result).toHaveLength(2);
    });

    it('should be case-insensitive for alphabetical sorting', () => {
      const caseMixedNotes = [
        { ...mockNotes[0], title: 'zebra', isPinned: false },
        { ...mockNotes[1], title: 'Apple', isPinned: false },
        { ...mockNotes[2], title: 'BANANA', isPinned: false },
      ];
      const result = sortNotesByOption(caseMixedNotes, SORT_OPTIONS.A_TO_Z);
      const titles = result.map((n) => n.title.toLowerCase());
      expect(titles).toEqual(['apple', 'banana', 'zebra']);
    });

    it('should return original array when sortBy is unknown', () => {
      const original = [...mockNotes];
      const result = sortNotesByOption(mockNotes, 'unknown-sort');

      // Should not copy; same reference
      expect(result).toBe(mockNotes);
      expect(result).toEqual(original);
    });
  });
});