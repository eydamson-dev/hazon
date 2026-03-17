# Coding Style Guide

Coding standards and patterns for Hazon Bible App development.

---

## General Principles

- Keep components small and focused
- Use functional components with hooks
- Avoid magic numbers - use constants

---

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase.tsx | `BibleReader.tsx` |
| Utils/Services | camelCase.ts | `bibleService.ts` |
| Types | camelCase.types.ts | `bible.types.ts` |

---

## Component Structure

```typescript
// 1. Props interface at top
interface Props {
  title: string;
}

// 2. Component function
export default function Component({ title }: Props) {
  // 3. useState hooks first
  const [count, setCount] = useState(0);
  
  // 4. useEffect hooks after
  useEffect(() => {
    // effect
  }, []);
  
  // 5. Helper functions before return
  const handlePress = () => {
    setCount(c => c + 1);
  };
  
  // 6. JSX at bottom
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}

// 7. Styles at bottom
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## State Management

- Use **React Context** for global state (Theme, Bible)
- Use **local useState** for component state
- Avoid prop drilling - lift state to Context when needed

---

## Styling

- Use `StyleSheet.create()` for React Native
- Keep styles at bottom of file
- Move to separate file if styles > 50 lines

### Style Organization

```typescript
const createStyles = (isDark: boolean, fontSize: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  // ... other styles
});
```

---

## TypeScript

- **Always define prop types**
- **Avoid `any`** - use proper types
- Define interfaces for component props
- Use type aliases for complex types

---

## Imports

```typescript
// 1. React/external first
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 2. Internal imports second
import { useTheme } from '../store/ThemeContext';
import { useBible } from '../store/BibleContext';

// 3. Relative paths for local files
import EmptyState from '../components/EmptyState';
import type { Note } from '../services/theme';
```

---

## Constants

```typescript
// Use constants for magic numbers
const PRIMARY_COLOR = '#304080';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
```

---

## Error Handling

- Use platform-specific alerts
- Handle both web and mobile cases

```typescript
if (Platform.OS === 'web') {
  const confirmed = window.confirm('Delete?');
  if (confirmed) onDelete();
} else {
  Alert.alert('Delete', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onDelete },
  ]);
}
```

---

*See [AGENTS.md](../AGENTS.md) for project overview.*
