import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useBible } from '../src/store/BibleContext';
import { useTheme } from '../src/store/ThemeContext';
import type { Book } from '../src/types/bible';

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
    <View style={[styles.bookSection, isDark && styles.bookSectionDark]}>
      <Text style={[styles.bookSectionTitle, isDark && styles.bookSectionTitleDark]}>{title}</Text>
      <View style={styles.bookGrid}>
        {bookList.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.bookItem,
              isDark && styles.bookItemDark,
              localCurrentBook?.id === book.id && styles.bookItemSelected,
            ]}
            onPress={() => handleBookSelect(book)}
          >
            <Text
              style={[
                styles.bookItemText,
                isDark && styles.bookItemTextDark,
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
      <View style={[styles.container, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#304080" style={styles.loader} />
        <Text style={styles.loadingText}>Loading Bible...</Text>
      </View>
    );
  }

  if (!localCurrentBook) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TouchableOpacity
          style={styles.selectBookButton}
          onPress={handleBookButtonPress}
        >
          <Text style={styles.selectBookText}>Select a Book</Text>
        </TouchableOpacity>

        <View style={[styles.bottomBar, isDark && styles.bottomBarDark]}>
          <TouchableOpacity
            style={[styles.versionButtonSmall, isDark && styles.versionButtonDark]}
            onPress={handleVersionButtonPress}
          >
            <Text style={[styles.versionButtonText, isDark && styles.versionButtonTextDark]}>
              {selectedVersion.shortName}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showBookModal} animationType="slide">
          <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Book</Text>
              <TouchableOpacity onPress={() => setShowBookModal(false)}>
                <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={[styles.modalContent, isDark && styles.modalContentDark]}>
              {renderBookList(oldTestament, 'Old Testament')}
              {renderBookList(newTestament, 'New Testament')}
            </ScrollView>
          </View>
        </Modal>

        <Modal visible={showVersionModal} animationType="slide">
          <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Translation</Text>
              <TouchableOpacity onPress={() => setShowVersionModal(false)}>
                <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={[styles.modalContent, isDark && styles.modalContentDark]}>
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#304080" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : currentChapter ? (
        <ScrollView 
          style={[styles.chapterContent, isDark && styles.chapterContentDark]}
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
                <Text key={index} style={[styles.heading, isDark && styles.headingDark]}>
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
                    localCurrentVerse === verseNum && (isDark ? styles.verseHighlightDark : styles.verseHighlight)
                  ]}
                  onLayout={(e) => {
                    versePositionsRef.current[verseNum] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={[styles.verseNumber, isDark && styles.verseNumberDark]}>{item.number}</Text>
                  <Text style={[styles.verseText, isDark && styles.verseTextDark]}>
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

      <View style={[styles.bottomBar, isDark && styles.bottomBarDark]}>
        <TouchableOpacity
          style={[styles.bookButtonSmall, isDark && styles.bookButtonDark]}
          onPress={handleBookButtonPress}
        >
          <Text style={[styles.bookButtonTextSmall, isDark && styles.bookButtonTextDark]} numberOfLines={1}>
            {localCurrentBook?.commonName || 'Book'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.chapterButtonSmall, isDark && styles.chapterButtonDark]}
          onPress={handleChapterButtonPress}
        >
          <Text style={[styles.chapterButtonTextSmall, isDark && styles.chapterButtonTextDark]}>
            Ch. {localChapterNum}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.verseButton, isDark && styles.verseButtonDark]}
          onPress={() => setShowVerseModal(true)}
        >
          <Text style={[styles.verseButtonText, isDark && styles.verseButtonTextDark]}>
            v. {localCurrentVerse}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.versionButtonSmall, isDark && styles.versionButtonDark]}
          onPress={handleVersionButtonPress}
        >
          <Text style={[styles.versionButtonText, isDark && styles.versionButtonTextDark]}>
            {selectedVersion.shortName}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showBookModal} animationType="slide">
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Book</Text>
            <TouchableOpacity onPress={() => setShowBookModal(false)}>
              <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={[styles.modalContent, isDark && styles.modalContentDark]}>
            {renderBookList(oldTestament, 'Old Testament')}
            {renderBookList(newTestament, 'New Testament')}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showChapterModal} animationType="slide">
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Chapter</Text>
            <TouchableOpacity onPress={() => setShowChapterModal(false)}>
              <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={[styles.chapterGrid, isDark && styles.chapterGridDark]}>
              {Array.from({ length: localCurrentBook?.numberOfChapters || 50 }, (_, i) => i + 1).map(
                (chapter) => (
                  <TouchableOpacity
                    key={chapter}
                    style={[
                      styles.chapterItem,
                      isDark && styles.chapterItemDark,
                      localChapterNum === chapter && styles.chapterItemSelected,
                    ]}
                    onPress={() => handleChapterSelect(chapter)}
                  >
                    <Text
                      style={[
                        styles.chapterItemText,
                        isDark && styles.chapterItemTextDark,
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

      <Modal visible={showVerseModal} animationType="slide">
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Verse</Text>
            <TouchableOpacity onPress={() => setShowVerseModal(false)}>
              <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={[styles.chapterGrid, isDark && styles.chapterGridDark]}>
              {Array.from({ length: currentChapter?.chapter?.content?.filter((item) => item.type === 'verse').length || 30 }, (_, i) => i + 1).map(
                (verse) => (
                  <TouchableOpacity
                    key={verse}
                    style={[
                      styles.chapterItem,
                      isDark && styles.chapterItemDark,
                      localCurrentVerse === verse && styles.chapterItemSelected,
                    ]}
                    onPress={() => handleVerseSelect(verse)}
                  >
                    <Text
                      style={[
                        styles.chapterItemText,
                        isDark && styles.chapterItemTextDark,
                        localCurrentVerse === verse && styles.chapterItemTextSelected,
                      ]}
                    >
                      {verse}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showVersionModal} animationType="slide">
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Translation</Text>
            <TouchableOpacity onPress={() => setShowVersionModal(false)}>
              <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={[styles.modalContent, isDark && styles.modalContentDark]}>
            {versions.map((version) => (
              <TouchableOpacity
                key={version.id}
                style={[
                  styles.versionItem,
                  isDark && styles.versionItemDark,
                  selectedVersion.id === version.id && styles.versionItemSelected,
                ]}
                onPress={() => handleVersionSelect(version.id)}
              >
                <Text
                  style={[
                    styles.versionItemText,
                    isDark && styles.versionItemTextDark,
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
  containerDark: {
    backgroundColor: '#121212',
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
  chapterContentDark: {
    backgroundColor: '#121212',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#304080',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  headingDark: {
    color: '#6B8FE8',
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
  verseTextDark: {
    color: '#ddd',
  },
  verseHighlight: {
    backgroundColor: '#e8f0ff',
    borderRadius: 4,
  },
  verseHighlightDark: {
    backgroundColor: '#1a2a4a',
    borderRadius: 4,
  },
  verseNumberDark: {
    color: '#6B8FE8',
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
    gap: 6,
  },
  bottomBarDark: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  bookButtonSmall: {
    flex: 2,
    backgroundColor: '#304080',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookButtonDark: {
    backgroundColor: '#304080',
  },
  bookButtonTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookButtonTextDark: {
    color: '#fff',
  },
  verseButton: {
    width: 44,
    backgroundColor: '#304080',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  verseButtonDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#444',
  },
  verseButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verseButtonTextDark: {
    color: '#ddd',
  },
  chapterButtonSmall: {
    flex: 1,
    backgroundColor: '#304080',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  chapterButtonDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#444',
  },
  chapterButtonTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chapterButtonTextDark: {
    color: '#ddd',
  },
  versionButtonSmall: {
    width: 50,
    backgroundColor: '#304080',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  versionButtonDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#444',
  },
  versionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  versionButtonTextDark: {
    color: '#ddd',
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
    backgroundColor: '#fff',
  },
  modalHeaderDark: {
    borderBottomColor: '#333',
    backgroundColor: '#1e1e1e',
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
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  closeButtonDark: {
    color: '#999',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContentDark: {
    backgroundColor: '#121212',
  },
  bookSection: {
    padding: 16,
  },
  bookSectionDark: {
    backgroundColor: '#121212',
  },
  bookSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#304080',
    marginBottom: 12,
  },
  bookSectionTitleDark: {
    color: '#6B8FE8',
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
  bookItemDark: {
    backgroundColor: '#2a2a2a',
  },
  bookItemSelected: {
    backgroundColor: '#304080',
  },
  bookItemText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  bookItemTextDark: {
    color: '#ddd',
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
  chapterGridDark: {
    backgroundColor: '#121212',
  },
  chapterItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  chapterItemDark: {
    backgroundColor: '#2a2a2a',
  },
  chapterItemSelected: {
    backgroundColor: '#304080',
  },
  chapterItemText: {
    fontSize: 16,
    color: '#333',
  },
  chapterItemTextDark: {
    color: '#ddd',
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
  versionItemDark: {
    borderBottomColor: '#333',
    backgroundColor: '#1e1e1e',
  },
  versionItemSelected: {
    backgroundColor: '#f0f4f8',
  },
  versionItemText: {
    fontSize: 16,
    color: '#333',
  },
  versionItemTextDark: {
    color: '#ddd',
  },
  versionItemTextSelected: {
    color: '#304080',
    fontWeight: '600',
  },
  downloadedBadge: {
    fontSize: 12,
    color: '#304080',
  },
  downloadedBadgeDark: {
    color: '#6B8FE8',
  },
});
