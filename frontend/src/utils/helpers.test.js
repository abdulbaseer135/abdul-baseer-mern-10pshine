import {
  formatDate,
  formatRelativeTime,
  truncateText,
  truncateTitle,
  sortNotesByPinnedAndDate,
  stripHtmlTags,
} from './helpers';

describe('Helper Utilities', () => {
  describe('formatDate', () => {
    it('should format a valid date string', () => {
      const result = formatDate('2026-05-24');
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });

    it('should return empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('should format various date formats correctly', () => {
      const dates = ['2026-05-24', '2026-01-01', '2025-12-31'];
      dates.forEach((date) => {
        const result = formatDate(date);
        expect(result.length).toBeGreaterThan(0);
        expect(result).toMatch(/^\w{3} \d{1,2}, \d{4}$/);
      });
    });

    it('should handle ISO date strings', () => {
      const result = formatDate('2026-05-24T12:00:00Z');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatRelativeTime', () => {
    const now = new Date();

    it('should return "Just now" for times less than 1 minute ago', () => {
      const justNow = new Date(now.getTime() - 30000);
      expect(formatRelativeTime(justNow.toISOString())).toBe('Just now');
    });

    it('should return minutes for times less than 60 minutes ago', () => {
      const minutesAgo = new Date(now.getTime() - 5 * 60000);
      expect(formatRelativeTime(minutesAgo.toISOString())).toBe('5m ago');
    });

    it('should return hours for times less than 24 hours ago', () => {
      const hoursAgo = new Date(now.getTime() - 3 * 3600000);
      expect(formatRelativeTime(hoursAgo.toISOString())).toBe('3h ago');
    });

    it('should return days for times less than 7 days ago', () => {
      const daysAgo = new Date(now.getTime() - 2 * 86400000);
      expect(formatRelativeTime(daysAgo.toISOString())).toBe('2d ago');
    });

    it('should return formatted date for times 7+ days ago', () => {
      const tenDaysAgo = new Date(now.getTime() - 10 * 86400000);
      const result = formatRelativeTime(tenDaysAgo.toISOString());
      expect(result).toMatch(/^\w{3} \d{1,2}, \d{4}$/);
    });

    it('should return empty string for empty input', () => {
      expect(formatRelativeTime('')).toBe('');
      expect(formatRelativeTime(null)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than max length', () => {
      const result = truncateText('Short text');
      expect(result).toBe('Short text');
    });

    it('should truncate text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated at some point';
      const result = truncateText(longText, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...' (may be less due to trim)
      expect(result).toContain('...');
    });

    it('should remove HTML tags before truncating', () => {
      const htmlText = '<p>This is <strong>HTML</strong> content</p>';
      const result = truncateText(htmlText);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should return empty string for empty input', () => {
      expect(truncateText('')).toBe('');
      expect(truncateText(null)).toBe('');
    });

    it('should use default max length if not specified', () => {
      const longText = 'a'.repeat(1000);
      const result = truncateText(longText);
      expect(result.length).toBeLessThan(longText.length);
    });

    it('should trim trailing spaces before adding ellipsis', () => {
      const result = truncateText('This is text   ', 10);
      expect(result).not.toMatch(/\s+\.\.\.$/);
    });
  });

  describe('stripHtmlTags', () => {
    it('should remove simple HTML tags', () => {
      expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello');
      expect(stripHtmlTags('<div>World</div>')).toBe('World');
    });

    it('should remove nested HTML tags', () => {
      expect(stripHtmlTags('<p>This is <strong>bold</strong> text</p>')).toBe(
        'This is bold text'
      );
    });

    it('should remove tags with attributes', () => {
      expect(stripHtmlTags('<a href="url">link</a>')).toBe('link');
      expect(stripHtmlTags('<span class="red">red text</span>')).toBe('red text');
    });

    it('should handle self-closing tags', () => {
      expect(stripHtmlTags('Line 1<br/>Line 2')).toBe('Line 1Line 2');
      expect(stripHtmlTags('Image<img src="url" alt="test" />')).toBe('Image');
    });

    it('should handle malformed HTML gracefully', () => {
      // Malformed HTML is safe with DOM approach (unlike regex)
      expect(stripHtmlTags('<p>No closing tag')).toBe('No closing tag');
      expect(stripHtmlTags('<p>Unclosed <div>nested</p>')).toBe(
        'Unclosed nested'
      );
    });

    it('should preserve text content with multiple spaces', () => {
      const result = stripHtmlTags('<p>Hello   World</p>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should return empty string for empty input', () => {
      expect(stripHtmlTags('')).toBe('');
      expect(stripHtmlTags(null)).toBe('');
      expect(stripHtmlTags(undefined)).toBe('');
    });

    it('should remove complex HTML structures', () => {
      const html = '<div class="container"><p>Para 1</p><p>Para 2</p></div>';
      expect(stripHtmlTags(html)).toBe('Para 1Para 2');
    });

    it('should handle HTML entities correctly', () => {
      // DOM textContent handles HTML entities properly
      const result = stripHtmlTags('<p>&amp; &lt; &gt;</p>');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should NOT be vulnerable to regex DoS attacks', () => {
      // Safe: DOM approach immune to ReDoS - no regex used
      // This would timeout or consume excessive CPU with vulnerable regex
      const maliciousInput = '<' + 'a'.repeat(100000) + '>' + 'text';
      const result = stripHtmlTags(maliciousInput);
      // Should complete quickly and safely
      expect(typeof result).toBe('string');
    });
  });

  describe('truncateTitle', () => {
    it('should not truncate title shorter than max length', () => {
      const result = truncateTitle('Short title');
      expect(result).toBe('Short title');
    });

    it('should truncate title longer than max length', () => {
      const longTitle = 'A'.repeat(150);
      const result = truncateTitle(longTitle, 100);
      expect(result).toHaveLength(103); // 100 + '...'
      expect(result).toContain('...');
    });

    it('should return empty string for empty input', () => {
      expect(truncateTitle('')).toBe('');
      expect(truncateTitle(null)).toBe('');
    });

    it('should trim trailing spaces before adding ellipsis', () => {
      const result = truncateTitle('Title with spaces    ', 10);
      expect(result).not.toMatch(/\s+\.\.\.$/);
    });
  });

  describe('sortNotesByPinnedAndDate', () => {
    const notes = [
      {
        _id: '1',
        title: 'Note 1',
        isPinned: false,
        createdAt: new Date('2026-05-20'),
      },
      {
        _id: '2',
        title: 'Note 2',
        isPinned: true,
        createdAt: new Date('2026-05-15'),
      },
      {
        _id: '3',
        title: 'Note 3',
        isPinned: false,
        createdAt: new Date('2026-05-25'),
      },
      {
        _id: '4',
        title: 'Note 4',
        isPinned: true,
        createdAt: new Date('2026-05-10'),
      },
    ];

    it('should place pinned notes first', () => {
      const sorted = sortNotesByPinnedAndDate(notes);
      const pinnedNotes = sorted.filter((n) => n.isPinned);
      expect(sorted.slice(0, 2)).toEqual(expect.arrayContaining(pinnedNotes));
    });

    it('should sort pinned notes by date (newest first)', () => {
      const sorted = sortNotesByPinnedAndDate(notes);
      const pinnedNotes = sorted.filter((n) => n.isPinned);
      if (pinnedNotes.length > 1) {
        expect(new Date(pinnedNotes[0].createdAt).getTime()).toBeGreaterThan(
          new Date(pinnedNotes[1].createdAt).getTime()
        );
      }
    });

    it('should sort unpinned notes by date (newest first)', () => {
      const sorted = sortNotesByPinnedAndDate(notes);
      const unpinnedNotes = sorted.filter((n) => !n.isPinned);
      if (unpinnedNotes.length > 1) {
        expect(new Date(unpinnedNotes[0].createdAt).getTime()).toBeGreaterThan(
          new Date(unpinnedNotes[1].createdAt).getTime()
        );
      }
    });

    it('should return empty array for empty input', () => {
      const result = sortNotesByPinnedAndDate([]);
      expect(result).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      const result = sortNotesByPinnedAndDate(null);
      expect(result).toEqual([]);
    });

    it('should not mutate original array', () => {
      const original = [...notes];
      sortNotesByPinnedAndDate(notes);
      expect(notes).toEqual(original);
    });

    it('should handle single note', () => {
      const singleNote = [notes[0]];
      const result = sortNotesByPinnedAndDate(singleNote);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(notes[0]);
    });

    it('should handle all pinned notes', () => {
      const allPinned = notes.filter((n) => n.isPinned);
      const result = sortNotesByPinnedAndDate(allPinned);
      expect(result.every((n) => n.isPinned)).toBe(true);
    });

    it('should handle all unpinned notes', () => {
      const allUnpinned = notes.filter((n) => !n.isPinned);
      const result = sortNotesByPinnedAndDate(allUnpinned);
      expect(result.every((n) => !n.isPinned)).toBe(true);
    });
  });
});
