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
- expo-file-system for large Bible translation storage on mobile
- Add verses to existing devotionals from verse context menu
- Sequential verse grouping in display (e.g., "John 3:1-3, 5, 8-12")
- Date filter for devotions - filter by exact date using native date picker
- Removed Calendar tab, replaced with All | Trash tabs
- Added @react-native-community/datetimepicker for native date picking

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
- Custom OpenCode skill for Bible App development (.opencode/skills/cjcrsg-bible-app)
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
