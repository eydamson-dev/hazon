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
- Beblia GitHub XML Bible translations (14 English versions)
- IndexedDB storage for downloaded translations (no size limits)
- Compare translations feature (view selected verse in multiple versions)
- Offline reading support after first download

### Changed
- Replaced HelloAO.org API with Beblia GitHub XML repository
- Auto-download translation when selected
- Book IDs now use xml_* format for Beblia translations
- Search functionality
- Paragraph/continuous reading mode
- Bookmarks/favorites
- Download Bible versions for offline
- Devotional section
