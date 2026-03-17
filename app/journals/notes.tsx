import { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated, PanResponder, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/store/ThemeContext';
import { useBible } from '../../src/store/BibleContext';
import type { Note } from '../../src/services/theme';

const PRIMARY_COLOR = '#304080';

function verseRefToString(verseRef: string): string {
  const parts = verseRef.split('_');
  if (parts.length < 3) return verseRef;
  const bookNum = parseInt(parts[1]);
  const chapter = parts[2];
  const verse = parts[3] || '';
  const bookNames: Record<number, string> = {
    1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
    6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles',
    15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms',
    20: 'Proverbs', 21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah',
    24: 'Jeremiah', 25: 'Lamentations', 26: 'Ezekiel', 27: 'Daniel',
    28: 'Hosea', 29: 'Joel', 30: 'Amos', 31: 'Obadiah', 32: 'Jonah',
    33: 'Micah', 34: 'Nahum', 35: 'Habakkuk', 36: 'Zephaniah', 37: 'Haggai',
    38: 'Zechariah', 39: 'Malachi', 40: 'Matthew', 41: 'Mark', 42: 'Luke',
    43: 'John', 44: 'Acts', 45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians',
    48: 'Galatians', 49: 'Ephesians', 50: 'Philippians', 51: 'Colossians',
    52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
    56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter',
    61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude', 66: 'Revelation',
  };
  const bookName = bookNames[bookNum] || `Book ${bookNum}`;
  return verse ? `${bookName} ${chapter}:${verse}` : `${bookName} ${chapter}`;
}

function SwipeableNoteCard({ 
  note, 
  onPress, 
  onDelete, 
  styles,
  isDark 
}: { 
  note: Note; 
  onPress: () => void; 
  onDelete: () => void;
  styles: any;
  isDark: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [showActions, setShowActions] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
          setShowActions(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Delete Note\n\nAre you sure you want to delete this note?');
      if (confirmed) {
        onDelete();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setShowActions(false);
      }
    } else {
      Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
        { text: 'Cancel', style: 'cancel', onPress: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setShowActions(false);
        }},
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]);
    }
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.swipeActions, isDark && styles.swipeActionsDark]}>
        <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Animated.View 
        style={[styles.noteCard, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={onPress} style={styles.swipeableInner}>
          <Text style={styles.notePreviewText} numberOfLines={2}>{note.content}</Text>
          <View style={styles.noteMeta}>
            <Text style={styles.noteMetaText}>{note.verseRefs.length} verses</Text>
            <Text style={styles.noteDateText}>
              {new Date(note.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function NotesContent() {
  const router = useRouter();
  const { isDark, fontSizeValue } = useTheme();
  const { notes, deleteNote } = useBible();
  const [searchQuery, setSearchQuery] = useState('');

  const styles = createStyles(isDark, fontSizeValue);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    return notes.filter(note => 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.verseRefs.some(ref => verseRefToString(ref).toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [notes, searchQuery]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredNotes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={isDark ? '#888' : '#666'} style={styles.searchIcon} />
        <TouchableOpacity
          style={styles.searchInputContainer}
          onPress={() => router.push('/notes')}
        >
          <Text style={styles.searchPlaceholder}>Search notes...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {sortedNotes.map(note => (
          <SwipeableNoteCard
            key={note.id}
            note={note}
            onPress={() => router.push(`/note?noteId=${note.id}`)}
            onDelete={() => deleteNote(note.id)}
            styles={styles}
            isDark={isDark}
          />
        ))}

        {sortedNotes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={isDark ? '#444' : '#ccc'} />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>Long-press a verse to add a note</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/note')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (isDark: boolean, fontSize: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: isDark ? '#666' : '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#aaa' : '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDark ? '#666' : '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  swipeContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  noteCard: {
    backgroundColor: isDark ? '#2a2a2a' : '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  swipeableInner: {
    backgroundColor: isDark ? '#2a2a2a' : '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  swipeActions: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 12,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    borderRadius: 12,
  },
  swipeActionsDark: {
    backgroundColor: '#cc0000',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  notePreviewText: {
    fontSize: fontSize + 2,
    color: isDark ? '#fff' : '#000',
    marginBottom: 10,
    lineHeight: fontSize + 6,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  noteMetaText: {
    fontSize: 13,
    color: isDark ? '#aaa' : '#555',
    fontWeight: '500',
  },
  noteDateText: {
    fontSize: 13,
    color: isDark ? '#aaa' : '#555',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
});
