import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSelectedTranslation, setSelectedTranslation as saveSelectedTranslation, getDownloadedVersions, AVAILABLE_VERSIONS, getReadingState, saveReadingState } from '../services/bible';
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
  const [versions, setVersions] = useState<BibleVersion[]>(AVAILABLE_VERSIONS);
  const [selectedVersion, setSelectedVersionState] = useState<BibleVersion>(AVAILABLE_VERSIONS[0]);
  const [books, setBooks] = useState<Book[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentChapterNum, setCurrentChapterNum] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialState();
    refreshDownloadedVersions();
  }, []);

  const refreshDownloadedVersions = async () => {
    const downloaded = await getDownloadedVersions();
    setVersions(prev => prev.map(v => ({
      ...v,
      isDownloaded: downloaded.includes(v.id),
    })));
  };

  const loadInitialState = async () => {
    setIsLoading(true);
    try {
      const savedId = await getSelectedTranslation();
      const version = versions.find(v => v.id === savedId) || versions[0];
      setSelectedVersionState(version);
      
      if (savedId) {
        const booksData = await fetchAndCacheBooks(savedId);
        setBooks(booksData);
        
        const readingState = await getReadingState();
        const bookId = readingState?.bookId || 'GEN';
        const chapter = readingState?.chapter || 1;
        
        const book = booksData.find(b => b.id === bookId) || booksData[0];
        setCurrentBook(book);
        setCurrentChapterNum(chapter);
        
        await loadChapter(bookId, chapter, savedId);
      }
    } catch (err) {
      console.error('Error loading initial state:', err);
      setError('Failed to load Bible');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndCacheBooks = async (translationId: string): Promise<Book[]> => {
    const { getBooks } = await import('../services/bible');
    return await getBooks(translationId);
  };

  const setSelectedVersionHandler = async (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;
    
    setSelectedVersionState(version);
    await saveSelectedTranslation(versionId);
    
    const booksData = await fetchAndCacheBooks(versionId);
    setBooks(booksData);
    
    if (currentBook) {
      await loadChapter(currentBook.id, currentChapterNum, versionId);
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
    setIsLoading(true);
    setError(null);
    try {
      const { getChapter } = await import('../services/bible');
      const chapterData = await getChapter(versionId || selectedVersion.id, bookId, chapter);
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

  return (
    <BibleContext.Provider
      value={{
        selectedVersion,
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
