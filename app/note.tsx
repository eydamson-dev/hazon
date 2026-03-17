import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, FlatList, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  return `Genesis ${chapter}:${verse}`.replace('Genesis', getBookName(bookNum)).replace(/:$/, '');
}

function getBookName(bookNum: number): string {
  const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];
  return books[bookNum - 1] || `Book ${bookNum}`;
}

export default function NoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ noteId?: string; verseRefs?: string }>();
  const { isDark, fontSizeValue } = useTheme();
  const { notes, addNote, updateNote, deleteNote, getNoteById, books } = useBible();

  const [noteId, setNoteId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [verseRefs, setVerseRefs] = useState<string[]>([]);
  const [noteRefs, setNoteRefs] = useState<string[]>([]);
  const [showVersePicker, setShowVersePicker] = useState(false);
  const [showNotePicker, setShowNotePicker] = useState(false);
  const [verseSearchQuery, setVerseSearchQuery] = useState('');
  const [noteSearchQuery, setNoteSearchQuery] = useState('');

  const isEditing = !!noteId;

  const styles = createStyles(isDark, fontSizeValue);

  useEffect(() => {
    // Reset all state first
    setNoteId(null);
    setContent('');
    setVerseRefs([]);
    setNoteRefs([]);

    if (params.noteId) {
      const existingNote = getNoteById(params.noteId);
      if (existingNote) {
        setNoteId(existingNote.id);
        setContent(existingNote.content);
        setVerseRefs(existingNote.verseRefs);
        setNoteRefs(existingNote.noteRefs);
      }
    } else if (params.verseRefs) {
      try {
        const refs = JSON.parse(params.verseRefs);
        setVerseRefs(refs);
      } catch {
        setVerseRefs([]);
      }
    }
  }, [params.noteId, params.verseRefs]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter note content');
      return;
    }

    if (isEditing && noteId) {
      const success = await updateNote(noteId, content.trim(), verseRefs, noteRefs);
      if (success) {
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update note');
      }
    } else {
      const newNote = await addNote(content.trim(), verseRefs, noteRefs);
      router.back();
    }
  };

  const handleDelete = () => {
    if (!noteId) return;
    
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteNote(noteId);
            router.back();
          }
        },
      ]
    );
  };

  const addVerseRef = (ref: string) => {
    if (!verseRefs.includes(ref)) {
      setVerseRefs([...verseRefs, ref]);
    }
    setShowVersePicker(false);
    setVerseSearchQuery('');
  };

  const removeVerseRef = (ref: string) => {
    setVerseRefs(verseRefs.filter(r => r !== ref));
  };

  const addNoteRef = (id: string) => {
    if (!noteRefs.includes(id)) {
      setNoteRefs([...noteRefs, id]);
    }
    setShowNotePicker(false);
    setNoteSearchQuery('');
  };

  const removeNoteRef = (id: string) => {
    setNoteRefs(noteRefs.filter(r => r !== id));
  };

  const filteredNotes = notes.filter(n => 
    n.id !== noteId && n.content.toLowerCase().includes(noteSearchQuery.toLowerCase())
  );

  const filteredVerseRefs = books.flatMap(book => 
    Array.from({ length: 50 }, (_, i) => i + 1).map(chapter => 
      Array.from({ length: 50 }, (_, j) => j + 1).map(verse => 
        `${book.id}_${chapter}_${verse}`
      )
    ).flat()
  ).filter(ref => {
    if (!verseSearchQuery) return false;
    const parts = ref.split('_');
    const bookNum = parseInt(parts[1]);
    const chapter = parts[2];
    const verse = parts[3];
    const bookName = getBookName(bookNum).toLowerCase();
    const query = verseSearchQuery.toLowerCase();
    return bookName.includes(query) || 
           chapter.includes(query) || 
           verse.includes(query);
  }).slice(0, 50);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
        {isEditing && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={22} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.inputLabel}>Note</Text>
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder="Enter your note here..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.sectionTitle}>Linked Verses</Text>
        <View style={styles.linkedItems}>
          {verseRefs.map(ref => (
            <View key={ref} style={styles.linkedItem}>
              <Text style={styles.linkedItemText}>{verseRefToString(ref)}</Text>
              <TouchableOpacity onPress={() => removeVerseRef(ref)}>
                <Ionicons name="close-circle" size={18} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowVersePicker(true)}
          >
            <Text style={styles.addButtonText}>+ Add Verse</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Linked Notes</Text>
        <View style={styles.linkedItems}>
          {noteRefs.map(id => {
            const note = getNoteById(id);
            return note ? (
              <View key={id} style={styles.linkedItem}>
                <Text style={styles.linkedItemText} numberOfLines={1}>
                  {note.content.substring(0, 30)}...
                </Text>
                <TouchableOpacity onPress={() => removeNoteRef(id)}>
                  <Ionicons name="close-circle" size={18} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : null;
          })}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowNotePicker(true)}
          >
            <Text style={styles.addButtonText}>+ Add Note</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Note</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showVersePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Verse</Text>
              <TouchableOpacity onPress={() => setShowVersePicker(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search verses (e.g., John 3:16)"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={verseSearchQuery}
              onChangeText={setVerseSearchQuery}
            />
            <FlatList
              data={filteredVerseRefs}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.pickerItem}
                  onPress={() => addVerseRef(item)}
                >
                  <Text style={styles.pickerItemText}>{verseRefToString(item)}</Text>
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showNotePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Note</Text>
              <TouchableOpacity onPress={() => setShowNotePicker(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={noteSearchQuery}
              onChangeText={setNoteSearchQuery}
            />
            <FlatList
              data={filteredNotes}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.pickerItem}
                  onPress={() => addNoteRef(item.id)}
                >
                  <Text style={styles.pickerItemText} numberOfLines={2}>
                    {item.content.substring(0, 50)}...
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.pickerList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No notes found</Text>
              }
            />
          </View>
        </View>
      </Modal>
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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#e0e0e0',
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    deleteButton: {
      padding: 4,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#aaa' : '#666',
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      borderRadius: 8,
      padding: 12,
      fontSize: fontSize,
      color: isDark ? '#fff' : '#000',
      minHeight: 150,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#aaa' : '#666',
      marginBottom: 8,
      marginTop: 16,
    },
    linkedItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    linkedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#304080' : '#e0e0ff',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    linkedItemText: {
      fontSize: 13,
      color: '#fff',
    },
    addButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: PRIMARY_COLOR,
      borderStyle: 'dashed',
    },
    addButtonText: {
      fontSize: 13,
      color: PRIMARY_COLOR,
    },
    saveButton: {
      backgroundColor: PRIMARY_COLOR,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 32,
      marginBottom: 40,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '70%',
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#e0e0e0',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    searchInput: {
      margin: 16,
      marginTop: 8,
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
    },
    pickerList: {
      flex: 1,
    },
    pickerItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#e0e0e0',
    },
    pickerItemText: {
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
    },
    emptyText: {
      textAlign: 'center',
      padding: 20,
      color: isDark ? '#666' : '#999',
    },
  });
}
