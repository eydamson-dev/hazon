import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import type { Book } from '../types/bible';

interface BookSelectorProps {
  books: Book[];
  selectedBookId?: string;
  isDark: boolean;
  onSelect: (book: Book) => void;
  onClose: () => void;
}

const PRIMARY_COLOR = '#304080';

export default function BookSelector({ books, selectedBookId, isDark, onSelect, onClose }: BookSelectorProps) {
  const oldTestament = books.filter((b) => b.order <= 39);
  const newTestament = books.filter((b) => b.order > 39);

  const renderBookList = (bookList: Book[], title: string) => (
    <View>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{title}</Text>
      <View style={styles.bookGrid}>
        {bookList.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.bookItem,
              isDark && styles.bookItemDark,
              selectedBookId === book.id && styles.bookItemSelected,
            ]}
            onPress={() => onSelect(book)}
          >
            <Text
              style={[
                styles.bookItemText,
                isDark && styles.bookItemTextDark,
                selectedBookId === book.id && styles.bookItemTextSelected,
              ]}
              numberOfLines={1}
            >
              {book.commonName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Book</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.modalContent}>
        {renderBookList(oldTestament, 'Old Testament')}
        {renderBookList(newTestament, 'New Testament')}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitleDark: {
    color: PRIMARY_COLOR,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  bookItem: {
    width: '30%',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bookItemDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  bookItemSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  bookItemText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  bookItemTextDark: {
    color: '#fff',
  },
  bookItemTextSelected: {
    color: '#fff',
  },
});
