import { convertMarkdownToHtml, sanitizeHtml } from '../markdownToHtml';

describe('markdownToHtml', () => {
  describe('convertMarkdownToHtml', () => {
    it('should convert headers correctly', () => {
      const markdown = '# Main Title\n## Sub Title\n### Section Title';
      const result = convertMarkdownToHtml(markdown);

      expect(result).toContain('<h1 id="Main Title" tabindex="-1">Main Title');
      expect(result).toContain('<h2 id="Sub Title" tabindex="-1">Sub Title');
      expect(result).toContain('<h3 id="Section Title" tabindex="-1">Section Title');
    });

    it('should convert bold text correctly', () => {
      const markdown = 'This is **bold** text and __also bold__';
      const result = convertMarkdownToHtml(markdown);

      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<strong>also bold</strong>');
    });

    it('should convert italic text correctly', () => {
      const markdown = 'This is *italic* text and _also italic_';
      const result = convertMarkdownToHtml(markdown);

      expect(result).toContain('<em>italic</em>');
      expect(result).toContain('<em>also italic</em>');
    });

    it('should convert links correctly', () => {
      const markdown = '[Link text](https://example.com)';
      const result = convertMarkdownToHtml(markdown);

      expect(result).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link text</a>');
    });

    it('should convert unordered lists correctly', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const result = convertMarkdownToHtml(markdown);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('<li>Item 3</li>');
      expect(result).toContain('</ul>');
    });

    it('should convert ordered lists correctly', () => {
      const markdown = '1. First item\n2. Second item\n3. Third item';
      const result = convertMarkdownToHtml(markdown);

      expect(result).toContain('<ol>');
      expect(result).toContain('<li>First item</li>');
      expect(result).toContain('<li>Second item</li>');
      expect(result).toContain('<li>Third item</li>');
      expect(result).toContain('</ol>');
    });

    it('should add skip links to headings', () => {
      const markdown = '# Section Title';
      const result = convertMarkdownToHtml(markdown);

      expect(result).toContain('<h1 id="Section Title" tabindex="-1">Section Title<a href="#Section Title" class="heading-link ml-2 opacity-0 hover:opacity-100 transition-opacity" aria-label="Link to this section">#</a></h1>');
    });

    it('should handle empty input', () => {
      const result = convertMarkdownToHtml('');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = convertMarkdownToHtml(null as any);
      expect(result).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = '<p>Safe content</p><script>alert("malicious")</script>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<p>Safe content</p>');
      expect(result).not.toContain('<script>');
    });

    it('should remove iframe tags', () => {
      const html = '<p>Safe content</p><iframe src="malicious.com"></iframe>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<p>Safe content</p>');
      expect(result).not.toContain('<iframe>');
    });

    it('should remove inline event handlers', () => {
      const html = '<div onclick="alert(\'malicious\')">Content</div>';
      const result = sanitizeHtml(html);

      expect(result).toContain('Content</div>');
      expect(result).not.toContain('onclick');
    });

    it('should remove javascript: protocols', () => {
      const html = '<a href="javascript:alert(\'malicious\')">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('Link');
      expect(result).not.toContain('javascript:');
    });
  });
});