# AGENTS.md - CJCRSG Bible App

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

### API Used
- **HelloAO.org** - Free Bible API (https://bible.helloao.org)
- No API key required
- Returns JSON format

### Available Translations
- `eng_kjv` - King James Version (KJV)
- `BSB` - Berean Standard Bible
- `ENGWEBP` - World English Bible (WEB)
- `eng_bbe` - Bible in Basic English (BBE)
- `tgl_ulb` - Tagalog Bible

### API Endpoints
- Translations: `https://bible.helloao.org/api/available_translations.json`
- Books: `https://bible.helloao.org/api/{translation}/books.json`
- Chapter: `https://bible.helloao.org/api/{translation}/{book}/{chapter}.json`

### Data Storage
- Books cached in AsyncStorage
- Chapters cached for offline reading
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

### In Progress
- Search functionality

### Pending
- Paragraph/continuous reading mode (HelloAO.org API lacks paragraph break data)
- Bookmarks/favorites
- Download Bible versions for offline
- Devotional section

## Development Notes

### Paragraph Mode Research
- HelloAO.org API does NOT provide `line_break` markers in chapter data
- Tested translations: KJV, WEB, BSB - all return 0 paragraph breaks
- Possible solutions:
  1. Use a different Bible API with paragraph markers (e.g., API.Bible with special markup)
  2. Bundle KJV with embedded paragraph JSON data
  3. Calculate paragraph breaks algorithmically (e.g., every 3-5 verses)
  4. Use translation-specific formatting rules

### Color Scheme
- Primary: #304080 (blue)
- App uses this color for tabs, buttons, and highlights

### Known Issues
- None currently

### MCP Tools Available
- Chrome DevTools MCP configured for browser debugging
