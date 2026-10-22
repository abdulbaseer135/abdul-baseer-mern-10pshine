import DOMPurify from 'dompurify';

export const sanitizeNoteHtml = (html = '') => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 's', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'a'],
  ALLOWED_ATTR: ['href', 'title', 'start'],
});
