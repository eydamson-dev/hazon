import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../store/ThemeContext';
import { useDevotional } from '../store/DevotionalContext';
import type { Book, Chapter, BibleVersion } from '../types/bible';
import type { VerseRef, Devotion } from '../types/devotional';

const PRIMARY_COLOR = '#304080';

interface CreateDevotionModalProps {
  selectedVerses: Set<number>;
  currentBook: Book | null;
  currentChapterNum: number;
  currentChapter: Chapter | null;
  selectedVersion: BibleVersion;
  onClose: () => void;
}

export default function CreateDevotionModal({
  selectedVerses,
  currentBook,
  currentChapterNum,
  currentChapter,
  selectedVersion,
  onClose,
}: CreateDevotionModalProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const { devotions, updateDevotion } = useDevotional();
  
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
      translationId: selectedVersion.id,
      translationName: selectedVersion.name,
    });
  }

  const handleAddToDevotion = async (devotion: Devotion) => {
    setIsSaving(true);
    try {
      const mergedVerseRefs = [...devotion.verseRefs, ...verseRefs];
      const success = await updateDevotion(
        devotion.id,
        devotion.title,
        devotion.content,
        mergedVerseRefs
      );
      if (success) {
        onClose();
      } else {
        Alert.alert('Error', 'Failed to add verses to devotion');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add verses to devotion');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    const versesParam = JSON.stringify(verseRefs);
    onClose();
    router.push({
      pathname: '/devotional',
      params: { verses: versesParam }
    });
  };

  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Devotion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {verseRefs.length > 0 && (
          <View style={styles.verseSection}>
            <Text style={styles.sectionLabel}>Selected</Text>
            <View style={styles.verseRef}>
              <Text style={styles.verseRefText}>
                {currentBook?.commonName} {currentChapterNum}:{Array.from(selectedVerses).sort((a, b) => a - b).join(', ')}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.createNewButton}
          onPress={handleCreateNew}
        >
          <Text style={styles.createNewButtonText}>+ Create New Devotion</Text>
        </TouchableOpacity>

        {devotions.length === 0 ? (
          <Text style={styles.emptyText}>No existing devotions</Text>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Or tap to add to existing:</Text>
            {devotions.map((devotion) => (
              <TouchableOpacity
                key={devotion.id}
                style={styles.devotionItem}
                onPress={() => handleAddToDevotion(devotion)}
                disabled={isSaving}
              >
                <Text style={styles.devotionItemTitle} numberOfLines={1}>
                  {devotion.title}
                </Text>
                <Text style={styles.devotionItemDate}>
                  {new Date(devotion.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
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
  createNewButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    color: isDark ? '#666' : '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  devotionItem: {
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  devotionItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
    marginBottom: 4,
  },
  devotionItemDate: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
  },
});
