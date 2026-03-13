import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Translation, Book, Chapter, BibleVersion } from '../types/bible';

const BASE_URL = 'https://bible.helloao.org/api';

const STORAGE_KEYS = {
  TRANSLATIONS: 'bible_translations',
  BOOKS: 'bible_books_',
  CHAPTER: 'bible_chapter_',
  DOWNLOADED_VERSIONS: 'bible_downloaded_versions',
  SELECTED_TRANSLATION: 'bible_selected_translation',
  READING_STATE: 'bible_reading_state',
};

export interface ReadingState {
  bookId: string;
  chapter: number;
}

export async function getReadingState(): Promise<ReadingState | null> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.READING_STATE);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export async function saveReadingState(state: ReadingState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.READING_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving reading state:', error);
  }
}

export const AVAILABLE_VERSIONS: BibleVersion[] = [
  { id: 'eng_kjv', shortName: 'KJV', name: 'King James Version', isDownloaded: false },
  { id: 'BSB', shortName: 'BSB', name: 'Berean Standard Bible', isDownloaded: false },
  { id: 'ENGWEBP', shortName: 'WEB', name: 'World English Bible', isDownloaded: false },
  { id: 'eng_bbe', shortName: 'BBE', name: 'Bible in Basic English', isDownloaded: false },
  { id: 'tgl_ulb', shortName: 'TLB', name: 'Tagalog Bible', isDownloaded: false },
];

export async function getTranslations(): Promise<Translation[]> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.TRANSLATIONS);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const response = await fetch(`${BASE_URL}/available_translations.json`);
    const data = await response.json();
    
    const filtered = data.translations.filter(
      (t: Translation) => t.numberOfBooks >= 66
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error fetching translations:', error);
    return [];
  }
}

export async function getBooks(translationId: string): Promise<Book[]> {
  try {
    const storageKey = `${STORAGE_KEYS.BOOKS}${translationId}`;
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const response = await fetch(`${BASE_URL}/${translationId}/books.json`);
    const data = await response.json();
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(data.books));
    return data.books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export async function getChapter(
  translationId: string,
  bookId: string,
  chapter: number
): Promise<Chapter | null> {
  try {
    const storageKey = `${STORAGE_KEYS.CHAPTER}${translationId}_${bookId}_${chapter}`;
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const response = await fetch(`${BASE_URL}/${translationId}/${bookId}/${chapter}.json`);
    if (!response.ok) {
      throw new Error('Chapter not found');
    }
    const data = await response.json();
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
}

export async function getSelectedTranslation(): Promise<string> {
  try {
    const selected = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TRANSLATION);
    return selected || 'eng_kjv';
  } catch {
    return 'eng_kjv';
  }
}

export async function setSelectedTranslation(translationId: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TRANSLATION, translationId);
}

export async function getDownloadedVersions(): Promise<string[]> {
  try {
    const downloaded = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOADED_VERSIONS);
    return downloaded ? JSON.parse(downloaded) : [];
  } catch {
    return [];
  }
}

export async function addDownloadedVersion(translationId: string): Promise<void> {
  const downloaded = await getDownloadedVersions();
  if (!downloaded.includes(translationId)) {
    downloaded.push(translationId);
    await AsyncStorage.setItem(STORAGE_KEYS.DOWNLOADED_VERSIONS, JSON.stringify(downloaded));
  }
}

export async function removeDownloadedVersion(translationId: string): Promise<void> {
  const downloaded = await getDownloadedVersions();
  const filtered = downloaded.filter(id => id !== translationId);
  await AsyncStorage.setItem(STORAGE_KEYS.DOWNLOADED_VERSIONS, JSON.stringify(filtered));
  
  const keys = await AsyncStorage.getAllKeys();
  const chapterKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CHAPTER) && key.includes(translationId));
  await AsyncStorage.multiRemove(chapterKeys);
  const bookKeys = keys.filter(key => key === `${STORAGE_KEYS.BOOKS}${translationId}`);
  await AsyncStorage.multiRemove(bookKeys);
}
