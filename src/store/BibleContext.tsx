import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSelectedTranslation, setSelectedTranslation as saveSelectedTranslation, getDownloadedVersions, getReadingState, saveReadingState, downloadBebliaTranslation, getBebliaBooks, getBebliaChapter } from '../services/bible';
import type { BibleVersion, Book, Chapter } from '../types/bible';

interface BibleContextType {
  selectedVersion: BibleVersion;
  versions: BibleVersion[];
  books: Book[];
  currentChapter: Chapter | null;
  currentBook: Book | null;
  currentChapterNum: number;
  isLoading: boolean;
  error: string | null;
  setSelectedVersion: (versionId: string) => Promise<void>;
  loadBooks: (translationId: string) => Promise<void>;
  loadChapter: (bookId: string, chapter: number, versionId?: string) => Promise<void>;
  setCurrentBook: (book: Book | null) => void;
  setCurrentChapterNum: (num: number) => void;
  refreshDownloadedVersions: () => Promise<void>;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [selectedVersion, setSelectedVersionState] = useState<BibleVersion | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentChapterNum, setCurrentChapterNum] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshDownloadedVersions();
  }, []);

  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      loadInitialState();
    }
  }, [versions]);

  const refreshDownloadedVersions = async () => {
    const downloaded = await getDownloadedVersions();
    
    const newVersions: BibleVersion[] = downloaded.map(d => {
      const cleanId = d.id.replace('eng_', '').replace('beblia_', '').replace('.xml', '');
      const formattedName = cleanId.replace(/([A-Z])/g, ' $1').trim();
      const displayName = d.name === 'Unknown' || !d.name ? formattedName : d.name;
      return {
        id: d.id,
        shortName: cleanId.substring(0, 10).toUpperCase(),
        name: displayName,
        isDownloaded: true,
      };
    });
    
    setVersions(newVersions);
  };

  const loadInitialState = async () => {
    setIsLoading(true);
    try {
      const savedId = await getSelectedTranslation();
      let version = versions.find(v => v.id === savedId);
      
      if (!version && versions.length > 0) {
        version = versions[0];
      }
      
      if (!version) {
        setError('No Bible translations downloaded. Please download a translation from Settings.');
        setIsLoading(false);
        return;
      }
      
      setSelectedVersionState(version);
      await saveSelectedTranslation(version.id);
      
      const booksData = await fetchAndCacheBooks(version.id);
      setBooks(booksData);
      
      const readingState = await getReadingState();
      const defaultBookId = 'xml_1';
      const bookId = readingState?.bookId || defaultBookId;
      const chapter = readingState?.chapter || 1;
      
      const book = booksData.find(b => b.id === bookId) || booksData[0];
      setCurrentBook(book);
      setCurrentChapterNum(chapter);
      
      await loadChapter(bookId, chapter, version.id);
    } catch (err) {
      console.error('Error loading initial state:', err);
      setError('Failed to load Bible');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndCacheBooks = async (translationId: string): Promise<Book[]> => {
    return await getBebliaBooks(translationId);
  };

  const setSelectedVersionHandler = async (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;
    
    setSelectedVersionState({ ...version, isDownloaded: true });
    await saveSelectedTranslation(versionId);
    
    const booksData = await fetchAndCacheBooks(versionId);
    setBooks(booksData);
    
    if (currentBook) {
      await loadChapter(currentBook.id, currentChapterNum, versionId);
    } else if (booksData.length > 0) {
      const genesis = booksData.find(b => b.id === 'xml_1') || booksData[0];
      setCurrentBook(genesis);
      setCurrentChapterNum(1);
      await loadChapter(genesis.id, 1, versionId);
    }
  };

  const loadBooks = async (translationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const booksData = await fetchAndCacheBooks(translationId);
      setBooks(booksData);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChapter = async (bookId: string, chapter: number, versionId?: string) => {
    if (!selectedVersion) return;
    setIsLoading(true);
    setError(null);
    try {
      const targetVersion = versionId || selectedVersion.id;
      
      const bookNumber = parseInt(bookId.replace('xml_', ''));
      const chapterData = await getBebliaChapter(targetVersion, bookNumber, chapter);
      
      setCurrentChapter(chapterData);
    } catch (err) {
      setError('Failed to load chapter');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrentBook = (book: Book | null) => {
    setCurrentBook(book);
    if (book) {
      saveReadingState({ bookId: book.id, chapter: currentChapterNum });
    }
  };

  const handleSetCurrentChapterNum = (num: number) => {
    setCurrentChapterNum(num);
    if (currentBook) {
      saveReadingState({ bookId: currentBook.id, chapter: num });
    }
  };

  const defaultVersion: BibleVersion = {
    id: '',
    shortName: '',
    name: 'No Translation',
    isDownloaded: false,
  };

  return (
    <BibleContext.Provider
      value={{
        selectedVersion: selectedVersion || defaultVersion,
        versions,
        books,
        currentChapter,
        currentBook,
        currentChapterNum,
        isLoading,
        error,
        setSelectedVersion: setSelectedVersionHandler,
        loadBooks,
        loadChapter,
        setCurrentBook: handleSetCurrentBook,
        setCurrentChapterNum: handleSetCurrentChapterNum,
        refreshDownloadedVersions,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
}

export function useBible() {
  const context = useContext(BibleContext);
  if (!context) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
}
