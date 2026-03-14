---
name: cjcrsg-bible-app
description: |
  Custom skill for CJCRSG Bible App development.
  Use when working on this React Native/Expo Bible app project.
  Includes project conventions, API patterns, and development reminders.
compatibility: opencode
user-invocable: false
metadata:
  audience: developer
  project: cjcrsg-bible-app
---

# CJCRSG Bible App - Development Skill

## Project Overview

A Bible reading app built with React Native/Expo using Tamagui UI framework. Features multiple translations, verse highlighting, tabs, and offline reading.

## Tech Stack

- **Framework**: React Native 0.83.2 with Expo SDK 55
- **UI**: Tamagui
- **Routing**: Expo Router
- **Storage**: IndexedDB (for Bible translations), AsyncStorage (for settings)
- **Bible Data**: Beblia GitHub XML Format (998+ translations)

## Key Patterns

### Bible API
- Fetch available translations from Beblia GitHub API
- Download translations as XML, parse and store in IndexedDB
- Translation names formatted with acronyms (NIV, ESV, KJV)

### Storage
- IndexedDB: Downloaded Bible XML data (no size limits)
- AsyncStorage: Reading state, highlights, selected translation

### Download Flow
1. User goes to Settings → Bible Downloads
2. Browse/search 998+ translations from Beblia
3. Download → stored in IndexedDB
4. Translation appears in selector after refresh

## Reminders (ALWAYS FOLLOW)

### Before Committing
1. **Run typecheck**: `pnpm run typecheck`
2. **Update CHANGELOG.md** with changes
3. **DO NOT commit** unless user explicitly asks

### Package Management
- Always use **pnpm** for package management
- Never use npm or yarn

### Development
- Web: `pnpm start --web` or `pnpm run web`
- Test: Ensure app runs without errors

## Common Tasks

### Adding a New Translation Feature
1. Update bible.ts service
2. Test with Downloads modal
3. Update CHANGELOG

### Modifying Bible Context
1. Check BibleContext.tsx for state management
2. Ensure refreshDownloadedVersions() is called after changes

### UI Changes
1. App uses Tamagui components
2. Check app/index.tsx for main Bible screen
3. Check app/settings.tsx for Settings screen

## File Structure

```
app/
  index.tsx       # Main Bible reader
  settings.tsx    # Settings with Downloads modal
src/
  services/
    bible.ts      # Bible API, IndexedDB, downloads
  store/
    BibleContext.tsx   # Bible state management
    ThemeContext.tsx  # Theme state
  components/
    Downloads.tsx     # Downloads modal
```

## Notes

- React and react-dom must be exactly 19.2.0
- react-native-web required for web support
- Beblia repo: https://github.com/Beblia/Holy-Bible-XML-Format
