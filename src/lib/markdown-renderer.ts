/**
 * Markdown Renderer Utility
 * Converts markdown text to formatted HTML for rich content display
 */

export interface MarkdownElement {
  type: 'paragraph' | 'heading' | 'code' | 'list' | 'listItem' | 'blockquote' | 'bold' | 'italic' | 'link' | 'text';
  content: string;
  level?: number;
  language?: string;
  href?: string;
  children?: MarkdownElement[];
}

/**
 * Parse markdown text into structured elements
 */
export function parseMarkdown(text: string): MarkdownElement[] {
  const lines = text.split('\n');
  const elements: MarkdownElement[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeContent: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code block handling
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push({
          type: 'code',
          content: codeContent.join('\n'),
          language: codeLanguage || 'text'
        });
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        codeLanguage = line.slice(3).trim();
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }
    
    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) {
        elements.push(createListElement(listItems));
        listItems = [];
        inList = false;
      }
      elements.push({
        type: 'heading',
        content: headingMatch[2],
        level: headingMatch[1].length
      });
      continue;
    }
    
    // List item
    const listMatch = line.match(/^[-*•]\s+(.+)$/) || line.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      inList = true;
      listItems.push(listMatch[1]);
      continue;
    }
    
    // If we were in a list but hit a non-list line
    if (inList && line.trim() !== '') {
      elements.push(createListElement(listItems));
      listItems = [];
      inList = false;
    }
    
    // Blockquote
    if (line.startsWith('> ')) {
      elements.push({
        type: 'blockquote',
        content: line.slice(2)
      });
      continue;
    }
    
    // Empty line
    if (line.trim() === '') {
      continue;
    }
    
    // Regular paragraph with inline formatting
    elements.push({
      type: 'paragraph',
      content: line,
      children: parseInlineFormatting(line)
    });
  }
  
  // Close any remaining list
  if (inList) {
    elements.push(createListElement(listItems));
  }
  
  // Close any remaining code block
  if (inCodeBlock) {
    elements.push({
      type: 'code',
      content: codeContent.join('\n'),
      language: codeLanguage || 'text'
    });
  }
  
  return elements;
}

function createListElement(items: string[]): MarkdownElement {
  return {
    type: 'list',
    content: '',
    children: items.map(item => ({
      type: 'listItem',
      content: item,
      children: parseInlineFormatting(item)
    }))
  };
}

/**
 * Parse inline formatting like **bold**, *italic*, `code`, [links](url)
 */
function parseInlineFormatting(text: string): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  let currentPos = 0;
  
  // Regex patterns for inline elements - created once
  const patterns = [
    { type: 'bold' as const, regex: /\*\*(.+?)\*\*/g },
    { type: 'italic' as const, regex: /\*(.+?)\*/g },
    { type: 'code' as const, regex: /`(.+?)`/g },
    { type: 'link' as const, regex: /\[(.+?)\]\((.+?)\)/g }
  ];
  
  // Find all matches
  const matches: Array<{
    type: 'bold' | 'italic' | 'code' | 'link';
    start: number;
    end: number;
    content: string;
    href?: string;
  }> = [];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      matches.push({
        type: pattern.type,
        start: match.index,
        end: pattern.regex.lastIndex,
        content: match[1],
        href: match[2] // for links
      });
    }
  }
  
  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);
  
  // Build elements
  for (const match of matches) {
    // Add text before match
    if (match.start > currentPos) {
      const textContent = text.slice(currentPos, match.start);
      if (textContent) {
        elements.push({ type: 'text', content: textContent });
      }
    }
    
    // Add matched element
    elements.push({
      type: match.type,
      content: match.content,
      href: match.href
    });
    
    currentPos = match.end;
  }
  
  // Add remaining text
  if (currentPos < text.length) {
    const textContent = text.slice(currentPos);
    if (textContent) {
      elements.push({ type: 'text', content: textContent });
    }
  }
  
  // If no formatting found, return simple text
  if (elements.length === 0) {
    elements.push({ type: 'text', content: text });
  }
  
  return elements;
}

/**
 * Convert markdown elements to HTML string
 */
export function markdownToHtml(text: string): string {
  const elements = parseMarkdown(text);
  return elements.map(elementToHtml).join('');
}

function elementToHtml(element: MarkdownElement): string {
  switch (element.type) {
    case 'heading':
      return `<h${element.level} class="font-bold mb-2 mt-4">${escapeHtml(element.content)}</h${element.level}>`;
    
    case 'paragraph':
      if (element.children) {
        return `<p class="mb-2">${element.children.map(inlineToHtml).join('')}</p>`;
      }
      return `<p class="mb-2">${escapeHtml(element.content)}</p>`;
    
    case 'code':
      return `<pre class="bg-muted p-3 rounded-lg overflow-x-auto mb-2"><code class="language-${element.language}">${escapeHtml(element.content)}</code></pre>`;
    
    case 'list':
      return `<ul class="list-disc list-inside mb-2 space-y-1">${element.children?.map(elementToHtml).join('') || ''}</ul>`;
    
    case 'listItem':
      if (element.children) {
        return `<li>${element.children.map(inlineToHtml).join('')}</li>`;
      }
      return `<li>${escapeHtml(element.content)}</li>`;
    
    case 'blockquote':
      return `<blockquote class="border-l-4 border-primary pl-4 italic mb-2">${escapeHtml(element.content)}</blockquote>`;
    
    default:
      return `<p class="mb-2">${escapeHtml(element.content)}</p>`;
  }
}

function inlineToHtml(element: MarkdownElement): string {
  switch (element.type) {
    case 'bold':
      return `<strong>${escapeHtml(element.content)}</strong>`;
    case 'italic':
      return `<em>${escapeHtml(element.content)}</em>`;
    case 'code':
      return `<code class="bg-muted px-1 py-0.5 rounded text-sm">${escapeHtml(element.content)}</code>`;
    case 'link':
      return `<a href="${escapeHtml(element.href || '#')}" class="text-primary underline" target="_blank" rel="noopener noreferrer">${escapeHtml(element.content)}</a>`;
    case 'text':
    default:
      return escapeHtml(element.content);
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}
