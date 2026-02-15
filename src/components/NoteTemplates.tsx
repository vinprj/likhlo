import { useState } from 'react';
import { FileText, CheckSquare, List, Heading, X } from 'lucide-react';

interface NoteTemplatesProps {
  onSelect: (template: { title: string; content: any }) => void;
  onClose: () => void;
}

const templates = [
  {
    id: 'blank',
    name: 'Blank Note',
    icon: FileText,
    title: '',
    content: null,
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: Heading,
    title: 'Meeting Notes',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Date:' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Attendees:' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda:' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }] },
        ]},
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Action Items:' }] },
        { type: 'taskList', content: [
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action item 1' }] }] },
        ]},
      ],
    },
  },
  {
    id: 'todo',
    name: 'Todo List',
    icon: CheckSquare,
    title: 'Todo List',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Todo List' }] },
        { type: 'taskList', content: [
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 1' }] }] },
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 2' }] }] },
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 3' }] }] },
        ]},
      ],
    },
  },
  {
    id: 'checklist',
    name: 'Simple Checklist',
    icon: List,
    title: 'Checklist',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Checklist' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 3' }] }] },
        ]},
      ],
    },
  },
];

export default function NoteTemplates({ onSelect, onClose }: NoteTemplatesProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Choose a template</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-3">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => onSelect({ title: template.title, content: template.content })}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Icon size={28} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{template.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { templates };
