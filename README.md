# ✍️ Likhlo

*"Likh lo" — Write it down.*

A clean, fast notes app built with modern web tech. Rich text editing, color-coded notes, folders, and offline-first storage with cloud sync.

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
- **Cloud Sync** — Sign in to sync across devices (Supabase)
- **PWA Ready** — Install on any device

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- TipTap (rich text editor)
- IndexedDB via `idb`
- Supabase Auth
- Lucide Icons

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/vinprj/likhlo.git
cd likhlo
npm install
```

### 2. Set up Supabase (for auth)

1. Create a project at [supabase.com](https://supabase.com) (free tier)
2. Go to **Settings → API**
3. Copy your **Project URL** and **anon public key**
4. Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run

```bash
npm run dev
```

### 4. Deploy to Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Follow the prompts. Add your environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## License

MIT
