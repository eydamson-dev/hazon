import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/store/ThemeContext';
import { useBible } from '../src/store/BibleContext';
import type { Note } from '../src/services/theme';

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

export default function Notes() {
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

  const handleDelete = (note: Note) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteNote(note.id)
        },
      ]
    );
  };

  const renderNote = ({ item }: { item: Note }) => {
    const verseCount = item.verseRefs.length;
    const noteCount = item.noteRefs.length;

    return (
      <TouchableOpacity 
        style={styles.noteCard}
        onPress={() => router.push(`/note?noteId=${item.id}`)}
        onLongPress={() => handleDelete(item)}
      >
        <Text style={styles.noteContent} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.noteMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={14} color={isDark ? '#888' : '#666'} />
            <Text style={styles.metaText}>
              {verseCount} {verseCount === 1 ? 'verse' : 'verses'}
            </Text>
          </View>
          {noteCount > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="link" size={14} color={isDark ? '#888' : '#666'} />
              <Text style={styles.metaText}>
                {noteCount} {noteCount === 1 ? 'note' : 'notes'}
              </Text>
            </View>
          )}
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/note')}
        >
          <Ionicons name="add" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedNotes}
        keyExtractor={item => item.id}
        renderItem={renderNote}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={isDark ? '#444' : '#ccc'} />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to create your first note, or long-press a verse in the Bible to add a note.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function createStyles(isDark: boolean, fontSize: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#e0e0e0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#fff' : '#000',
    },
    addButton: {
      padding: 4,
    },
    list: {
      padding: 16,
    },
    noteCard: {
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    noteContent: {
      fontSize: fontSize,
      color: isDark ? '#fff' : '#000',
      lineHeight: 22,
      marginBottom: 12,
    },
    noteMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: isDark ? '#888' : '#666',
    },
    dateText: {
      fontSize: 12,
      color: isDark ? '#888' : '#666',
      marginLeft: 'auto',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#666' : '#999',
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDark ? '#555' : '#aaa',
      textAlign: 'center',
      paddingHorizontal: 40,
      marginTop: 8,
    },
  });
}
