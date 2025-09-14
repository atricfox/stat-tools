/**
 * Utility for converting markdown content to HTML with proper formatting
 */

export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Split into lines for better processing
  const lines = html.split('\n');
  let inList = false;
  let inParagraph = false;
  let result = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line - close paragraph if open
    if (line === '') {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (inList) {
        result += inList === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      const text = line.substring(2);
      result += `<h1 id="${text}" tabindex="-1">${text}<a href="#${text}" class="heading-link ml-2 opacity-0 hover:opacity-100 transition-opacity" aria-label="Link to this section">#</a></h1>`;
    } else if (line.startsWith('## ')) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (inList) {
        result += inList === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      const text = line.substring(3);
      result += `<h2 id="${text}" tabindex="-1">${text}<a href="#${text}" class="heading-link ml-2 opacity-0 hover:opacity-100 transition-opacity" aria-label="Link to this section">#</a></h2>`;
    } else if (line.startsWith('### ')) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (inList) {
        result += inList === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      const text = line.substring(4);
      result += `<h3 id="${text}" tabindex="-1">${text}<a href="#${text}" class="heading-link ml-2 opacity-0 hover:opacity-100 transition-opacity" aria-label="Link to this section">#</a></h3>`;
    } else if (line.startsWith('#### ')) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (inList) {
        result += inList === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      const text = line.substring(5);
      result += `<h4 id="${text}" tabindex="-1">${text}</h4>`;
    } else if (line.startsWith('##### ')) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (inList) {
        result += inList === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      const text = line.substring(6);
      result += `<h5 id="${text}" tabindex="-1">${text}</h5>`;
    } else if (line.startsWith('###### ')) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (inList) {
        result += inList === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      const text = line.substring(7);
      result += `<h6 id="${text}" tabindex="-1">${text}</h6>`;
    }
    // Unordered list
    else if (line.startsWith('- ')) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (!inList) {
        result += '<ul>';
        inList = 'ul';
      }
      const text = line.substring(2);
      const processedText = processInlineElements(text);
      result += `<li>${processedText}</li>`;
    }
    // Ordered list
    else if (line.match(/^\d+\. /)) {
      if (inParagraph) {
        result += '</p>';
        inParagraph = false;
      }
      if (!inList) {
        result += '<ol>';
        inList = 'ol';
      }
      const text = line.replace(/^\d+\. /, '');
      const processedText = processInlineElements(text);
      result += `<li>${processedText}</li>`;
    }
    // Regular paragraph
    else {
      if (inList) {
        result += inList === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      if (!inParagraph) {
        result += '<p>';
        inParagraph = true;
      }
      const processedText = processInlineElements(line);
      result += processedText;
    }
  }

  // Close any open tags
  if (inParagraph) {
    result += '</p>';
  }
  if (inList) {
    result += inList === 'ul' ? '</ul>' : '</ol>';
  }

  return result;
}

function processInlineElements(text: string): string {
  // Bold text
  let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic text
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return processed;
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove potentially dangerous elements
  let sanitized = html;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove iframe tags and their content
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove inline event handlers (onclick, onmouseover, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol links
  sanitized = sanitized.replace(/javascript:[^"'\s]*/gi, '');

  // Remove other potentially dangerous attributes
  sanitized = sanitized.replace(/\s+data-\w+\s*=\s*["'][^"']*["']/gi, '');

  return sanitized;
}