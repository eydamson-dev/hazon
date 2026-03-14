# AGENTS.md - CJCRSG Bible App

## Important Reminders
- **Always update CHANGELOG.md** when committing changes to track progress
- Use pnpm for package management
- Run typecheck before committing
- Don't commit until user asks
- **Inform user before switching solutions** (e.g., storage, APIs, libraries) - never change approaches without informing first

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
- `types/bible.ts` - TypeScript types

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

### In Progress
- Search functionality

### Pending
- Bookmarks/favorites
- Devotional section

## Development Notes

### Color Scheme
- Primary: #304080 (blue)
- App uses this color for tabs, buttons, and highlights

### Known Issues
- None currently

### MCP Tools Available
- Chrome DevTools MCP configured for browser debugging
