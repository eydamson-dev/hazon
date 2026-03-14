import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, Share, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YStack, XStack, Spinner } from 'tamagui';
import { useBible } from '../src/store/BibleContext';
import { useTheme } from '../src/store/ThemeContext';
import { useDevotional } from '../src/store/DevotionalContext';
import { getHighlights, saveHighlights, getTabs, saveTabs, type HighlightData, type TabData } from '../src/services/theme';
import CreateDevotionModal from '../src/components/CreateDevotionModal';
import DevotionPickerModal from '../src/components/DevotionPickerModal';
import { getBebliaChapter } from '../src/services/bible';
import type { Book, Chapter } from '../src/types/bible';
import type { VerseRef } from '../src/types/devotional';

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

  const { createDevotion, devotions, updateDevotion } = useDevotional();

  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showCreateDevotionModal, setShowCreateDevotionModal] = useState(false);
  const [showDevotionPickerModal, setShowDevotionPickerModal] = useState(false);
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
      {tabs.length > 0 && (
        <View style={[styles.tabBar, isDark && styles.tabBarDark]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
            <XStack gap="$1">
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
            </XStack>
          </ScrollView>
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
              const isSelected = selectedVerses.has(verseNum);
              const highlightColor = highlightedVerses.get(verseNum);
              
              return (
                <View key={index}>
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
          <View style={[styles.selectionToolbar, isDark && styles.selectionToolbarDark]}>
            <Text style={styles.selectionText}>{selectedVerses.size} selected</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScrollContent}>
              <TouchableOpacity style={styles.toolbarIconButton} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconButton} onPress={handleCompare}>
                <Ionicons name="git-compare-outline" size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconButton} onPress={() => setShowDevotionPickerModal(true)}>
                <Ionicons name="heart-outline" size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconButton} onPress={clearSelection}>
                <Ionicons name="close-circle-outline" size={20} color="#ff4444" />
              </TouchableOpacity>
            </ScrollView>
          </View>
          <View style={[styles.colorPickerBar, isDark && styles.colorPickerBarDark]}>
            <XStack gap="$2" justifyContent="center">
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
            </XStack>
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
              <Spinner size="large" color={PRIMARY_COLOR} />
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
                            {verse.content?.map((c: any) => typeof c === 'string' ? c : c.text).join(' ')}
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

      <Modal visible={showCreateDevotionModal} animationType="slide">
        <CreateDevotionModal
          selectedVerses={selectedVerses}
          currentBook={localCurrentBook}
          currentChapterNum={localChapterNum}
          currentChapter={currentChapter}
          onClose={() => {
            setShowCreateDevotionModal(false);
            clearSelection();
          }}
        />
      </Modal>

      <Modal visible={showDevotionPickerModal} animationType="slide">
        <DevotionPickerModal
          selectedVerses={selectedVerses}
          currentBook={localCurrentBook}
          currentChapterNum={localChapterNum}
          currentChapter={currentChapter}
          onClose={() => setShowDevotionPickerModal(false)}
          onCreateNew={() => {
            setShowDevotionPickerModal(false);
            setShowCreateDevotionModal(true);
          }}
          onAddToExisting={async (devotionId) => {
            const existing = devotions.find(d => d.id === devotionId);
            if (!existing) return;
            
            const verseRefs: VerseRef[] = [];
            if (localCurrentBook && currentChapter && selectedVerses.size > 0) {
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
                bookId: localCurrentBook.id,
                bookName: localCurrentBook.commonName,
                chapter: localChapterNum,
                verses: sortedVerses,
                text: verseContents.join(' '),
              });
            }
            
            const newVerseRefs = [...existing.verseRefs, ...verseRefs];
            const success = await updateDevotion(
              devotionId,
              existing.title,
              existing.content,
              newVerseRefs
            );
            
            if (success) {
              Alert.alert('Success', 'Verses added to devotion!');
              setShowDevotionPickerModal(false);
              clearSelection();
            } else {
              Alert.alert('Error', 'Failed to add verses');
            }
          }}
        />
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
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  toolbarScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  toolbarIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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
