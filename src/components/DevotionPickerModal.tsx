import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../store/ThemeContext';
import { useDevotional } from '../store/DevotionalContext';
import type { Devotion, VerseRef } from '../types/devotional';
import type { Book, Chapter } from '../types/bible';

const PRIMARY_COLOR = '#304080';

interface DevotionPickerModalProps {
  selectedVerses: Set<number>;
  currentBook: Book | null;
  currentChapterNum: number;
  currentChapter: Chapter | null;
  onClose: () => void;
  onCreateNew: () => void;
  onAddToExisting: (devotionId: string) => void;
}

export default function DevotionPickerModal({
  selectedVerses,
  currentBook,
  currentChapterNum,
  currentChapter,
  onClose,
  onCreateNew,
  onAddToExisting,
}: DevotionPickerModalProps) {
  const { isDark } = useTheme();
  const { devotions } = useDevotional();
  const styles = createStyles(isDark);

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

  const handleSelectDevotion = (devotion: Devotion) => {
    onAddToExisting(devotion.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Devotion</Text>
        <TouchableOpacity onPress={onCreateNew}>
          <Text style={styles.saveButton}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versePreview}>
        <Text style={styles.previewLabel}>Selected Verses:</Text>
        <Text style={styles.previewText}>
          {currentBook?.commonName} {currentChapterNum}:{Array.from(selectedVerses).sort((a, b) => a - b).join(', ')}
        </Text>
        {verseRefs[0]?.text && (
          <Text style={styles.previewVerseText} numberOfLines={2}>
            {verseRefs[0].text}
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Or add to existing devotion:</Text>

      <ScrollView style={styles.list}>
        {devotions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No existing devotions</Text>
            <Text style={styles.emptySubtext}>Tap "+ New" to create one</Text>
          </View>
        ) : (
          devotions.map((devotion) => (
            <TouchableOpacity
              key={devotion.id}
              style={styles.devotionItem}
              onPress={() => handleSelectDevotion(devotion)}
            >
              <Text style={styles.devotionTitle}>{devotion.title}</Text>
              <Text style={styles.devotionDate}>
                {new Date(devotion.createdAt).toLocaleDateString()}
              </Text>
              {devotion.verseRefs.length > 0 && (
                <Text style={styles.devotionVerseCount}>
                  {devotion.verseRefs.length} verse(s)
                </Text>
              )}
            </TouchableOpacity>
          ))
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  versePreview: {
    padding: 16,
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  previewVerseText: {
    fontSize: 12,
    color: isDark ? '#ccc' : '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#aaa' : '#666',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: isDark ? '#888' : '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDark ? '#666' : '#999',
  },
  devotionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  devotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
  },
  devotionDate: {
    fontSize: 12,
    color: isDark ? '#888' : '#999',
    marginTop: 2,
  },
  devotionVerseCount: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    marginTop: 2,
  },
});
