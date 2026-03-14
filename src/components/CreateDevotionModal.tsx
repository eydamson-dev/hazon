import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../store/ThemeContext';
import { useDevotional } from '../store/DevotionalContext';
import type { Book, Chapter } from '../types/bible';
import type { VerseRef } from '../types/devotional';

const PRIMARY_COLOR = '#304080';

interface CreateDevotionModalProps {
  selectedVerses: Set<number>;
  currentBook: Book | null;
  currentChapterNum: number;
  currentChapter: Chapter | null;
  onClose: () => void;
}

export default function CreateDevotionModal({
  selectedVerses,
  currentBook,
  currentChapterNum,
  currentChapter,
  onClose,
}: CreateDevotionModalProps) {
  const { isDark } = useTheme();
  const { createDevotion } = useDevotional();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const verseRefs: VerseRef[] = [];
  
  if (currentBook && currentChapter && selectedVerses.size > 0) {
    const sortedVerses = Array.from(selectedVerses).sort((a, b) => a - b);
    const verseContents: string[] = [];
    
    for (const verseNum of sortedVerses) {
      const verse = currentChapter.chapter.content.find(
        (c: any) => c.type === 'verse' && c.number === verseNum
      );
      if (verse) {
        const text = verse.content?.map((c: any) => typeof c === 'string' ? c : c.text).join(' ');
        verseContents.push(text || '');
      }
    }

    verseRefs.push({
      bookId: currentBook.id,
      bookName: currentBook.commonName,
      chapter: currentChapterNum,
      verses: sortedVerses,
      text: verseContents.join(' '),
    });
  }

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your reflection');
      return;
    }

    setIsSaving(true);
    try {
      const success = await createDevotion(title.trim(), content.trim(), verseRefs);
      if (success) {
        Alert.alert('Success', 'Devotion saved!', [
          { text: 'OK', onPress: onClose }
        ]);
      } else {
        Alert.alert('Error', 'Failed to save devotion');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save devotion');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Devotion</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {verseRefs.length > 0 && (
          <View style={styles.verseSection}>
            <Text style={styles.sectionLabel}>Selected Verses</Text>
            <View style={styles.verseRef}>
              <Text style={styles.verseRefText}>
                {currentBook?.commonName} {currentChapterNum}:{Array.from(selectedVerses).sort((a, b) => a - b).join(', ')}
              </Text>
            </View>
            {verseRefs[0].text && (
              <Text style={styles.verseText}>{verseRefs[0].text}</Text>
            )}
          </View>
        )}

        <Text style={styles.sectionLabel}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter devotion title..."
          placeholderTextColor={isDark ? '#666' : '#999'}
        />

        <Text style={styles.sectionLabel}>Reflection</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Write your reflection..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: isDark ? '#888' : '#666',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  saveButtonDisabled: {
    color: isDark ? '#444' : '#ccc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#aaa' : '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  verseSection: {
    marginBottom: 16,
  },
  verseRef: {
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  verseRefText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  verseText: {
    fontSize: 14,
    color: isDark ? '#ccc' : '#333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  input: {
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: isDark ? '#fff' : '#000',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
});
