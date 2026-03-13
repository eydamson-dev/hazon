import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  useColorScheme,
} from 'react-native';
import { useBible } from '../src/store/BibleContext';
import type { Book } from '../src/types/bible';

export default function BibleScreen() {
  const colorScheme = useColorScheme();
  const {
    selectedVersion,
    versions,
    books,
    currentChapter,
    currentBook,
    currentChapterNum,
    isLoading,
    error,
    setSelectedVersion,
    loadChapter,
    setCurrentBook,
    setCurrentChapterNum,
  } = useBible();

  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [localCurrentBook, setLocalCurrentBook] = useState<Book | null>(null);
  const [localChapterNum, setLocalChapterNum] = useState(1);

  useEffect(() => {
    if (currentBook) {
      setLocalCurrentBook(currentBook);
    }
  }, [currentBook]);

  useEffect(() => {
    setLocalChapterNum(currentChapterNum);
  }, [currentChapterNum]);

  const handleBookSelect = (book: Book) => {
    setLocalCurrentBook(book);
    setLocalChapterNum(1);
    setCurrentBook(book);
    setCurrentChapterNum(1);
    setShowBookModal(false);
    loadChapter(book.id, 1);
  };

  const handleChapterSelect = (chapter: number) => {
    setLocalChapterNum(chapter);
    setCurrentChapterNum(chapter);
    if (localCurrentBook) {
      loadChapter(localCurrentBook.id, chapter);
    }
    setShowChapterModal(false);
  };

  const handleVersionSelect = async (versionId: string) => {
    await setSelectedVersion(versionId);
    if (localCurrentBook) {
      await loadChapter(localCurrentBook.id, localChapterNum, versionId);
    }
    setShowVersionModal(false);
  };

  const handleBookButtonPress = () => {
    setShowBookModal(true);
  };

  const handleChapterButtonPress = () => {
    setShowChapterModal(true);
  };

  const handleVersionButtonPress = () => {
    setShowVersionModal(true);
  };

  const renderVerseContent = (content: any[]): string => {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.text) return item.text;
        return '';
      })
      .join(' ');
  };

  const oldTestament = books.filter((b) => b.order <= 39);
  const newTestament = books.filter((b) => b.order > 39);

  const renderBookList = (bookList: Book[], title: string) => (
    <View style={styles.bookSection}>
      <Text style={styles.bookSectionTitle}>{title}</Text>
      <View style={styles.bookGrid}>
        {bookList.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.bookItem,
              localCurrentBook?.id === book.id && styles.bookItemSelected,
            ]}
            onPress={() => handleBookSelect(book)}
          >
            <Text
              style={[
                styles.bookItemText,
                localCurrentBook?.id === book.id && styles.bookItemTextSelected,
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

  if (isLoading && books.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#304080" style={styles.loader} />
        <Text style={styles.loadingText}>Loading Bible...</Text>
      </View>
    );
  }

  if (!localCurrentBook) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.selectBookButton}
          onPress={handleBookButtonPress}
        >
          <Text style={styles.selectBookText}>Select a Book</Text>
        </TouchableOpacity>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.versionButton}
            onPress={handleVersionButtonPress}
          >
            <Text style={styles.versionButtonText}>
              {selectedVersion.shortName}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showBookModal} animationType="slide">
          <View style={[styles.modalContainer, colorScheme === 'dark' && styles.modalContainerDark]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Book</Text>
              <TouchableOpacity onPress={() => setShowBookModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {renderBookList(oldTestament, 'Old Testament')}
              {renderBookList(newTestament, 'New Testament')}
            </ScrollView>
          </View>
        </Modal>

        <Modal visible={showVersionModal} animationType="slide">
          <View style={[styles.modalContainer, colorScheme === 'dark' && styles.modalContainerDark]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Translation</Text>
              <TouchableOpacity onPress={() => setShowVersionModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {versions.map((version) => (
                <TouchableOpacity
                  key={version.id}
                  style={[
                    styles.versionItem,
                    selectedVersion.id === version.id && styles.versionItemSelected,
                  ]}
                  onPress={() => handleVersionSelect(version.id)}
                >
                  <Text
                    style={[
                      styles.versionItemText,
                      selectedVersion.id === version.id && styles.versionItemTextSelected,
                    ]}
                  >
                    {version.name}
                  </Text>
                  {version.isDownloaded && (
                    <Text style={styles.downloadedBadge}>✓ Downloaded</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#304080" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : currentChapter ? (
        <ScrollView style={styles.chapterContent}>
          {currentChapter.chapter.content.map((item, index) => {
            if (item.type === 'heading') {
              return (
                <Text key={index} style={styles.heading}>
                  {item.content?.join(' ')}
                </Text>
              );
            }
            if (item.type === 'verse') {
              return (
                <View key={index} style={styles.verse}>
                  <Text style={styles.verseNumber}>{item.number}</Text>
                  <Text style={styles.verseText}>
                    {renderVerseContent(item.content || [])}
                  </Text>
                </View>
              );
            }
            if (item.type === 'line_break') {
              return <View key={index} style={styles.lineBreak} />;
            }
            return null;
          })}
        </ScrollView>
      ) : null}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookButtonPress}
        >
          <Text style={styles.bookButtonText} numberOfLines={1}>
            {localCurrentBook?.commonName || 'Select Book'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.chapterButton}
          onPress={handleChapterButtonPress}
        >
          <Text style={styles.chapterButtonText}>
            Ch. {localChapterNum}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.versionButton}
          onPress={handleVersionButtonPress}
        >
          <Text style={styles.versionButtonText}>
            {selectedVersion.shortName}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showBookModal} animationType="slide">
        <View style={[styles.modalContainer, colorScheme === 'dark' && styles.modalContainerDark]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Book</Text>
            <TouchableOpacity onPress={() => setShowBookModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {renderBookList(oldTestament, 'Old Testament')}
            {renderBookList(newTestament, 'New Testament')}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showChapterModal} animationType="slide">
        <View style={[styles.modalContainer, colorScheme === 'dark' && styles.modalContainerDark]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Chapter</Text>
            <TouchableOpacity onPress={() => setShowChapterModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.chapterGrid}>
              {Array.from({ length: localCurrentBook?.numberOfChapters || 50 }, (_, i) => i + 1).map(
                (chapter) => (
                  <TouchableOpacity
                    key={chapter}
                    style={[
                      styles.chapterItem,
                      localChapterNum === chapter && styles.chapterItemSelected,
                    ]}
                    onPress={() => handleChapterSelect(chapter)}
                  >
                    <Text
                      style={[
                        styles.chapterItemText,
                        localChapterNum === chapter && styles.chapterItemTextSelected,
                      ]}
                    >
                      {chapter}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showVersionModal} animationType="slide">
        <View style={[styles.modalContainer, colorScheme === 'dark' && styles.modalContainerDark]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Translation</Text>
            <TouchableOpacity onPress={() => setShowVersionModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {versions.map((version) => (
              <TouchableOpacity
                key={version.id}
                style={[
                  styles.versionItem,
                  selectedVersion.id === version.id && styles.versionItemSelected,
                ]}
                onPress={() => handleVersionSelect(version.id)}
              >
                <Text
                  style={[
                    styles.versionItemText,
                    selectedVersion.id === version.id && styles.versionItemTextSelected,
                  ]}
                >
                  {version.name}
                </Text>
                {version.isDownloaded && (
                  <Text style={styles.downloadedBadge}>✓ Downloaded</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  selectBookButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectBookText: {
    fontSize: 18,
    color: '#304080',
    fontWeight: '600',
  },
  chapterContent: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#304080',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verseNumber: {
    width: 30,
    fontSize: 12,
    color: '#304080',
    fontWeight: '600',
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
  },
  lineBreak: {
    height: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  bookButton: {
    flex: 2,
    backgroundColor: '#304080',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chapterButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#304080',
  },
  chapterButtonText: {
    color: '#304080',
    fontSize: 14,
    fontWeight: '600',
  },
  versionButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
  },
  versionButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainerDark: {
    backgroundColor: '#1a1a1a',
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
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
  },
  bookSection: {
    padding: 16,
  },
  bookSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#304080',
    marginBottom: 12,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bookItem: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  bookItemSelected: {
    backgroundColor: '#304080',
  },
  bookItemText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  bookItemTextSelected: {
    color: '#fff',
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  chapterItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  chapterItemSelected: {
    backgroundColor: '#304080',
  },
  chapterItemText: {
    fontSize: 16,
    color: '#333',
  },
  chapterItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  versionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionItemSelected: {
    backgroundColor: '#f0f4f8',
  },
  versionItemText: {
    fontSize: 16,
    color: '#333',
  },
  versionItemTextSelected: {
    color: '#304080',
    fontWeight: '600',
  },
  downloadedBadge: {
    fontSize: 12,
    color: '#304080',
  },
});
