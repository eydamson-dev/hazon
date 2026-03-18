import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, Share, Alert, Clipboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '../src/store/BibleContext';
import { useTheme } from '../src/store/ThemeContext';
import { useDevotional } from '../src/store/DevotionalContext';
import { getHighlights, saveHighlights, getTabs, saveTabs, type HighlightData, type TabData, type Note } from '../src/services/theme';
import CreateDevotionModal from '../src/components/CreateDevotionModal';
import BookSelector from '../src/components/BookSelector';
import ChapterSelector from '../src/components/ChapterSelector';
import VerseSelector from '../src/components/VerseSelector';
import { getBebliaChapter } from '../src/services/bible';
import type { Book, Chapter, VerseContent } from '../src/types/bible';

const PRIMARY_COLOR = '#304080';

type Tab = {
  id: string;
  book: Book;
  chapterNum: number;
  currentVerse: number;
  selectedVerses: Set<number>;
};

type HighlightKey = string;

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFF59D' },
  { name: 'Green', value: '#A5D6A7' },
  { name: 'Blue', value: '#90CAF9' },
  { name: 'Pink', value: '#F48FB1' },
  { name: 'Orange', value: '#FFCC80' },
  { name: 'Purple', value: '#CE93D8' },
];

export default function BibleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookId?: string; chapter?: string; verse?: string }>();
  const { isDark, fontSizeValue } = useTheme();
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
    notes,
    getNotesForVerse,
    updateNote,
  } = useBible();

  const { createDevotion } = useDevotional();

  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showCreateDevotionModal, setShowCreateDevotionModal] = useState(false);
  const [isAddingNewTab, setIsAddingNewTab] = useState(false);
  const [localCurrentBook, setLocalCurrentBook] = useState<Book | null>(null);
  const [localChapterNum, setLocalChapterNum] = useState(1);
  const [localCurrentVerse, setLocalCurrentVerse] = useState(1);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [highlightedVersesMap, setHighlightedVersesMap] = useState<Map<HighlightKey, Map<number, string>>>(new Map());
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareChapters, setCompareChapters] = useState<{ version: typeof versions[0]; chapter: Chapter | null }[]>([]);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  const [notePreviewVerse, setNotePreviewVerse] = useState<number | null>(null);
  const [notePreviewNotes, setNotePreviewNotes] = useState<Note[]>([]);
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [noteSelectorVerse, setNoteSelectorVerse] = useState<number | null>(null);
  const [showAddToNoteModal, setShowAddToNoteModal] = useState(false);
  const [pendingVerseRefs, setPendingVerseRefs] = useState<string[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const chapterScrollRef = useRef<ScrollView>(null);
  const versePositionsRef = useRef<{ [key: number]: number }>({});
  const isInitialized = useRef(false);

  useEffect(() => {
    const loadHighlights = async () => {
      const savedHighlights = await getHighlights();
      const map = new Map<HighlightKey, Map<number, string>>();
      for (const [key, verses] of Object.entries(savedHighlights)) {
        const verseMap = new Map<number, string>();
        for (const [verseNum, color] of Object.entries(verses)) {
          verseMap.set(parseInt(verseNum), color);
        }
        map.set(key, verseMap);
      }
      setHighlightedVersesMap(map);
      isInitialized.current = true;
    };
    loadHighlights();
  }, []);

  useEffect(() => {
    if (params.bookId && params.chapter && books.length > 0) {
      const book = books.find(b => b.id === params.bookId);
      if (book) {
        const chapterNum = parseInt(params.chapter, 10);
        const verseNum = params.verse ? parseInt(params.verse, 10) : 1;
        
        setLocalCurrentBook(book);
        setLocalCurrentVerse(verseNum);
        setLocalChapterNum(chapterNum);
        setCurrentBook(book);
        setCurrentChapterNum(chapterNum);
        
        setTabs(prev => {
          if (prev.length === 0) {
            const newTab: Tab = {
              id: `${book.id}-${chapterNum}`,
              book,
              chapterNum,
              currentVerse: verseNum,
              selectedVerses: new Set(),
            };
            return [newTab];
          }
          return prev.map(t => ({
            ...t,
            book,
            chapterNum,
            currentVerse: verseNum,
          }));
        });
        
        loadChapter(book.id, chapterNum);
      }
    }
  }, [params.bookId, params.chapter, params.verse, books]);

  useEffect(() => {
    const loadTabs = async () => {
      if (books.length === 0) return;

      const { tabs: savedTabs, activeTabId: savedActiveTabId } = await getTabs();

      if (savedTabs.length > 0) {
        const restoredTabs: Tab[] = savedTabs.map(tabData => {
          const book = books.find(b => b.id === tabData.bookId);
          return {
            id: tabData.id,
            book: book || books[0],
            chapterNum: tabData.chapterNum,
            currentVerse: tabData.currentVerse,
            selectedVerses: new Set(),
          };
        });
        setTabs(restoredTabs);
        setActiveTabId(savedActiveTabId);

        const activeTab = restoredTabs.find(t => t.id === savedActiveTabId) || restoredTabs[0];
        setLocalCurrentBook(activeTab.book);
        setLocalChapterNum(activeTab.chapterNum);
        setLocalCurrentVerse(activeTab.currentVerse);
        tabsInitialized.current = true;
        loadChapter(activeTab.book.id, activeTab.chapterNum);
      } else if (currentBook) {
        const defaultTab: Tab = {
          id: `${currentBook.id}-1`,
          book: currentBook,
          chapterNum: 1,
          currentVerse: 1,
          selectedVerses: new Set(),
        };
        setTabs([defaultTab]);
        setActiveTabId(defaultTab.id);
        tabsInitialized.current = true;
        const tabData: TabData[] = [{
          id: defaultTab.id,
          bookId: defaultTab.book.id,
          bookName: defaultTab.book.commonName,
          chapterNum: defaultTab.chapterNum,
          currentVerse: defaultTab.currentVerse,
        }];
        saveTabs(tabData, defaultTab.id);
      }
    };

    if (currentBook && isInitialized.current) {
      loadTabs();
    }
  }, [books, currentBook?.id]);

  const getHighlightKey = (): HighlightKey => {
    return `${localCurrentBook?.id || ''}-${localChapterNum}`;
  };

  const getCurrentHighlights = (): Map<number, string> => {
    return highlightedVersesMap.get(getHighlightKey()) || new Map();
  };

  const setCurrentHighlights = (highlights: Map<number, string>) => {
    setHighlightedVersesMap((prev) => {
      const newMap = new Map(prev);
      if (highlights.size > 0) {
        newMap.set(getHighlightKey(), highlights);
      } else {
        newMap.delete(getHighlightKey());
      }

      if (isInitialized.current) {
        const data: HighlightData = {};
        for (const [key, verseMap] of newMap) {
          data[key] = Object.fromEntries(verseMap);
        }
        saveHighlights(data);
      }

      return newMap;
    });
  };

  const [highlightedVerses, setHighlightedVerses] = useState<Map<number, string>>(new Map());
  const tabsInitialized = useRef(false);

  const openInNewTab = (book: Book, chapterNum: number) => {
    const tabId = `${book.id}-${chapterNum}`;
    const existingTab = tabs.find(t => t.id === tabId);

    if (existingTab) {
      setActiveTabId(tabId);
    } else {
      const newTab: Tab = {
        id: tabId,
        book,
        chapterNum,
        currentVerse: 1,
        selectedVerses: new Set(),
      };
      setTabs(prev => {
        const newTabs = [...prev, newTab];
        const tabData: TabData[] = newTabs.map(t => ({
          id: t.id,
          bookId: t.book.id,
          bookName: t.book.commonName,
          chapterNum: t.chapterNum,
          currentVerse: t.currentVerse,
        }));
        saveTabs(tabData, tabId);
        return newTabs;
      });
      setActiveTabId(tabId);
      loadChapter(book.id, chapterNum);
    }
    setShowBookModal(false);
    setShowChapterModal(false);
  };

  const closeTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      const newActiveId = newTabs.length > 0 ? newTabs[Math.max(0, tabIndex - 1)]?.id || null : null;
      const tabData: TabData[] = newTabs.map(t => ({
        id: t.id,
        bookId: t.book.id,
        bookName: t.book.commonName,
        chapterNum: t.chapterNum,
        currentVerse: t.currentVerse,
      }));
      saveTabs(tabData, newActiveId);
      return newTabs;
    });

    if (activeTabId === tabId) {
      if (tabs.length > 1) {
        const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        const newActiveTab = tabs.filter(t => t.id !== tabId)[newIndex];
        if (newActiveTab) {
          setActiveTabId(newActiveTab.id);
          setLocalCurrentBook(newActiveTab.book);
          setLocalChapterNum(newActiveTab.chapterNum);
          setLocalCurrentVerse(newActiveTab.currentVerse);
          setSelectedVerses(newActiveTab.selectedVerses);
          loadChapter(newActiveTab.book.id, newActiveTab.chapterNum);
        }
      } else {
        setActiveTabId(null);
        setLocalCurrentBook(null);
        setLocalChapterNum(1);
        setLocalCurrentVerse(1);
        setSelectedVerses(new Set());
      }
    }
  };

  const switchToTab = (tab: Tab) => {
    setActiveTabId(tab.id);
    setLocalCurrentBook(tab.book);
    setLocalChapterNum(tab.chapterNum);
    setLocalCurrentVerse(tab.currentVerse);
    setSelectedVerses(tab.selectedVerses);

    const tabData: TabData[] = tabs.map(t => ({
      id: t.id,
      bookId: t.book.id,
      bookName: t.book.commonName,
      chapterNum: t.chapterNum,
      currentVerse: t.currentVerse,
    }));
    saveTabs(tabData, tab.id);

    loadChapter(tab.book.id, tab.chapterNum);
  };

  useEffect(() => {
    if (currentBook) {
      setLocalCurrentBook(currentBook);
    }
  }, [currentBook]);

  useEffect(() => {
    setLocalChapterNum(currentChapterNum);
  }, [currentChapterNum]);

  useEffect(() => {
    if (!tabsInitialized.current) return;

    if (localCurrentBook) {
      setHighlightedVerses(getCurrentHighlights());
    }
    setLocalCurrentVerse(1);
    versePositionsRef.current = {};
    setSelectedVerses(new Set());
  }, [localChapterNum, localCurrentBook?.id]);

  useEffect(() => {
    if (tabsInitialized.current && localChapterNum && chapterScrollRef.current) {
      setTimeout(() => {
        const chapterWidth = 60;
        const scrollX = (localChapterNum - 3) * chapterWidth;
        chapterScrollRef.current?.scrollTo({ x: Math.max(0, scrollX), animated: false });
      }, 100);
    }
  }, [localChapterNum, localCurrentBook?.id]);

  const applyHighlight = (color: string) => {
    const newHighlighted = new Map(getCurrentHighlights());
    for (const verseNum of selectedVerses) {
      newHighlighted.set(verseNum, color);
    }
    setCurrentHighlights(newHighlighted);
    setHighlightedVerses(newHighlighted);
    setSelectedVerses(new Set());
  };

  const removeHighlight = (verseNum: number) => {
    const newHighlighted = new Map(getCurrentHighlights());
    newHighlighted.delete(verseNum);
    setCurrentHighlights(newHighlighted);
    setHighlightedVerses(newHighlighted);
  };

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(verseNum)) {
        newSet.delete(verseNum);
      } else {
        newSet.add(verseNum);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedVerses(new Set());
  };

  const getVerseRangeString = (): string => {
    if (selectedVerses.size === 0) return '';
    const sorted = Array.from(selectedVerses).sort((a, b) => a - b);
    if (sorted.length === 1) return `v${sorted[0]}`;

    let range = '';
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      const curr = sorted[i];
      if (curr !== prev + 1 || i === sorted.length) {
        if (range) range += ', ';
        range += start === prev ? `${start}` : `${start}-${prev}`;
        start = curr;
      }
      prev = curr;
    }
    return `v${range}`;
  };

  const getSelectedVersesText = (): string => {
    if (!currentChapter || selectedVerses.size === 0) return '';

    const sortedVerses = Array.from(selectedVerses).sort((a, b) => a - b);
    const verses: string[] = [];

    for (const verseNum of sortedVerses) {
      const verseItem = currentChapter.chapter.content.find(
        (item) => item.type === 'verse' && item.number === verseNum
      );
      if (verseItem) {
        verses.push(`${verseNum}. ${renderVerseContent(verseItem.content || [])}`);
      }
    }

    const bookName = localCurrentBook?.commonName || '';
    return `${bookName} ${localChapterNum}:${sortedVerses.join(',')}\n\n${verses.join('\n\n')}`;
  };

  const handleCopy = () => {
    const text = getSelectedVersesText();
    if (text) {
      Clipboard.setString(text);
      Alert.alert('Copied', 'Verses copied to clipboard');
      clearSelection();
    }
  };

  const handleShare = async () => {
    const text = getSelectedVersesText();
    if (text) {
      try {
        await Share.share({
          message: text,
        });
        clearSelection();
      } catch (error) {
        console.log('Share error:', error);
      }
    }
  };

  const handleCompare = async () => {
    setIsLoadingCompare(true);
    setShowCompareModal(true);

    const sortedVerses = Array.from(selectedVerses).sort((a, b) => a - b);
    const results: { version: typeof versions[0]; chapter: Chapter | null }[] = [];

    for (const version of versions) {
      if (!version.isDownloaded) continue;
      try {
        const bookNumber = parseInt(localCurrentBook!.id.replace('xml_', ''));
        const chapter = await getBebliaChapter(version.id, bookNumber, localChapterNum);
        results.push({ version, chapter });
      } catch (error) {
        results.push({ version, chapter: null });
      }
    }

    setCompareChapters(results);
    setIsLoadingCompare(false);
  };

  const getVerseRef = (verseNum: number): string => {
    if (!localCurrentBook) return '';
    const bookNumber = parseInt(localCurrentBook.id.replace('xml_', ''));
    return `${localCurrentBook.id}_${localChapterNum}_${verseNum}`;
  };

  const handleNotePress = (verseNum: number) => {
    const verseRef = getVerseRef(verseNum);
    const verseNotes = getNotesForVerse(verseRef);
    
    if (verseNotes.length === 0) {
      router.push(`/note?verseRefs=${JSON.stringify([verseRef])}`);
    } else if (verseNotes.length === 1) {
      router.push(`/note?noteId=${verseNotes[0].id}`);
    } else {
      setNoteSelectorVerse(verseNum);
      setShowNoteSelector(true);
    }
  };

  const handleNoteLongPress = (verseNum: number) => {
    const verseRef = getVerseRef(verseNum);
    const verseNotes = getNotesForVerse(verseRef);
    setNotePreviewNotes(verseNotes);
    setNotePreviewVerse(verseNum);
  };

  const closeNotePreview = () => {
    setNotePreviewVerse(null);
    setNotePreviewNotes([]);
  };

  const handleNoteSelectorSelect = (noteId: string) => {
    setShowNoteSelector(false);
    router.push(`/note?noteId=${noteId}`);
  };

  const handleAddNoteFromSelection = () => {
    const verseRefs = Array.from(selectedVerses).map(v => getVerseRef(v));
    setPendingVerseRefs(verseRefs);
    setShowAddToNoteModal(true);
  };

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
    if (tabs.length === 0 || isAddingNewTab) {
      openInNewTab(book, 1);
      setIsAddingNewTab(false);
    } else {
      setLocalCurrentBook(book);
      setLocalChapterNum(1);
      setCurrentBook(book);
      setCurrentChapterNum(1);
      setSelectedVerses(new Set<number>());

      setTabs(prev => {
        const newTabs = prev.map(t =>
          t.id === activeTabId
            ? { ...t, book, chapterNum: 1, currentVerse: 1, selectedVerses: new Set<number>() }
            : t
        );
        const tabData: TabData[] = newTabs.map(t => ({
          id: t.id,
          bookId: t.book.id,
          bookName: t.book.commonName,
          chapterNum: t.chapterNum,
          currentVerse: t.currentVerse,
        }));
        saveTabs(tabData, activeTabId);
        return newTabs;
      });

      loadChapter(book.id, 1);
    }
    setShowBookModal(false);
    setIsAddingNewTab(false);
  };

  const handleChapterSelect = (chapter: number) => {
    setLocalChapterNum(chapter);
    setCurrentChapterNum(chapter);
    setSelectedVerses(new Set<number>());

    setTabs(prev => {
      const newTabs = prev.map(t =>
        t.id === activeTabId
          ? { ...t, chapterNum: chapter, selectedVerses: new Set<number>() }
          : t
      );
      const tabData: TabData[] = newTabs.map(t => ({
        id: t.id,
        bookId: t.book.id,
        bookName: t.book.commonName,
        chapterNum: t.chapterNum,
        currentVerse: t.currentVerse,
      }));
      saveTabs(tabData, activeTabId);
      return newTabs;
    });
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

  const renderVerseContent = (content: VerseContent['content']): string => {
    if (!content) return '';
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && 'text' in item && typeof item.text === 'string') return item.text;
        return '';
      })
      .join(' ');
  };

  const oldTestament = books.filter((b) => b.order <= 39);
  const newTestament = books.filter((b) => b.order > 39);

  const styles = createStyles(isDark, fontSizeValue);

  const renderBookList = (bookList: Book[], title: string) => (
    <View style={{ padding: 16 }}>
      <Text style={styles.bookSectionTitle}>{title}</Text>
      <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 8 }}>
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

  const hasDownloadedTranslation = versions.length > 0;

  if (!hasDownloadedTranslation) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.emptyTitle}>No Translations Downloaded</Text>
          <Text style={styles.emptySubtitle}>
            Download a Bible translation to get started
          </Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.downloadButtonText}>Download Translations</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading && books.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
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
      {tabs.length > 0 && (
        <View style={[styles.tabBar, isDark && styles.tabBarDark]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTabId === tab.id && styles.tabActive,
                  ]}
                  onPress={() => switchToTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTabId === tab.id && styles.tabTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.book.commonName} {tab.chapterNum}
                  </Text>
                  <TouchableOpacity
                    style={styles.tabClose}
                    onPress={() => closeTab(tab.id)}
                  >
                    <Text style={styles.tabCloseText}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setIsSearchMode(!isSearchMode)}
          >
            <Ionicons name="search" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addTabButton}
            onPress={() => {
              setIsAddingNewTab(true);
              setShowBookModal(true);
            }}
          >
            <Text style={styles.addTabButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
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
              const isSelected = selectedVerses.has(verseNum);
              const highlightColor = highlightedVerses.get(verseNum);
              const verseRef = getVerseRef(verseNum);
              const verseNotes = getNotesForVerse(verseRef);
              const hasNotes = verseNotes.length > 0;

              return (
                <View key={index} style={styles.verseWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.verse,
                      localCurrentVerse === verseNum && styles.verseHighlight,
                      isSelected && styles.verseSelected,
                      highlightColor && { backgroundColor: highlightColor },
                    ]}
                    onLongPress={() => toggleVerseSelection(verseNum)}
                    onPress={() => {
                      if (selectedVerses.size > 0) {
                        toggleVerseSelection(verseNum);
                      } else {
                        setLocalCurrentVerse(verseNum);
                      }
                    }}
                    onLayout={(e) => {
                      versePositionsRef.current[verseNum] = e.nativeEvent.layout.y;
                    }}
                  >
                    <Text style={[styles.verseNumber, isSelected && styles.verseNumberSelected]}>{item.number}</Text>
                    <Text style={[styles.verseText, isSelected && styles.verseTextSelected]}>
                      {renderVerseContent(item.content || [])}
                    </Text>
                  </TouchableOpacity>
                  {hasNotes && (
                    <TouchableOpacity
                      style={styles.noteIcon}
                      onPress={() => handleNotePress(verseNum)}
                      onLongPress={() => handleNoteLongPress(verseNum)}
                    >
                      <View style={styles.noteIconContainer}>
                        <Ionicons name="document-text" size={16} color="#fff" />
                        {verseNotes.length > 1 && (
                          <View style={styles.noteCountBadge}>
                            <Text style={styles.noteCountText}>{verseNotes.length}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
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

      {selectedVerses.size > 0 && (
        <>
          {/* Verse range above the context menu */}
          <View style={[styles.verseRangeAbove, isDark && styles.verseRangeAboveDark]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.verseRangeScroll}>
              <Text style={styles.verseRangeText}>{getVerseRangeString()}</Text>
            </ScrollView>
          </View>
          <View style={[styles.selectionToolbar, isDark && styles.selectionToolbarDark]}>
            <TouchableOpacity style={styles.toolbarButton} onPress={handleCopy}>
              <Text style={styles.toolbarButtonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={handleShare}>
              <Text style={styles.toolbarButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={handleCompare}>
              <Text style={styles.toolbarButtonText}>Compare</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={() => setShowCreateDevotionModal(true)}>
              <Text style={styles.toolbarButtonText}>Devotion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={handleAddNoteFromSelection}>
              <Text style={styles.toolbarButtonText}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarIconButton} onPress={clearSelection}>
              <Ionicons name="close-circle-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
          <View style={[styles.colorPickerBar, isDark && styles.colorPickerBarDark]}>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
              {HIGHLIGHT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[styles.colorButton, { backgroundColor: color.value }]}
                  onPress={() => applyHighlight(color.value)}
                />
              ))}
              <TouchableOpacity
                style={[styles.colorButton, styles.noHighlightButton]}
                onPress={() => applyHighlight('transparent')}
              >
                <Text style={styles.noHighlightText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {localCurrentBook && (
        <View style={styles.chapterScrollContainer}>
          <ScrollView
            ref={chapterScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chapterScrollContent}
          >
            {Array.from({ length: localCurrentBook.numberOfChapters || 50 }, (_, i) => i + 1).map((chapter) => (
              <TouchableOpacity
                key={chapter}
                style={[
                  styles.chapterButton,
                  localChapterNum === chapter && styles.chapterButtonActive,
                ]}
                onPress={() => handleChapterSelect(chapter)}
              >
                <Text
                  style={[
                    styles.chapterButtonText,
                    localChapterNum === chapter && styles.chapterButtonTextActive,
                  ]}
                >
                  {chapter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomButton, { flex: 1 }]}
          onPress={() => setShowBookModal(true)}
        >
          <Text style={styles.bottomButtonText} numberOfLines={1}>
            {localCurrentBook?.commonName || 'Book'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomButton, { flex: 1 }]}
          onPress={() => setShowVersionModal(true)}
        >
          <Text style={styles.bottomButtonText} numberOfLines={1}>
            {selectedVersion.shortName}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showBookModal} animationType="slide">
        <BookSelector
          books={books}
          selectedBookId={localCurrentBook?.id}
          isDark={isDark}
          onSelect={(book) => {
            setLocalCurrentBook(book);
            setLocalChapterNum(1);
            setShowBookModal(false);
          }}
          onClose={() => setShowBookModal(false)}
        />
      </Modal>

      <Modal visible={showChapterModal} animationType="slide">
        <ChapterSelector
          book={localCurrentBook}
          selectedChapter={localChapterNum}
          isDark={isDark}
          onSelect={(chapter) => handleChapterSelect(chapter)}
          onClose={() => setShowChapterModal(false)}
        />
      </Modal>

      <Modal visible={showVerseModal} animationType="slide">
        <VerseSelector
          totalVerses={currentChapter?.chapter?.content?.filter((item) => item.type === 'verse').length || 30}
          selectedVerse={localCurrentVerse}
          isDark={isDark}
          onSelect={(verse) => handleVerseSelect(verse)}
          onClose={() => setShowVerseModal(false)}
        />
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
            {versions.filter(v => v.isDownloaded).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No translations downloaded yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Go to Settings to download translations
                </Text>
              </View>
            ) : (
              versions
                .filter(v => v.isDownloaded)
                .map((version) => (
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
                      <Text style={styles.downloadedBadge}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.downloadMoreButton}
            onPress={() => {
              setShowVersionModal(false);
              router.push('/settings');
            }}
          >
            <Text style={styles.downloadMoreButtonText}>Download More Translations</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showCompareModal} animationType="slide">
        <View style={[styles.modalContainer, { flex: 1 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {localCurrentBook?.commonName} {localChapterNum}
            </Text>
            <TouchableOpacity onPress={() => setShowCompareModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {isLoadingCompare ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              {compareChapters.map((item, index) => (
                <View key={item.version.id} style={styles.compareSection}>
                  <Text style={styles.compareVersionTitle}>{item.version.name}</Text>
                  {item.chapter ? (
                    item.chapter.chapter.content
                      .filter(c => c.type === 'verse' && selectedVerses.has(c.number || 0))
                      .map((verse) => (
                        <View key={verse.number} style={styles.compareVerse}>
                          <Text style={styles.compareVerseNumber}>{verse.number}</Text>
                          <Text style={styles.compareVerseText}>
                            {verse.content?.map((c) => typeof c === 'string' ? c : ('text' in c ? c.text : '')).join(' ')}
                          </Text>
                        </View>
                      ))
                  ) : (
                    <Text style={styles.compareError}>Failed to load</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Note Preview Bubble */}
      {notePreviewVerse !== null && (
        <TouchableOpacity 
          style={styles.notePreviewOverlay} 
          activeOpacity={1} 
          onPress={closeNotePreview}
        >
          <View style={[styles.notePreviewBubble, isDark && styles.notePreviewBubbleDark]}>
            <View style={styles.notePreviewHeader}>
              <Text style={styles.notePreviewTitle}>
                {notePreviewNotes.length} {notePreviewNotes.length === 1 ? 'Note' : 'Notes'}
              </Text>
              <TouchableOpacity onPress={closeNotePreview}>
                <Ionicons name="close" size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            {notePreviewNotes.map((note) => (
              <TouchableOpacity 
                key={note.id} 
                style={styles.notePreviewItem}
                onPress={() => {
                  closeNotePreview();
                  router.push(`/note?noteId=${note.id}`);
                }}
              >
                <Text style={styles.notePreviewText} numberOfLines={2}>
                  {note.content}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Note Selector Modal (multiple notes) */}
      <Modal visible={showNoteSelector} animationType="slide" transparent>
        <TouchableOpacity 
          style={styles.noteSelectorOverlay} 
          activeOpacity={1} 
          onPress={() => setShowNoteSelector(false)}
        >
          <View style={[styles.noteSelectorContent, isDark && styles.noteSelectorContentDark]}>
            <View style={styles.noteSelectorHeader}>
              <Text style={styles.noteSelectorTitle}>Select Note</Text>
              <TouchableOpacity onPress={() => setShowNoteSelector(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {noteSelectorVerse !== null && getNotesForVerse(getVerseRef(noteSelectorVerse)).map((note) => (
                <TouchableOpacity 
                  key={note.id} 
                  style={styles.noteSelectorItem}
                  onPress={() => handleNoteSelectorSelect(note.id)}
                >
                  <Text style={styles.noteSelectorItemText} numberOfLines={2}>
                    {note.content}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={PRIMARY_COLOR} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showCreateDevotionModal} animationType="slide">
        <CreateDevotionModal
          selectedVerses={selectedVerses}
          currentBook={localCurrentBook}
          currentChapterNum={localChapterNum}
          currentChapter={currentChapter}
          selectedVersion={selectedVersion}
          onClose={() => {
            setShowCreateDevotionModal(false);
            clearSelection();
          }}
        />
      </Modal>

      <Modal visible={showAddToNoteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.addToNoteModal, isDark && styles.addToNoteModalDark]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Note</Text>
              <TouchableOpacity onPress={() => {
                setShowAddToNoteModal(false);
                clearSelection();
              }}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.noteList}>
              <TouchableOpacity
                style={[styles.noteSelectItem, isDark && styles.noteSelectItemDark]}
                onPress={() => {
                  setShowAddToNoteModal(false);
                  router.push(`/note?verseRefs=${JSON.stringify(pendingVerseRefs)}`);
                  clearSelection();
                }}
              >
                <Ionicons name="add-circle" size={24} color={PRIMARY_COLOR} />
                <Text style={[styles.noteSelectText, isDark && styles.noteSelectTextDark]}>Create New Note</Text>
              </TouchableOpacity>
              
              {notes.length === 0 && (
                <Text style={[styles.emptyNotesText, isDark && styles.emptyNotesTextDark]}>
                  No existing notes. Create your first note above.
                </Text>
              )}
              
              {notes.map(note => (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.noteSelectItem, isDark && styles.noteSelectItemDark]}
                  onPress={() => {
                    const updatedNote = {
                      ...note,
                      verseRefs: [...new Set([...note.verseRefs, ...pendingVerseRefs])],
                      updatedAt: new Date().toISOString(),
                    };
                    updateNote(note.id, updatedNote.content, updatedNote.verseRefs, updatedNote.noteRefs);
                    setShowAddToNoteModal(false);
                    clearSelection();
                    Alert.alert('Success', 'Verses added to note');
                  }}
                >
                  <Ionicons name="document-text" size={20} color={PRIMARY_COLOR} />
                  <View style={styles.noteSelectContent}>
                    <Text style={[styles.noteSelectText, isDark && styles.noteSelectTextDark]} numberOfLines={1}>
                      {note.content}
                    </Text>
                    <Text style={[styles.noteSelectMeta, isDark && styles.noteSelectMetaDark]}>
                      {note.verseRefs.length} verses • {new Date(note.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (isDark: boolean, fontSize: number) => StyleSheet.create({
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
    paddingBottom: 20,
    borderRadius: 4,
  },
  verseWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  verseNumber: {
    width: 30,
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  verseText: {
    flex: 1,
    fontSize: fontSize,
    lineHeight: fontSize + 10,
    color: isDark ? '#ddd' : '#333',
  },
  noteIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    zIndex: 100,
  },
  noteIconContainer: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative',
  },
  noteCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  noteCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  notePreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  notePreviewBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxWidth: '80%',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  notePreviewBubbleDark: {
    backgroundColor: '#2a2a2a',
  },
  notePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
  },
  notePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
  },
  notePreviewText: {
    flex: 1,
    fontSize: 14,
    color: isDark ? '#ddd' : '#333',
  },
  noteSelectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  noteSelectorContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  noteSelectorContentDark: {
    backgroundColor: '#1a1a1a',
  },
  noteSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
  },
  noteSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
  },
  noteSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
  },
  noteSelectorItemText: {
    flex: 1,
    fontSize: 16,
    color: isDark ? '#fff' : '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addToNoteModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  addToNoteModalDark: {
    backgroundColor: '#1a1a1a',
  },
  noteList: {
    maxHeight: 400,
  },
  noteSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
    gap: 12,
  },
  noteSelectItemDark: {
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
  },
  noteSelectContent: {
    flex: 1,
  },
  noteSelectText: {
    fontSize: 16,
    color: isDark ? '#fff' : '#000',
    marginBottom: 4,
  },
  noteSelectTextDark: {
    color: isDark ? '#fff' : '#000',
  },
  noteSelectMeta: {
    fontSize: 13,
    color: isDark ? '#888' : '#666',
  },
  noteSelectMetaDark: {
    color: isDark ? '#888' : '#666',
  },
  emptyNotesText: {
    textAlign: 'center',
    padding: 20,
    color: isDark ? '#888' : '#666',
    fontSize: 14,
  },
  emptyNotesTextDark: {
    color: isDark ? '#888' : '#666',
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
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f4ff',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
  },
  selectionToolbarDark: {
    backgroundColor: '#1a2a4a',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  verseRangeContainer: {
    flex: 1,
    marginRight: 8,
    minWidth: 80,
    maxWidth: 150,
    overflow: 'hidden',
  },
  verseRangeAbove: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 4,
    overflow: 'hidden',
    height: 32,
    justifyContent: 'center',
  },
  verseRangeAboveDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    overflow: 'hidden',
    height: 32,
    justifyContent: 'center',
  },
  verseRangeScroll: {
    flex: 1,
  },
  verseRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  toolbarScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  toolbarIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    minWidth: 40,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  colorPickerBar: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  colorPickerBarDark: {
    backgroundColor: '#2a2a2a',
    borderBottomColor: '#444',
  },
  verseSelected: {
    backgroundColor: isDark ? '#1a2a4a' : '#e8f0ff',
    borderRadius: 4,
  },
  verseNumberSelected: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  verseTextSelected: {
    color: PRIMARY_COLOR,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  noHighlightButton: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noHighlightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  tabBarDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  tabScrollView: {
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginLeft: 8,
    maxWidth: 150,
  },
  tabActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 12,
    color: '#333',
    marginRight: 6,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabClose: {
    padding: 2,
  },
  tabCloseText: {
    fontSize: 10,
    color: '#666',
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  addTabButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  addTabButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  chapterScrollContainer: {
    backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#333' : '#e0e0e0',
    paddingVertical: 8,
  },
  chapterScrollContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  chapterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: isDark ? '#2a2a2a' : '#fff',
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#444' : '#e0e0e0',
  },
  chapterButtonActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  chapterButtonText: {
    fontSize: 14,
    color: isDark ? '#ddd' : '#333',
    fontWeight: '500',
  },
  chapterButtonTextActive: {
    color: '#fff',
  },
  compareSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e0e0e0',
  },
  compareVersionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
  compareVerse: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  compareVerseNumber: {
    width: 30,
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  compareVerseText: {
    flex: 1,
    fontSize: 14,
    color: isDark ? '#ddd' : '#333',
    lineHeight: 22,
  },
  compareError: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: isDark ? '#eee' : '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: isDark ? '#888' : '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  downloadButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#eee' : '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
    textAlign: 'center',
  },
  downloadMoreButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
