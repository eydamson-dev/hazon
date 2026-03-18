# Todo List

## Current Session
- **Session**: Better empty states implementation
- **Status**: ✅ Completed - PR merged

## In Progress (WIP)
- [ ] **Search Within Current Chapter** - Epic Feature (5 Tasks)
  - **Started**: 2026-03-18
  - **Branch**: enhancement/chapter-search
  - **Overview**: Add chapter-level search to Bible reader for quick verse navigation
  - **Files**: `app/index.tsx`
  - **Total Estimated Time**: ~2 hours
  - **Blockers**: None

### Task 1: Add Search Icon Button ⬅️ CURRENT
**Goal**: Place search icon [🔍] on book selector bar, left of [+] button

**Implementation Details**:
- Add `Ionicons` "search" icon to book selector bar (left of [+] button)
- Add `isSearchMode: boolean` state to toggle search bar visibility
- Position in same row as [Genesis 1...] dropdown and [+] button
- Style: Same size (24px) and color as [+] button (`PRIMARY_COLOR`)

**Code Changes in app/index.tsx**:
1. Import Ionicons if not already imported
2. Add state: `const [isSearchMode, setIsSearchMode] = useState(false);`
3. Add search button TouchableOpacity left of [+] button in book selector bar
4. Add toggle handler: `onPress={() => setIsSearchMode(!isSearchMode)}`

**Acceptance Criteria**:
- [ ] Search icon visible on book selector bar (left of +)
- [ ] Tapping icon toggles `isSearchMode` state
- [ ] Icon has proper touch feedback (opacity change)
- [ ] Works in both light and dark mode

**Estimated Time**: 15 minutes

---

### Task 2: Create Search Bar UI
**Goal**: Build full search bar component below book selector bar

**UI Components (left to right)**:
1. **[←]** Back/Close button - exits search mode
2. **TextInput** - "Search this chapter..." placeholder
3. **[↑]** Up arrow - navigate to previous match
4. **"X/Y"** - Match counter (current/total)
5. **[↓]** Down arrow - navigate to next match
6. **[X]** Close button - alternative way to exit

**Positioning**:
- Appears BELOW book selector bar (between it and verse content)
- Full width of screen
- Height: ~50px
- Background: Same as book selector bar or slightly different

**Styling**:
- Background: Light gray or match app background
- Border bottom: Subtle separator line
- Icons: 20-24px, PRIMARY_COLOR
- TextInput: Flex grow, left padding
- Counter: Fixed width, centered

**State Management**:
- `searchQuery: string` - controlled input
- `searchMatches: number[]` - empty initially
- `currentMatchIndex: number` - -1 initially

**Acceptance Criteria**:
- [ ] Search bar renders when `isSearchMode` is true
- [ ] TextInput accepts keyboard input
- [ ] Up/Down arrows visible and tappable
- [ ] Counter shows "0/0" initially
- [ ] Close buttons exit search mode
- [ ] Keyboard dismisses on scroll or outside tap
- [ ] Dark mode support

**Estimated Time**: 30 minutes

---

### Task 3: Implement Search Logic
**Goal**: Find and track matching verses in current chapter

**Algorithm**:
```javascript
// Search through currentChapter.content
const findMatches = (query: string): number[] => {
  if (!query || query.length < 2) return []; // Min 2 chars
  
  const matches: number[] = [];
  const lowerQuery = query.toLowerCase();
  
  currentChapter?.content?.forEach((item) => {
    if (item.type === 'verse' && item.number && item.content) {
      const verseText = item.content.join(' ').toLowerCase();
      if (verseText.includes(lowerQuery)) {
        matches.push(item.number);
      }
    }
  });
  
  return matches;
};
```

**Implementation Steps**:
1. Add `useEffect` to watch `searchQuery` changes
2. Debounce search (300ms) to avoid lag while typing
3. Update `searchMatches` array with matching verse numbers
4. Reset `currentMatchIndex` to 0 when query changes
5. Update counter display format: "1/15", "0/0", etc.

**State Updates**:
- `searchMatches: number[]` - verse numbers with matches
- `currentMatchIndex: number` - currently focused match
- Counter display: `${currentMatchIndex + 1}/${searchMatches.length}`

**Edge Cases**:
- Empty query: matches = [], counter = "0/0"
- No matches: matches = [], counter = "0/0" or "No matches"
- Single match: counter = "1/1"
- Many matches: counter = "1/50", "2/50", etc.

**Acceptance Criteria**:
- [ ] Typing triggers search after debounce
- [ ] Case-insensitive matching
- [ ] Counter updates in real-time
- [ ] Minimum 2 characters before searching
- [ ] Empty query clears matches
- [ ] Handles special characters
- [ ] No performance lag while typing

**Estimated Time**: 30 minutes

---

### Task 4: Add Text Highlighting
**Goal**: Highlight matching words within verse text (yellow background)

**Implementation**:
Create `HighlightedVerseText` component that:
1. Takes verse text content and search query as props
2. Splits text by query (case-insensitive)
3. Wraps matching parts in styled `<Text>` with yellow background

**Component Structure**:
```javascript
const HighlightedVerseText = ({ content, query, baseStyle }) => {
  if (!query) return <Text style={baseStyle}>{content.join(' ')}</Text>;
  
  const text = content.join(' ');
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} style={styles.searchHighlight}>{part}</Text>
        ) : (
          part
        )
      )}
    </Text>
  );
};
```

**Highlight Style**:
```javascript
searchHighlight: {
  backgroundColor: '#FFF59D', // Yellow
  color: '#000',
}
```

**Integration**:
- Use in verse rendering instead of plain text
- Pass current `searchQuery` as prop
- Only highlight when `isSearchMode` is true and query exists

**Conflict Resolution**:
- Verse highlighting (from highlight feature) takes precedence
- Search highlighting only applies to text, not background
- If both apply, show highlight color with yellow text background

**Acceptance Criteria**:
- [ ] Matching words have yellow background
- [ ] Highlights update as user types
- [ ] Multiple matches in same verse all highlighted
- [ ] Works alongside existing verse highlighting
- [ ] Dark mode: Adjust if needed
- [ ] No re-render performance issues

**Estimated Time**: 20 minutes

---

### Task 5: Implement Navigation
**Goal**: Up/Down arrows scroll to previous/next match

**Scroll Logic**:
```javascript
const navigateToMatch = (direction: 'up' | 'down') => {
  if (searchMatches.length === 0) return;
  
  let newIndex;
  if (direction === 'up') {
    newIndex = currentMatchIndex <= 0 
      ? searchMatches.length - 1 // Wrap to last
      : currentMatchIndex - 1;
  } else {
    newIndex = currentMatchIndex >= searchMatches.length - 1
      ? 0 // Wrap to first
      : currentMatchIndex + 1;
  }
  
  setCurrentMatchIndex(newIndex);
  const verseNum = searchMatches[newIndex];
  scrollToVerse(verseNum);
};

const scrollToVerse = (verseNum: number) => {
  const yPosition = versePositionsRef.current[verseNum];
  if (yPosition && scrollViewRef.current) {
    scrollViewRef.current.scrollTo({ y: yPosition, animated: true });
  }
};
```

**Button Handlers**:
- Up arrow onPress: `navigateToMatch('up')`
- Down arrow onPress: `navigateToMatch('down')`

**Edge Cases**:
- No matches: Disable buttons or do nothing
- First match + up: Wrap to last match
- Last match + down: Wrap to first match
- Verse position not ready: Retry with setTimeout

**Auto-scroll (Optional)**:
- When search query changes, auto-scroll to first match
- Only if matches > 0

**Acceptance Criteria**:
- [ ] Down arrow scrolls to next match
- [ ] Up arrow scrolls to previous match
- [ ] Counter updates with navigation
- [ ] Wrap-around navigation works
- [ ] Smooth animated scroll
- [ ] Handles missing verse positions gracefully
- [ ] Buttons disabled or no-op when no matches

**Estimated Time**: 20 minutes

---

## UI Reference

**Normal State:**
```
┌─────────────────────────────────────────────┐
│ Bible                                       │
├─────────────────────────────────────────────┤
│ [Genesis 1                    ]     [🔍][+] │
├─────────────────────────────────────────────┤
│ 1 In the beginning God created...           │
│ 2 Now the earth was formless...             │
│ ...                                         │
└─────────────────────────────────────────────┘
```

**Search Active:**
```
┌─────────────────────────────────────────────┐
│ Bible                                       │
├─────────────────────────────────────────────┤
│ [Genesis 1                    ]     [🔍][+] │
├─────────────────────────────────────────────┤
│ [←][Search chapter...    ][↑] 3/15 [↓] [X] │
├─────────────────────────────────────────────┤
│ 3 And God said, Let there be [light]...     │
│   and there was [light].                    │
│ ...                                         │
└─────────────────────────────────────────────┘
```

## Testing Checklist (All Tasks)
- [ ] Search icon visible and clickable
- [ ] Search bar appears/disappears correctly
- [ ] Can type in search input
- [ ] Matching verses found and counted
- [ ] Matching words highlighted in yellow
- [ ] Up/Down arrows navigate between matches
- [ ] Counter shows correct position
- [ ] Wrap-around navigation works
- [ ] Close buttons exit search mode
- [ ] Dark mode works throughout
- [ ] No performance issues
- [ ] Typecheck passes: `pnpm run typecheck`

## Next Up (Priority Order)
- [ ] Search within chapter - Scroll positioning issue (complex to fix) [Parked]
- [ ] Reading History - List recently read passages
- [ ] Bookmarks/Favorites - Save favorite verses for quick access

## Recently Completed (Last 5)
- [x] **Better empty states** - Add illustrations/icons to empty lists [2026-03-18]
- [x] **Refactor: Split devotional.tsx** - Clean directory structure with `app/journals/` [2026-03-18]
- [x] **Swipe-to-delete** - Add swipe gesture on note cards with confirmation [2026-03-18]
- [x] **Note count badge** - Show count on verse note icons when > 1 [2026-03-18]
- [x] **Note typography improvements** - Better font sizes, contrast, line height [2026-03-18]

## WIP Template (Copy for new task)
```
## In Progress (WIP)
- [ ] Feature name
  - **Started**: [date]
  - **Branch**: [branch-name]
  - **Scope**: [brief description]
  - **Notes**: [any important context]
  - **Blockers**: [none or list issues]
```
