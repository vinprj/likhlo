/**
 * Color picker for notes.
 */

import type { NoteColor } from '../types/note';
import { NOTE_COLORS, COLOR_DOT } from '../utils/colors';

interface ColorPickerProps {
  selected: NoteColor;
  onChange: (color: NoteColor) => void;
}

const COLORS: NoteColor[] = ['default', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'];

export default function ColorPicker({ selected, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 items-center">
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          title={NOTE_COLORS[color].label}
          className={`w-6 h-6 rounded-full ${COLOR_DOT[color]} transition-all ${
            selected === color
              ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110'
              : 'hover:scale-110'
          }`}
        />
      ))}
    </div>
  );
}
