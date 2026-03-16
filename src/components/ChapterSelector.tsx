import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import type { Book } from '../types/bible';

interface ChapterSelectorProps {
  book: Book | null;
  selectedChapter: number;
  isDark: boolean;
  onSelect: (chapter: number) => void;
  onClose: () => void;
}

const PRIMARY_COLOR = '#304080';

export default function ChapterSelector({ book, selectedChapter, isDark, onSelect, onClose }: ChapterSelectorProps) {
  const chapters = Array.from({ length: book?.numberOfChapters || 50 }, (_, i) => i + 1);

  return (
    <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
          Select Chapter - {book?.commonName}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.modalContent}>
        <View style={styles.chapterGrid}>
          {chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter}
              style={[
                styles.chapterItem,
                isDark && styles.chapterItemDark,
                selectedChapter === chapter && styles.chapterItemSelected,
              ]}
              onPress={() => onSelect(chapter)}
            >
              <Text
                style={[
                  styles.chapterItemText,
                  isDark && styles.chapterItemTextDark,
                  selectedChapter === chapter && styles.chapterItemTextSelected,
                ]}
              >
                {chapter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainerDark: {
    backgroundColor: '#121212',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTitleDark: {
    color: '#fff',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  closeButtonDark: {
    color: '#fff',
  },
  modalContent: {
    flex: 1,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  chapterItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chapterItemDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  chapterItemSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  chapterItemText: {
    fontSize: 16,
    color: '#333',
  },
  chapterItemTextDark: {
    color: '#fff',
  },
  chapterItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
