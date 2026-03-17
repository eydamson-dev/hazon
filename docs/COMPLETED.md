# Completed Features Archive

All completed work is organized chronologically. For current work, see [TODOS.md](./TODOS.md).

---

## March 2026

### March 18, 2026
- **Better empty states** - Added EmptyState component with icons for notes, devotionals, and search screens
- **Refactor: Split devotional.tsx** - Moved to clean directory structure (`app/journals/` with devotionals and notes sub-screens)
- **Swipe-to-delete on notes** - Swipe left to reveal delete action with platform-specific confirmation
- **Note count badge** - Show red badge with count on verse note icons when > 1 note
- **Note typography improvements** - Increased font size, better contrast, improved line height
- **Note card styling** - Added shadows, increased border radius to 12px, better padding
- **Journal icon change** - Changed tab icon to bookmark-outline with sub-tab icons (heart, document-text)

### March 17, 2026
- **Add verses to existing devotionals** - Simplified flow to add verses directly from context menu
- **Clickable verse references in devotionals** - Navigate to verse in Bible when tapped
- **Devotion translation bug fix** - Now saves translation ID/name with verse references

### March 16, 2026
- **Edit date** - Allow changing creation date when editing a devotional
- **Share devotionals** - Share devotional as formatted text with web & mobile support
- **Date filter for devotions** - Filter by exact date using native date picker
- **Removed Calendar tab** - Replaced with All | Trash tabs for better UX

### March 15, 2026
- **Search functionality** - Search Bible verses within downloaded translations
- **Search results navigation** - Tap result to navigate directly to verse
- **Search term highlighting** - Matching words highlighted in results
- **Font Size adjustment** - Small, Medium, Large, Extra Large options in Settings

### March 14, 2026
- **Beblia GitHub XML translations** - 14+ versions available via Beblia API
- **IndexedDB storage** - For downloaded Bible XML data (no size limits)
- **Compare translations feature** - View selected verse in multiple versions side-by-side
- **Download translations for offline** - Download any translation for offline reading
- **Devotional feature** - Create, edit, delete devotionals with verse references
- **Trash functionality** - Soft delete with restore option
- **Sequential verse grouping** - Display ranges like "John 3:1-3, 5, 8-12"

---

## February 2026

### February 28, 2026
- **Notes/Annotations** - Add personal notes to Bible verses with linked verses
- **Journal tab** - Combined devotionals and notes in one tab interface

### February 20, 2026
- **Theme switcher** - Light/Dark/System theme modes
- **Tab icons** - Bible, Devotional, Search, Settings with custom icons

### February 15, 2026
- **Convert UI to Tamagui** - UI framework migration (later reverted to React Native Elements)
- **State persistence** - Remember last reading position (book, chapter, verse)

---

## January 2026

### January 30, 2026
- **Offline caching** - Cache Bible data for offline reading
- **Auto-scroll to verse** - Navigate directly to specific verses
- **Verse highlighting** - Yellow, Green, Blue, Pink, Orange, Purple colors
- **Highlight persistence** - Saves highlights per book/chapter

### January 25, 2026
- **Copy & Share verses** - Copy or share selected verse text
- **Compare translations** - View multiple translations side by side
- **Reading progress** - Track current reading position

### January 20, 2026
- **Bottom navigation bar** - Book, Chapter, Verse, Translation selectors
- **Version selector** - KJV, BSB, WEB, BBE, Tagalog (14+ versions)

### January 15, 2026
- **Bible API integration** - Connect to Beblia/Holy-Bible-XML-Format
- **Book selection UI** - Grid view of Bible books
- **Chapter navigation** - Navigate between chapters
- **Verse display with formatting** - Show verses with proper formatting

---

## Core Infrastructure (December 2025)

- **Project setup** - React Native/Expo with TypeScript
- **Navigation setup** - Expo Router with tab navigation
- **State management** - React Context for Bible and Theme state
- **Type definitions** - Bible and Devotional TypeScript types
- **Storage services** - AsyncStorage for settings, IndexedDB for Bible data

---

*Last updated: March 18, 2026*
