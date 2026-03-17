# Hazon

## About

A React Native/Expo Bible reading application with multiple translations, offline support, and modern UI. Users can read, search, highlight verses, and switch between Bible translations.

## Features

- **Multiple Translations**: KJV, BSB, WEB, BBE, Tagalog (14+ versions available)
- **Offline Support**: Download translations for offline reading
- **Verse Highlighting**: Highlight verses with multiple colors (Yellow, Green, Blue, Pink, Orange, Purple)
- **Copy & Share**: Copy or share selected verses
- **Reading Progress**: Remembers last reading position
- **Compare Translations**: View multiple translations side by side
- **Theme Support**: Light/Dark/System theme modes

## Important Reminders
- **Always update CHANGELOG.md** when committing changes to track progress
- **Always update AGENTS.md todos** (move from Planned/In Progress to Completed) after feature completion
- Use pnpm for package management
- Run typecheck before committing
- Don't commit until user asks
- **Inform user before switching solutions** (e.g., storage, APIs, libraries) - never change approaches without informing first
- **After completing a feature:** Update AGENTS.md todos immediately (move from Planned Next to Completed) and include CHANGELOG changes in the PR commit (not after merge)

## Project Setup

### Package Manager
- Use **pnpm** for all package management

### Running the App

```bash
# Install dependencies
pnpm install

# Start development server (web)
pnpm start --web

# Or use the web script
pnpm run web

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

### Key Dependencies
- expo ~55.0.6
- expo-router ~55.0.5
- react 19.2.0
- react-dom 19.2.0
- react-native 0.83.2
- react-native-web (required for web)

### Notes
- React and react-dom must be at exactly 19.2.0 to avoid version mismatch errors
- react-native-web is required for web support
- Expo SDK 55 uses Metro bundler for web (webpack is deprecated for newer Expo versions)

## Bible API

### Data Source
- **Beblia/Holy-Bible-XML-Format** GitHub repository
- URL: https://github.com/Beblia/Holy-Bible-XML-Format
- XML files from raw GitHub CDN: `https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master/{file}.xml`

### Available Translations (14 English versions)
- `eng_kjv` - King James Version (KJV)
- `eng_niv` - New International Version (NIV)
- `eng_esv` - English Standard Version (ESV)
- `eng_nasb` - New American Standard Bible (NASB)
- `eng_nlt` - New Living Translation (NLT)
- `eng_msg` - The Message (MSG)
- `eng_amp` - Amplified Bible (AMP)
- `eng_ww` - World English Bible (WEB)
- `eng_bbe` - Bible in Basic English (BBE)
- And more...

### Data Storage
- IndexedDB for downloaded Bible XML data (browser database, no size limits)
- AsyncStorage for books list and chapter cache
- Reading state (book, chapter, translation) persisted

## App Structure

### Routes (app/)
- `index.tsx` - Bible reader (main screen)
- `search.tsx` - Search (placeholder)
- `devotional.tsx` - Devotional (placeholder)
- `settings.tsx` - Settings with theme switcher
- `_layout.tsx` - Tab layout with BibleProvider and ThemeProvider

### Source (src/)
- `services/bible.ts` - Bible API service
- `services/theme.ts` - Theme persistence service
- `store/BibleContext.tsx` - React Context for Bible state
- `store/ThemeContext.tsx` - React Context for theme (dark/light/system)
- `types/bible.ts` - Bible-related TypeScript types
- `types/devotional.ts` - Devotional-related TypeScript types

## Git Workflow

### Important Reminder
- **ALWAYS create a new branch BEFORE making any changes**
- **ALWAYS pull latest from main** before creating the branch
- **NEVER make changes directly on main branch**

### Branch Naming
- `feature/description` - New features (e.g., `feature/font-size`)
- `fix/description` - Bug fixes (e.g., `fix/search-scroll`)
- `enhancement/description` - Enhancements

### Workflow
- **Always create a new branch** for each feature/fix
- **Never commit directly to main**
- **Never auto commit** - wait for user to instruct when to commit
- **Each PR must have CHANGELOG.md updated** before creating PR
- Create PR for every change
- **User will manually approve on GitHub**

### Process
```bash
# Create and switch to new branch
git checkout -b feature/my-feature

# Make changes
# Run typecheck locally: pnpm run typecheck

# When ready to commit - WAIT for user instruction
# User will say "commit" or similar

# After user approval:
git add .
git commit -m "Description of changes"

# Push branch
git push -u origin feature/my-feature

# Create PR on GitHub (with CHANGELOG update)
# User manually approves and merges
```

### Pre-PR Checklist
- [ ] Run typecheck: `pnpm run typecheck`
- [ ] Update CHANGELOG.md with changes
- [ ] Wait for user to approve commit
- [ ] Create PR

### Feature Branching Strategy

To keep PRs small and reviewable, break features/enhancements into atomic branches:

#### **Branch Types**

| Type | Naming | Scope | PR Size |
|------|--------|-------|---------|
| `feature/*` | `feature/notes-annotations` | New features | Medium-Large |
| `enhancement/*` | `enhancement/journal-icons` | UI improvements | Small-Medium |
| `fix/*` | `fix/note-id-collision` | Bug fixes | Small |

#### **Atomic Branching Rules**

1. **One concern per branch** - Each branch should address exactly one enhancement or feature
2. **Quick wins first** - Start with smallest enhancements to build momentum  
3. **Branch from `main`** - Always branch from latest main:
   ```bash
   git checkout main && git pull && git checkout -b enhancement/description
   ```
4. **Wait for user approval** - Never commit or merge without explicit user instruction
5. **Fast-follow PRs** - After user approval, create PR quickly

#### **Enhancement Breakdown Example**

**Bad**: One branch with "All UI improvements"  
**Good**: Separate branches:
- `enhancement/journal-icon-change` (5 min work)
- `enhancement/note-card-styling` (10 min work)  
- `enhancement/note-typography` (10 min work)
- `enhancement/note-count-badge` (20 min work)

#### **PR Guidelines**

- **Small PRs** (1-50 lines): Quick to review, user manually approves
- **Medium PRs** (50-200 lines): User reviews and approves
- **Large PRs** (200+ lines): Break into smaller branches

#### **Post-Feature Checklist**

After completing any feature/enhancement:
- [ ] Update CHANGELOG.md with the change
- [ ] Update AGENTS.md todos (mark as completed)
- [ ] Run typecheck
- [ ] Wait for user approval to commit

## Coding Style

### General Principles
- Keep components small and focused
- Use functional components with hooks
- Avoid magic numbers - use constants

### File Naming
- Components: `PascalCase.tsx` (e.g., `BibleReader.tsx`)
- Utils/Services: `camelCase.ts` (e.g., `bibleService.ts`)
- Types: `camelCase.types.ts` or `types/`

### Component Structure
- Props interface at top
- useState hooks first
- useEffect hooks after
- Helper functions before return
- JSX at bottom

### State Management
- Use React Context for global state
- Use local useState for component state

### Styling
- Use StyleSheet.create() for React Native
- Keep styles at bottom of file or in separate file if large

### TypeScript
- Always define prop types
- Avoid `any` - use proper types

### Imports
- React/external first
- Internal imports second
- Relative paths for local files

## Current Todo List

### Completed
- [x] Bible API integration
- [x] Version selector (KJV, BSB, WEB, BBE, Tagalog)
- [x] Book selection UI
- [x] Chapter navigation
- [x] Verse display with formatting
- [x] Verse navigation with selection
- [x] Verse highlighting with colors (Yellow, Green, Blue, Pink, Orange, Purple)
- [x] Highlight persistence per book/chapter
- [x] Copy selected verses
- [x] Share selected verses
- [x] Auto-scroll to verse
- [x] Offline caching
- [x] State persistence (remembers last read position)
- [x] Bottom navigation bar (Book, Chapter, Verse, Translation)
- [x] Theme switcher (light/dark/system)
- [x] Tab icons (Bible, Devotional, Search, Settings)
- [x] Convert UI to Tamagui
- [x] Beblia GitHub XML translations (14 versions)
- [x] IndexedDB storage for translations
- [x] Compare translations feature
- [x] Download Bible versions for offline
- [x] Search functionality
- [x] Font Size Adjustment - Change verse text size
- [x] Share devotionals - Share devotional as formatted text
- [x] Edit date - Allow changing creation date of devotional
- [x] Notes/Annotations - Add personal notes to verses

### In Progress

### Planned Next (Easy Wins)
- [x] Journal icon change - Change tab icon to bookmark-outline, add icons to sub-tabs
- [x] Note card styling - Add shadows, increase border radius, better padding
- [x] Note typography improvements - Better font sizes and contrast
- [ ] Note count badge - Show count on verse note icons when > 1
- [ ] Swipe-to-delete - Add swipe gesture on note cards
- [ ] Better empty states - Add illustrations to empty lists

### Parked
- Search within chapter - Scroll positioning issue (complex to fix)

### Pending

#### Bible Reader
- Search within chapter - Scroll positioning issue (complex to fix)
- Reading History - List recently read passages
- Bookmarks/Favorites - Save favorite verses for quick access
- Night mode - Separate blue light reduction mode
- Reading Goals - Set daily reading targets

#### Devotionals
- Bookmarks/favorites
- Push notifications for daily devotional
- Categories/Tags - Organize devotions by topics
- Daily Devotional - Featured devotional on home screen
- Verse highlight colors in devotionals
- Calendar view - Visual calendar showing days with devotions
- Rich text formatting in reflections
- Multiple translations side-by-side in devotionals

## Development Notes

### Color Scheme
- Primary: #304080 (blue)
- App uses this color for tabs, buttons, and highlights

### Known Issues
- None currently

### MCP Tools Available
- Chrome DevTools MCP configured for browser debugging
