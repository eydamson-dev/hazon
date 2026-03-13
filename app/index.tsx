import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { YStack, XStack, Spinner } from 'tamagui';
import { useBible } from '../src/store/BibleContext';
import { useTheme } from '../src/store/ThemeContext';
import type { Book } from '../src/types/bible';

const PRIMARY_COLOR = '#304080';

export default function BibleScreen() {
  const { isDark } = useTheme();
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
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [localCurrentBook, setLocalCurrentBook] = useState<Book | null>(null);
  const [localChapterNum, setLocalChapterNum] = useState(1);
  const [localCurrentVerse, setLocalCurrentVerse] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const versePositionsRef = useRef<{ [key: number]: number }>({});

  useEffect(() => {
    if (currentBook) {
      setLocalCurrentBook(currentBook);
    }
  }, [currentBook]);

  useEffect(() => {
    setLocalChapterNum(currentChapterNum);
  }, [currentChapterNum]);

  useEffect(() => {
    setLocalCurrentVerse(1);
    versePositionsRef.current = {};
  }, [localChapterNum]);

  const handleVerseSelect = (verse: number) => {
    setLocalCurrentVerse(verse);
    setShowVerseModal(false);
    setTimeout(() => {
      const yPosition = versePositionsRef.current[verse];
      if (yPosition && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: yPosition, animated: true });
      }
    }, 100);
  };

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

  const styles = createStyles(isDark);

  const renderBookList = (bookList: Book[], title: string) => (
    <YStack padding="$4">
      <Text style={styles.bookSectionTitle}>{title}</Text>
      <XStack flexWrap="wrap" gap="$2">
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
      </XStack>
    </YStack>
  );

  if (isLoading && books.length === 0) {
    return (
      <View style={styles.container}>
        <Spinner size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading Bible...</Text>
      </View>
    );
  }

  if (!localCurrentBook) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.selectBookButton}
            onPress={() => setShowBookModal(true)}
          >
            <Text style={styles.selectBookButtonText}>Select a Book</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.versionButtonBottom}
            onPress={() => setShowVersionModal(true)}
          >
            <Text style={styles.bottomButtonText}>{selectedVersion.shortName}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showBookModal} animationType="slide">
          <View style={styles.modalContainer}>
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
          <View style={styles.modalContainer}>
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
        <View style={styles.loaderContainer}>
          <Spinner size="large" color={PRIMARY_COLOR} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : currentChapter ? (
        <ScrollView 
          style={styles.chapterContent}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            const yPosition = versePositionsRef.current[localCurrentVerse];
            if (yPosition && scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ y: yPosition, animated: false });
            }
          }}
        >
          {currentChapter.chapter.content.map((item, index) => {
            if (item.type === 'heading') {
              return (
                <Text key={index} style={styles.heading}>
                  {item.content?.join(' ')}
                </Text>
              );
            }
            if (item.type === 'verse') {
              const verseNum = item.number || 0;
              return (
                <View 
                  key={index}
                  style={[
                    styles.verse,
                    localCurrentVerse === verseNum && styles.verseHighlight,
                  ]}
                  onLayout={(e) => {
                    versePositionsRef.current[verseNum] = e.nativeEvent.layout.y;
                  }}
                >
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
          style={[styles.bottomButton, { flex: 2 }]}
          onPress={() => setShowBookModal(true)}
        >
          <Text style={styles.bottomButtonText} numberOfLines={1}>
            {localCurrentBook?.commonName || 'Book'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bottomButton, { flex: 1 }]}
          onPress={() => setShowChapterModal(true)}
        >
          <Text style={styles.bottomButtonText}>
            Ch. {localChapterNum}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bottomButton, { minWidth: 50 }]}
          onPress={() => setShowVerseModal(true)}
        >
          <Text style={styles.bottomButtonText}>
            v. {localCurrentVerse}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bottomButton, { minWidth: 70 }]}
          onPress={() => setShowVersionModal(true)}
        >
          <Text style={styles.bottomButtonText} numberOfLines={1}>
            {selectedVersion.shortName}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showBookModal} animationType="slide">
        <View style={styles.modalContainer}>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Chapter</Text>
            <TouchableOpacity onPress={() => setShowChapterModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <XStack flexWrap="wrap" padding="$4" gap="$2">
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
            </XStack>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showVerseModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Verse</Text>
            <TouchableOpacity onPress={() => setShowVerseModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <XStack flexWrap="wrap" padding="$4" gap="$2">
              {Array.from({ length: currentChapter?.chapter?.content?.filter((item) => item.type === 'verse').length || 30 }, (_, i) => i + 1).map(
                (verse) => (
                  <TouchableOpacity
                    key={verse}
                    style={[
                      styles.chapterItem,
                      localCurrentVerse === verse && styles.chapterItemSelected,
                    ]}
                    onPress={() => handleVerseSelect(verse)}
                  >
                    <Text
                      style={[
                        styles.chapterItemText,
                        localCurrentVerse === verse && styles.chapterItemTextSelected,
                      ]}
                    >
                      {verse}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </XStack>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showVersionModal} animationType="slide">
        <View style={styles.modalContainer}>
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

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: isDark ? '#888' : '#666',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  chapterContent: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  verseNumber: {
    width: 30,
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: isDark ? '#ddd' : '#333',
  },
  verseHighlight: {
    backgroundColor: isDark ? '#1a2a4a' : '#e8f0ff',
  },
  lineBreak: {
    height: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#333' : '#e0e0e0',
    gap: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#333',
  },
  closeButton: {
    fontSize: 24,
    color: isDark ? '#999' : '#666',
    padding: 4,
  },
  modalContent: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  bookSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 12,
  },
  bookItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  bookItemSelected: {
    backgroundColor: PRIMARY_COLOR,
  },
  bookItemText: {
    fontSize: 14,
    color: isDark ? '#ddd' : '#333',
    textAlign: 'center',
  },
  bookItemTextSelected: {
    color: '#fff',
  },
  chapterItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
    borderRadius: 8,
  },
  chapterItemSelected: {
    backgroundColor: PRIMARY_COLOR,
  },
  chapterItemText: {
    fontSize: 16,
    color: isDark ? '#ddd' : '#333',
  },
  chapterItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  versionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e1e1e' : 'transparent',
  },
  versionItemSelected: {
    backgroundColor: isDark ? '#1a2a4a' : '#f0f4ff',
  },
  versionItemText: {
    fontSize: 16,
    color: isDark ? '#ddd' : '#333',
  },
  versionItemTextSelected: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  downloadedBadge: {
    fontSize: 12,
    color: PRIMARY_COLOR,
  },
  bottomButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  selectBookButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  selectBookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  versionButtonBottom: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
