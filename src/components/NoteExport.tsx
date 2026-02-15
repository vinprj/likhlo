import { useState } from 'react';
import { X, Plus, Tag, Download } from 'lucide-react';
import { downloadAsMarkdown, downloadAsText } from '../utils/export';
import type { Note } from '../types/note';

interface NoteExportProps {
  note: Note;
  onClose: () => void;
}

export default function NoteExport({ note, onClose }: NoteExportProps) {
  const [tagsInput, setTagsInput] = useState(note.tags.join(', '));
  const [savedTags, setSavedTags] = useState(note.tags);

  const handleSaveTags = () => {
    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);
    setSavedTags(tags);
    // TODO: Save to note
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export & Tags</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Export Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Download size={16} />
              Export Note
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadAsMarkdown(note)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Markdown (.md)
              </button>
              <button
                onClick={() => downloadAsText(note)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Plain Text
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Tag size={16} />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {savedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded text-xs"
                >
                  {tag}
                  <button
                    onClick={() => {
                      const newTags = savedTags.filter(t => t !== tag);
                      setSavedTags(newTags);
                      setTagsInput(newTags.join(', '));
                    }}
                    className="hover:text-teal-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Add tags (comma separated)"
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button
                onClick={handleSaveTags}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
