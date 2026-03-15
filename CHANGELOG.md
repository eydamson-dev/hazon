# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
