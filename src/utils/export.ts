/**
 * Export utilities for notes
 */

import type { Note } from '../types/note';

// Convert TipTap JSON content to Markdown
export function jsonToMarkdown(json: any): string {
  if (!json || !json.content) return '';
  
  let md = '';
  
  for (const node of json.content) {
    switch (node.type) {
      case 'paragraph':
        if (node.content) {
          md += renderInline(node.content) + '\n\n';
        } else {
          md += '\n';
        }
        break;
      case 'heading':
        const level = node.attrs?.level || 1;
        const text = node.content ? renderInline(node.content) : '';
        md += '#'.repeat(level) + ' ' + text + '\n\n';
        break;
      case 'bulletList':
        if (node.content) {
          for (const item of node.content) {
            md += '- ' + (item.content?.[0]?.content?.[0]?.text || '') + '\n';
          }
          md += '\n';
        }
        break;
      case 'orderedList':
        if (node.content) {
          let i = 1;
          for (const item of node.content) {
            md += `${i++}. ` + (item.content?.[0]?.content?.[0]?.text || '') + '\n';
          }
          md += '\n';
        }
        break;
      case 'taskList':
        if (node.content) {
          for (const item of node.content) {
            const checked = item.attrs?.checked ? '[x]' : '[ ]';
            md += '- ' + checked + ' ' + (item.content?.[0]?.content?.[0]?.text || '') + '\n';
          }
          md += '\n';
        }
        break;
      case 'codeBlock':
        md += '```\n' + (node.content?.[0]?.text || '') + '\n```\n\n';
        break;
      case 'blockquote':
        const quote = node.content ? renderInline(node.content) : '';
        md += '> ' + quote.split('\n').join('\n> ') + '\n\n';
        break;
      case 'horizontalRule':
        md += '---\n\n';
        break;
    }
  }
  
  return md.trim();
}

function renderInline(content: any[]): string {
  if (!content) return '';
  
  let text = '';
  for (const node of content) {
    if (node.type === 'text') {
      let t = node.text || '';
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case 'bold':
              t = `**${t}**`;
              break;
            case 'italic':
              t = `*${t}*`;
              break;
            case 'underline':
              t = `<u>${t}</u>`;
              break;
            case 'strike':
              t = `~~${t}~~`;
              break;
            case 'highlight':
              t = `==${t}==`;
              break;
            case 'code':
              t = `\`${t}\``;
              break;
          }
        }
      }
      text += t;
    } else if (node.type === 'hardBreak') {
      text += '\n';
    }
  }
  return text;
}

// Download note as Markdown file
export function downloadAsMarkdown(note: Note): void {
  const title = note.title || 'Untitled';
  const content = jsonToMarkdown(note.content) || note.plainText || '';
  
  const markdown = `# ${title}\n\n${content}`;
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download note as plain text
export function downloadAsText(note: Note): void {
  const title = note.title || 'Untitled';
  const content = note.plainText || '';
  
  const blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export all notes as JSON
export function exportAllNotes(notes: Note[]): void {
  const data = notes.map(n => ({
    title: n.title,
    content: jsonToMarkdown(n.content),
    plainText: n.plainText,
    color: n.color,
    tags: n.tags,
    createdAt: new Date(n.createdAt).toISOString(),
    updatedAt: new Date(n.updatedAt).toISOString(),
  }));
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `likhlo-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
