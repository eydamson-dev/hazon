# Hazon

A React Native/Expo Bible reading application with multiple translations, offline support, and modern UI.

---

## ⚠️ Critical Reminders (Read Every Session)

- **Always create a new branch from main** before making changes
- **Never commit until user says "commit"** - wait for explicit instruction
- **Always update CHANGELOG.md** before creating PR
- **Run typecheck before committing**: `pnpm run typecheck`
- **Use pnpm** for package management
- **Inform user before switching solutions** (storage, APIs, libraries)

---

## Quick Links

| Resource | Location |
|----------|----------|
| 📋 **Current Work** | [docs/TODOS.md](./docs/TODOS.md) |
| ✅ **Completed Work** | [docs/COMPLETED.md](./docs/COMPLETED.md) |
| 🔧 **Git Workflow** | [docs/WORKFLOW.md](./docs/WORKFLOW.md) |
| 💻 **Coding Style** | [docs/STYLE.md](./docs/STYLE.md) |
| 📐 **Architecture** | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| 📝 **Changelog** | [CHANGELOG.md](./CHANGELOG.md) |

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start --web

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

---

## Project Overview

### Key Features
- **Multiple Translations**: 14+ Bible versions (KJV, NIV, ESV, etc.)
- **Offline Support**: Download translations for offline reading
- **Verse Highlighting**: 6 colors (Yellow, Green, Blue, Pink, Orange, Purple)
- **Copy & Share**: Share selected verses
- **Devotionals & Notes**: Personal reflections and annotations
- **Theme Support**: Light/Dark/System modes

### Current Status
- **Version**: 1.3.0 (In Progress)
- **Current Work**: See [docs/TODOS.md](./docs/TODOS.md)
- **Completed**: See [docs/COMPLETED.md](./docs/COMPLETED.md)

---

## Tech Stack

- **Framework**: React Native / Expo SDK 55
- **Navigation**: Expo Router
- **State**: React Context
- **Storage**: IndexedDB (Bible data), AsyncStorage (settings)
- **API**: Beblia GitHub XML
- **Primary Color**: `#304080` (blue)

---

## App Structure

```
app/
├── index.tsx              # Bible reader
├── journals.tsx           # Journal tab container
├── journals/
│   ├── devotionals.tsx    # Devotionals list
│   └── notes.tsx          # Notes with swipe-to-delete
├── note.tsx               # Note editor
├── search.tsx             # Search functionality
├── settings.tsx           # Settings
└── _layout.tsx            # Tab layout

src/
├── components/            # Reusable components
├── services/              # API services
├── store/                 # React Context
└── types/                 # TypeScript types

docs/
├── TODOS.md               # Current work
├── COMPLETED.md           # Archive
├── WORKFLOW.md            # Git workflow
├── STYLE.md               # Coding standards
└── ARCHITECTURE.md        # Technical details
```

---

## Session Workflow

1. **Start**: Read docs/TODOS.md for current task
2. **Create branch**: `git checkout main && git pull && git checkout -b enhancement/name`
3. **Implement**: Make changes, run `pnpm run typecheck`
4. **Test**: Let user test changes
5. **Wait**: User says "commit" or "proceed"
6. **Update**: CHANGELOG.md + docs/TODOS.md
7. **Commit**: `git add . && git commit -m "Description"`
8. **Push**: `git push -u origin branch-name`
9. **PR**: Create PR on GitHub, user merges

---

*For detailed workflow, coding standards, and technical info, see the docs/ folder.*
