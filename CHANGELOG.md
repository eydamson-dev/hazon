# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.0.0] - 2026-03-14

### Added
- Bible API integration (HelloAO.org)
- Multiple translations support (KJV, BSB, WEB, BBE, Tagalog)
- Tab system for opening multiple Bible books/chapters simultaneously
- Verse highlighting with 6 color options (Yellow, Green, Blue, Pink, Orange, Purple)
- Highlight persistence per book/chapter (saved to AsyncStorage)
- Copy and share selected verses
- Horizontally scrollable chapter selector
- Tab icons in navigation (Bible, Devotional, Search, Settings)
- Tamagui UI framework integration

### Changed
- Replaced bottom nav chapter/verse buttons with horizontal chapter scroll
- Tab bar with scrollable tabs for multiple Bible chapters
- Move highlight context menu to bottom above chapter selector

### Fixed
- Verse navigation auto-scroll
- Tab state persistence on page refresh
- Chapter scroll position on load

### In Progress

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

### Changed
- Replaced HelloAO.org API with Beblia GitHub XML repository
- Removed hardcoded translations - users now download any translation they want
- Book IDs now use xml_* format for Beblia translations

### Fixed
- Translation selector now shows only downloaded translations
- Ensure deleted translations are properly removed from list
- Translation name formatting (NIV, ESV now display correctly instead of N I V)
- Devotional save button not working (fixed)
- Devotional delete button not working (fixed)

### In Progress
- Search functionality
- Paragraph/continuous reading mode
