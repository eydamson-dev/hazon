# Bible App API Reference

## Beblia GitHub API

### Get Available Translations
```typescript
GET https://api.github.com/repos/Beblia/Holy-Bible-XML-Format/contents
```

Returns array of XML files. Each file has:
- `name`: e.g., "EnglishNIVBible.xml"
- `size`: file size in bytes

### Download Translation
```typescript
GET https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master/{filename}
```

Example:
- https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master/EnglishNIVBible.xml

### Translation ID Format
```typescript
// In the app, IDs are stored as:
id: `beblia_${filename.toLowerCase().replace('.xml', '')}`
// e.g., "beblia_englishnivbible"
```

## Translation Name Formatting

The app formats translation names intelligently:

```typescript
// Old (incorrect): "English N I V Bible"
.replace(/([A-Z])/g, ' $1')

// New (correct): "English NIV Bible"
.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
```

This handles acronyms like NIV, ESV, KJV properly.

## IndexedDB Schema

### Database Name: `bible-translations`

### Object Stores:
1. `translations` - metadata about downloaded translations
2. `books_{translationId}` - books list for each translation
3. `chapters_{translationId}_{bookNum}` - chapter content

## AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  SELECTED_TRANSLATION: 'bible_selected_translation',
  DOWNLOADED_VERSIONS: 'bible_downloaded_versions',
  READING_STATE: 'bible_reading_state',
  TABS: 'bible_tabs',
  ACTIVE_TAB: 'bible_active_tab',
  HIGHLIGHTS: 'bible_highlights',
};
```

## Common Issues

### Translation Not Found in Search
- Check name formatting regex
- Ensure search is case-insensitive

### Download Fails
- Check network connectivity
- Verify Beblia GitHub is accessible
- Check XML parsing in parseXmlBible()

### Offline Mode Not Working
- Verify IndexedDB has translation data
- Check that translation is in downloaded_versions list
