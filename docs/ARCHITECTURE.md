# Architecture & Technical Details

Technical architecture, API details, and system design for Hazon Bible App.

---

## Bible API

### Data Source
- **Repository**: [Beblia/Holy-Bible-XML-Format](https://github.com/Beblia/Holy-Bible-XML-Format)
- **URL Pattern**: `https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master/{file}.xml`

### Available Translations (14+ English versions)
- `eng_kjv` - King James Version (KJV)
- `eng_niv` - New International Version (NIV)
- `eng_esv` - English Standard Version (ESV)
- `eng_nasb` - New American Standard Bible (NASB)
- `eng_nlt` - New Living Translation (NLT)
- `eng_msg` - The Message (MSG)
- `eng_amp` - Amplified Bible (AMP)
- `eng_ww` - World English Bible (WEB)
- `eng_bbe` - Bible in Basic English (BBE)

### XML Format
```xml
<book name="Genesis" number="1">
  <chapter number="1">
    <verse number="1">In the beginning...</verse>
  </chapter>
</book>
```

---

## Data Storage

### Storage Strategy
| Data Type | Storage | Reason |
|-----------|---------|--------|
| Bible XML | IndexedDB | Large data, no size limits |
| Books list | AsyncStorage | Small metadata |
| Chapter cache | AsyncStorage | Temporary caching |
| Reading state | AsyncStorage | User preferences |
| Highlights | AsyncStorage | User data |
| Notes | AsyncStorage | User content |
| Devotionals | AsyncStorage | User content |
| Settings | AsyncStorage | App configuration |

### Book ID Format
- Uses `xml_*` prefix for Beblia translations
- Example: `xml_1` = Genesis, `xml_43` = John

---

## Key Dependencies

### Core
- `expo` ~55.0.6 - Framework
- `expo-router` ~55.0.5 - Navigation
- `react` 19.2.0 - Core library
- `react-native` 0.83.2 - Mobile framework
- `react-native-web` - Web support

### UI & Features
- `@expo/vector-icons` - Ionicons
- `@react-native-community/datetimepicker` - Native date picker

### Storage
- `expo-file-system` - Mobile file storage
- `@react-native-async-storage/async-storage` - Settings persistence

### Notes
- React and react-dom must be exactly 19.2.0
- Expo SDK 55 uses Metro bundler (webpack deprecated)

---

## App Structure

### Routes (app/)
```
app/
├── index.tsx              # Bible reader (main screen)
├── journals.tsx           # Journal container with tabs
├── journals/
│   ├── devotionals.tsx    # Devotionals list
│   └── notes.tsx          # Notes list with swipe
├── note.tsx               # Note editor
├── search.tsx             # Search functionality
├── settings.tsx           # Settings with theme
└── _layout.tsx            # Tab navigation layout
```

### Source (src/)
```
src/
├── components/
│   └── EmptyState.tsx     # Reusable empty state UI
├── services/
│   ├── bible.ts           # Bible API service
│   └── theme.ts           # Theme persistence
├── store/
│   ├── BibleContext.tsx   # Bible state management
│   ├── DevotionalContext.tsx # Devotionals state
│   └── ThemeContext.tsx   # Theme state (dark/light)
└── types/
    ├── bible.ts           # Bible TypeScript types
    └── devotional.ts      # Devotional TypeScript types
```

### Documentation (docs/)
```
docs/
├── TODOS.md               # Current & upcoming work
├── COMPLETED.md           # Archive of finished work
├── WORKFLOW.md            # Git workflow guide
├── STYLE.md               # Coding standards
└── ARCHITECTURE.md        # This file
```

---

## State Management

### Context Structure
```
RootLayout (ThemeProvider)
  └── ThemedApp (BibleProvider, DevotionalProvider)
      └── TabLayout
```

### BibleContext
- `selectedVersion` - Current Bible translation
- `selectedBook` - Current book
- `selectedChapter` - Current chapter
- `highlights` - Verse highlights by book/chapter
- `notes` - User notes on verses

### ThemeContext
- `isDark` - Dark mode state
- `colorScheme` - 'light' | 'dark' | 'system'
- `fontSizeValue` - Text size preference

### DevotionalContext
- `devotions` - User's devotionals
- `trash` - Soft-deleted devotionals
- `isLoading` - Loading state

---

## Technical Notes

### Platform Handling
- Use `Platform.OS` for web vs mobile differences
- Web uses `window.confirm()`, mobile uses `Alert.alert()`
- Web date pickers use custom grids, mobile uses native pickers

### Performance
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- FlatList for long scrollable content

### Version Format
- Book IDs: `xml_{bookNumber}` (e.g., `xml_1`)
- Verse refs: `xml_{book}_{chapter}_{verse}` (e.g., `xml_1_2_5`)

---

*See [AGENTS.md](../AGENTS.md) for quick reference and [STYLE.md](./STYLE.md) for coding patterns.*
