# CJCRSG Bible App

A React Native/Expo Bible reading application with multiple translations, offline support, and modern UI.

## Features

- **Multiple Translations**: KJV, BSB, WEB, BBE, Tagalog and more (14+ versions)
- **Offline Support**: Download translations for offline reading
- **Verse Highlighting**: Highlight verses with multiple colors (Yellow, Green, Blue, Pink, Orange, Purple)
- **Copy & Share**: Copy or share selected verses
- **Reading Progress**: Remembers last reading position
- **Compare Translations**: View multiple translations side by side
- **Theme Support**: Light/Dark/System theme modes

## Tech Stack

- **Framework**: React Native with Expo SDK 55
- **Language**: TypeScript
- **Routing**: expo-router
- **UI**: Tamagui
- **Storage**: 
  - IndexedDB for Bible XML data
  - AsyncStorage for app state
- **API**: Beblia Holy Bible XML Format

## Prerequisites

- Node.js 18+
- pnpm (recommended)

## Installation

```bash
# Install dependencies
pnpm install

# Start development server (web)
pnpm start --web

# Or run web directly
pnpm run web
```

## Scripts

- `pnpm start --web` - Start development server for web
- `pnpm run web` - Run web build
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run lint` - Run linting

## Project Structure

```
app/                    # Expo Router screens
  index.tsx            # Bible reader (main screen)
  search.tsx           # Search
  devotional.tsx       # Daily devotional
  settings.tsx         # Settings with theme switcher
  _layout.tsx         # Tab layout

src/
  services/
    bible.ts          # Bible API & storage
    theme.ts          # Theme persistence
  store/
    BibleContext.tsx  # Bible state management
    ThemeContext.tsx  # Theme state
  types/
    bible.ts          # TypeScript types
```

## Available Translations

| ID | Name |
|---|---|
| eng_kjv | King James Version (KJV) |
| eng_niv | New International Version (NIV) |
| eng_esv | English Standard Version (ESV) |
| eng_nasb | New American Standard Bible (NASB) |
| eng_nlt | New Living Translation (NLT) |
| eng_msg | The Message (MSG) |
| eng_amp | Amplified Bible (AMP) |
| ENGWEBP | World English Bible (WEB) |
| eng_bbe | Bible in Basic English (BBE) |
| BSB | Berean Standard Bible |
| tgl_ulb | Tagalog Bible |

## Data Source

Bible data is sourced from [Beblia/Holy-Bible-XML-Format](https://github.com/Beblia/Holy-Bible-XML-Format) GitHub repository.

## License

MIT
