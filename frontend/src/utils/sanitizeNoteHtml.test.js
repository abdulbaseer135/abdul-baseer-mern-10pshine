import { sanitizeNoteHtml } from './sanitizeNoteHtml';

describe('note HTML sanitization', () => {
  it('preserves the rich text formatting produced by the editor', () => {
    const html = '<h2>Title</h2><p><strong>Bold</strong> <em>italic</em></p><ul><li>Task</li></ul>';
    expect(sanitizeNoteHtml(html)).toBe(html);
  });
  it('removes scripts, event handlers, embeds, SVG and unsafe links', () => {
    const html = sanitizeNoteHtml('<script>alert(1)</script><svg onload="alert(1)"></svg><iframe src="x"></iframe><p onclick="alert(1)">Safe</p><a href="javascript:alert(1)">Link</a>');
    expect(html).toBe('<p>Safe</p><a>Link</a>');
  });
  it('handles missing content', () => expect(sanitizeNoteHtml()).toBe(''));
});
