# ✍️ Likhlo

*"Likh lo" — Write it down.*

A clean, fast notes app inspired by GNotes, built with modern web tech. Rich text editing, color-coded notes, folders, and offline-first storage.

## Features

- **Rich Text Editor** — Headers, bold, italic, underline, lists, checklists, code blocks, highlights
- **Color-Coded Notes** — 9 beautiful color options for visual organization
- **Folders** — Organize notes into custom folders
- **Search** — Full-text search across titles and content
- **Grid/List Views** — Switch between card grid and compact list
- **Pin & Archive** — Keep important notes on top, archive the rest
- **Trash & Recovery** — Soft delete with recovery option
- **Dark Mode** — Light, dark, and system-follow themes
- **Offline First** — Works without internet (IndexedDB storage)
- **PWA Ready** — Install on any device

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- TipTap (rich text editor)
- IndexedDB via `idb`
- Lucide Icons

## Getting Started

```bash
git clone https://github.com/vinprj/likhlo.git
cd likhlo
npm install
npm run dev
```

## Roadmap

- [ ] **Phase 1:** Core notes app (MVP) ← *current*
- [ ] **Phase 2:** Cloud sync via Supabase
- [ ] **Phase 3:** Calendar view, tags, reminders, export

## License

MIT
