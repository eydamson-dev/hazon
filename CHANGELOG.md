# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- Replaced Tamagui UI framework with React Native Elements for better Android compatibility
- Fixed "window.matchMedia is not a function" error on Android
- Replaced IndexedDB with expo-file-system for Bible storage on mobile (no size limit)
- Fixed verse selection context menu layout on mobile
- Simplified "Add to Devotion" flow - tap existing devotion to add verses directly
- Clickable verse references in devotionals - navigate to verse in Bible

### Added
- Swipe-to-delete on notes - Swipe left to reveal delete action with confirmation
- Note count badge - Show count badge on verse note icons when > 1 note
- Note typography improvements - Increased font size, better contrast, improved line height
- Note card styling improvements - Added shadows, increased border radius to 12px, better padding
- Journal tab icon changed to bookmark-outline with sub-tab icons (heart for Devotionals, document-text for Notes)
- Notes/Annotations - Add personal notes to Bible verses with linked verses and notes
- Journal tab - Combined devotionals and notes in one tab
- Edit date - Change creation date when editing a devotional
- Font Size adjustment - Small, Medium, Large, Extra Large options in Settings
- expo-file-system for large Bible translation storage on mobile
- Add verses to existing devotionals from verse context menu
- Sequential verse grouping in display (e.g., "John 3:1-3, 5, 8-12")
- Date filter for devotions - filter by exact date using native date picker
- Share devotionals - Share devotional as formatted text (web & mobile support)
- Removed Calendar tab, replaced with All | Trash tabs
- Added @react-native-community/datetimepicker for native date picking

### Refactored
- Extracted modal components (BookSelector, ChapterSelector, VerseSelector) to separate files
- Fixed TypeScript any types - replaced with proper VerseContent type

## [1.2.0] - 2026-03-15

### Added
- Search functionality - search Bible verses within downloaded translations
- Search results navigate directly to verse when tapped
- Search requires minimum 2 characters
- Search displays book, chapter, verse reference with text preview
- **Search term highlighting** - matching words are highlighted in results

### Changed
- Updated AGENTS.md with app description and features

### Fixed
- **Devotion translation bug** - now saves translation ID/name with verse references
- When viewing devotions, verse text refreshes to match current translation

## [1.1.0] - 2026-03-14

### Added
- Beblia GitHub XML Bible translations (998+ translations available)
- IndexedDB storage for downloaded translations (no size limits)
- Compare translations feature (view selected verse in multiple versions)
- Offline reading support after first download
- Empty state with "Download Translations" button when no translations downloaded
- Auto-load Genesis Chapter 1 when a translation is first downloaded
- Custom OpenCode skill for Bible App development (.opencode/skills/hazon)
- Devotional feature with create, edit, delete, and trash functionality
- Create devotions from selected verses or directly from devotional screen
- View devotions in list, calendar, or trash tabs
- Calendar view shows dots on days with devotions
- Add/remove verses to existing devotions
- Add verses to existing devotion or create new from Bible selection
- Verse selection toolbar with Copy, Share, Compare, Devotion, Cancel buttons
- Verse range floating above toolbar

### Changed
- Replaced HelloAO.org API with Beblia GitHub XML repository
- Removed hardcoded translations - users now download any translation they want
- Book IDs now use xml_* format for Beblia translations
- Verse range moved above context menu for better visibility

### Fixed
- Translation selector now shows only downloaded translations
- Ensure deleted translations are properly removed from list
- Translation name formatting (NIV, ESV now display correctly instead of N I V)
- Devotional save button not working (fixed)
- Devotional delete button not working (fixed)

### In Progress
- Paragraph/continuous reading mode
