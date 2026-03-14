import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Book, Chapter, BibleVersion, XmlBible, XmlBook, XmlChapter, XmlVerse, VerseContent } from '../types/bible';

const BEBLIA_BASE_URL = 'https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master';

const STORAGE_KEYS = {
  BOOKS: 'bible_books_',
  CHAPTER: 'bible_chapter_',
  DOWNLOADED_VERSIONS: 'bible_downloaded_versions',
  SELECTED_TRANSLATION: 'bible_selected_translation',
  READING_STATE: 'bible_reading_state',
};

const IDB_NAME = 'bible-translations';
const IDB_VERSION = 1;
const TRANSLATIONS_STORE = 'translations';

let idb: IDBDatabase | null = null;

async function getIDB(): Promise<IDBDatabase> {
  if (idb) return idb;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      idb = request.result;
      resolve(idb);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TRANSLATIONS_STORE)) {
        db.createObjectStore(TRANSLATIONS_STORE, { keyPath: 'id' });
      }
    };
  });
}

async function saveToIDB(translationId: string, data: XmlBible): Promise<void> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSLATIONS_STORE, 'readwrite');
    const store = tx.objectStore(TRANSLATIONS_STORE);
    const request = store.put({ id: translationId, data });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getFromIDB(translationId: string): Promise<XmlBible | null> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSLATIONS_STORE, 'readonly');
    const store = tx.objectStore(TRANSLATIONS_STORE);
    const request = store.get(translationId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.data);
      } else {
        resolve(null);
      }
    };
  });
}

async function deleteFromIDB(translationId: string): Promise<void> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSLATIONS_STORE, 'readwrite');
    const store = tx.objectStore(TRANSLATIONS_STORE);
    const request = store.delete(translationId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

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

export interface AvailableTranslation {
  id: string;
  name: string;
  xmlFile: string;
  size: number;
}

const GITHUB_API_URL = 'https://api.github.com/repos/Beblia/Holy-Bible-XML-Format/contents';

export async function fetchAvailableTranslations(): Promise<AvailableTranslation[]> {
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const files: Array<{ name: string; size: number }> = await response.json();
    
    const translations: AvailableTranslation[] = files
      .filter(f => f.name.endsWith('.xml'))
      .map(f => {
        const name = f.name.replace('.xml', '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').trim();
        return {
          id: `beblia_${f.name.toLowerCase().replace('.xml', '')}`,
          name,
          xmlFile: f.name,
          size: f.size,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return translations;
  } catch (error) {
    console.error('Error fetching available translations:', error);
    return [];
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

interface DownloadedTranslation {
  id: string;
  name: string;
}

export async function getDownloadedVersions(): Promise<DownloadedTranslation[]> {
  try {
    const downloaded = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOADED_VERSIONS);
    const parsed = downloaded ? JSON.parse(downloaded) : [];
    if (parsed.length > 0 && typeof parsed[0] === 'string') {
      return parsed.map((id: string) => ({ id, name: id }));
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function addDownloadedVersion(translationId: string, translationName?: string): Promise<void> {
  const downloaded = await getDownloadedVersions();
  const existing = downloaded.find(d => d.id === translationId);
  if (!existing) {
    downloaded.push({ id: translationId, name: translationName || translationId });
  } else if (translationName && existing.name !== translationName) {
    existing.name = translationName;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.DOWNLOADED_VERSIONS, JSON.stringify(downloaded));
}

export async function removeDownloadedVersion(translationId: string): Promise<void> {
  const downloaded = await getDownloadedVersions();
  const filtered = downloaded.filter(d => d.id !== translationId);
  await AsyncStorage.setItem(STORAGE_KEYS.DOWNLOADED_VERSIONS, JSON.stringify(filtered));
  
  const keys = await AsyncStorage.getAllKeys();
  const chapterKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CHAPTER) && key.includes(translationId));
  await AsyncStorage.multiRemove(chapterKeys);
  const bookKeys = keys.filter(key => key === `${STORAGE_KEYS.BOOKS}${translationId}`);
  await AsyncStorage.multiRemove(bookKeys);
  
  try {
    await deleteFromIDB(translationId);
  } catch (e) {
    console.error('Error deleting from IDB:', e);
  }
}

const BOOK_NAME_MAP: Record<number, { name: string; commonName: string }> = {
  1: { name: 'Genesis', commonName: 'Genesis' },
  2: { name: 'Exodus', commonName: 'Exodus' },
  3: { name: 'Leviticus', commonName: 'Leviticus' },
  4: { name: 'Numbers', commonName: 'Numbers' },
  5: { name: 'Deuteronomy', commonName: 'Deuteronomy' },
  6: { name: 'Joshua', commonName: 'Joshua' },
  7: { name: 'Judges', commonName: 'Judges' },
  8: { name: 'Ruth', commonName: 'Ruth' },
  9: { name: '1 Samuel', commonName: '1 Samuel' },
  10: { name: '2 Samuel', commonName: '2 Samuel' },
  11: { name: '1 Kings', commonName: '1 Kings' },
  12: { name: '2 Kings', commonName: '2 Kings' },
  13: { name: '1 Chronicles', commonName: '1 Chronicles' },
  14: { name: '2 Chronicles', commonName: '2 Chronicles' },
  15: { name: 'Ezra', commonName: 'Ezra' },
  16: { name: 'Nehemiah', commonName: 'Nehemiah' },
  17: { name: 'Esther', commonName: 'Esther' },
  18: { name: 'Job', commonName: 'Job' },
  19: { name: 'Psalm', commonName: 'Psalm' },
  20: { name: 'Proverbs', commonName: 'Proverbs' },
  21: { name: 'Ecclesiastes', commonName: 'Ecclesiastes' },
  22: { name: 'Song of Solomon', commonName: 'Song of Solomon' },
  23: { name: 'Isaiah', commonName: 'Isaiah' },
  24: { name: 'Jeremiah', commonName: 'Jeremiah' },
  25: { name: 'Lamentations', commonName: 'Lamentations' },
  26: { name: 'Ezekiel', commonName: 'Ezekiel' },
  27: { name: 'Daniel', commonName: 'Daniel' },
  28: { name: 'Hosea', commonName: 'Hosea' },
  29: { name: 'Joel', commonName: 'Joel' },
  30: { name: 'Amos', commonName: 'Amos' },
  31: { name: 'Obadiah', commonName: 'Obadiah' },
  32: { name: 'Jonah', commonName: 'Jonah' },
  33: { name: 'Micah', commonName: 'Micah' },
  34: { name: 'Nahum', commonName: 'Nahum' },
  35: { name: 'Habakkuk', commonName: 'Habakkuk' },
  36: { name: 'Zephaniah', commonName: 'Zephaniah' },
  37: { name: 'Haggai', commonName: 'Haggai' },
  38: { name: 'Zechariah', commonName: 'Zechariah' },
  39: { name: 'Malachi', commonName: 'Malachi' },
  40: { name: 'Matthew', commonName: 'Matthew' },
  41: { name: 'Mark', commonName: 'Mark' },
  42: { name: 'Luke', commonName: 'Luke' },
  43: { name: 'John', commonName: 'John' },
  44: { name: 'Acts', commonName: 'Acts' },
  45: { name: 'Romans', commonName: 'Romans' },
  46: { name: '1 Corinthians', commonName: '1 Corinthians' },
  47: { name: '2 Corinthians', commonName: '2 Corinthians' },
  48: { name: 'Galatians', commonName: 'Galatians' },
  49: { name: 'Ephesians', commonName: 'Ephesians' },
  50: { name: 'Philippians', commonName: 'Philippians' },
  51: { name: 'Colossians', commonName: 'Colossians' },
  52: { name: '1 Thessalonians', commonName: '1 Thessalonians' },
  53: { name: '2 Thessalonians', commonName: '2 Thessalonians' },
  54: { name: '1 Timothy', commonName: '1 Timothy' },
  55: { name: '2 Timothy', commonName: '2 Timothy' },
  56: { name: 'Titus', commonName: 'Titus' },
  57: { name: 'Philemon', commonName: 'Philemon' },
  58: { name: 'Hebrews', commonName: 'Hebrews' },
  59: { name: 'James', commonName: 'James' },
  60: { name: '1 Peter', commonName: '1 Peter' },
  61: { name: '2 Peter', commonName: '2 Peter' },
  62: { name: '1 John', commonName: '1 John' },
  63: { name: '2 John', commonName: '2 John' },
  64: { name: '3 John', commonName: '3 John' },
  65: { name: 'Jude', commonName: 'Jude' },
  66: { name: 'Revelation', commonName: 'Revelation' },
};

function parseXmlBible(xmlText: string): XmlBible {
  const testamentMatches = xmlText.match(/<testament name="([^"]+)">([\s\S]*?)<\/testament>/g) || [];
  const testament: { name: string; books: XmlBook[] }[] = [];
  
  for (const tm of testamentMatches) {
    const nameMatch = tm.match(/<testament name="([^"]+)">/);
    if (!nameMatch) continue;
    
    const testamentName = nameMatch[1];
    const bookMatches = tm.match(/<book number="(\d+)">([\s\S]*?)<\/book>/g) || [];
    const books: XmlBook[] = [];
    
    for (const bm of bookMatches) {
      const numMatch = bm.match(/<book number="(\d+)">/);
      if (!numMatch) continue;
      
      const bookNumber = parseInt(numMatch[1]);
      const chapterMatches = bm.match(/<chapter number="(\d+)">([\s\S]*?)<\/chapter>/g) || [];
      const chapters: XmlChapter[] = [];
      
      for (const cm of chapterMatches) {
        const chapNumMatch = cm.match(/<chapter number="(\d+)">/);
        if (!chapNumMatch) continue;
        
        const chapterNum = parseInt(chapNumMatch[1]);
        const verseMatches = cm.match(/<verse number="(\d+)">([\s\S]*?)<\/verse>/g) || [];
        const verses: XmlVerse[] = [];
        
        for (const vm of verseMatches) {
          const versNumMatch = vm.match(/<verse number="(\d+)">([\s\S]*?)<\/verse>/);
          if (!versNumMatch) continue;
          
          verses.push({
            number: parseInt(versNumMatch[1]),
            content: versNumMatch[2].trim(),
          });
        }
        
        chapters.push({ number: chapterNum, verses });
      }
      
      books.push({ number: bookNumber, name: BOOK_NAME_MAP[bookNumber]?.name || `Book ${bookNumber}`, chapters });
    }
    
    testament.push({ name: testamentName, books });
  }
  
  const transMatch = xmlText.match(/<bible translation="([^"]+)"/);
  const translation = transMatch ? transMatch[1] : 'Unknown';
  
  return { translation, testament };
}

export async function downloadBebliaTranslation(
  translationId: string,
  xmlFile?: string,
  translationName?: string
): Promise<boolean> {
  let version: { id: string; name: string; xmlFile: string } | undefined;
  
  if (xmlFile) {
    version = { id: translationId, name: translationName || translationId, xmlFile };
  }
  
  if (!version) return false;
  
  try {
    const response = await fetch(`${BEBLIA_BASE_URL}/${version.xmlFile}`);
    if (!response.ok) return false;
    
    const xmlText = await response.text();
    const parsed = parseXmlBible(xmlText);
    
    await saveToIDB(translationId, parsed);
    
    await addDownloadedVersion(translationId, parsed.translation || version.name);
    
    return true;
  } catch (error) {
    console.error('Error downloading Beblia translation:', error);
    return false;
  }
}

export async function getBebliaBooks(translationId: string): Promise<Book[]> {
  try {
    const storageKey = `${STORAGE_KEYS.BOOKS}${translationId}`;
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const parsed = await getFromIDB(translationId);
    if (!parsed) return [];
    
    const books: Book[] = [];
    
    for (const testament of parsed.testament) {
      for (const book of testament.books) {
        const lastChapter = book.chapters[book.chapters.length - 1];
        const lastVerse = lastChapter ? lastChapter.verses[lastChapter.verses.length - 1] : { number: 0 };
        
        books.push({
          id: `xml_${book.number}`,
          translationId,
          name: book.name,
          commonName: BOOK_NAME_MAP[book.number]?.commonName || book.name,
          order: book.number,
          numberOfChapters: book.chapters.length,
          firstChapterNumber: 1,
          lastChapterNumber: book.chapters.length,
          totalNumberOfVerses: lastVerse.number,
        });
      }
    }
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(books));
    return books;
  } catch (error) {
    console.error('Error getting Beblia books:', error);
    return [];
  }
}

export async function getBebliaChapter(
  translationId: string,
  bookNumber: number,
  chapter: number
): Promise<Chapter | null> {
  try {
    const storageKey = `${STORAGE_KEYS.CHAPTER}${translationId}_${bookNumber}_${chapter}`;
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const parsed = await getFromIDB(translationId);
    if (!parsed) return null;
    
    let foundBook: XmlBook | undefined;
    let testamentName = '';
    
    for (const testament of parsed.testament) {
      const book = testament.books.find(b => b.number === bookNumber);
      if (book) {
        foundBook = book;
        testamentName = testament.name;
        break;
      }
    }
    
    if (!foundBook) return null;
    
    const foundChapter = foundBook.chapters.find(c => c.number === chapter);
    if (!foundChapter) return null;
    
    const bookInfo = BOOK_NAME_MAP[bookNumber] || { name: foundBook.name, commonName: foundBook.name };
    
    const verseContent: VerseContent[] = foundChapter.verses.map((verse): VerseContent => ({
      type: 'verse',
      number: verse.number,
      content: [verse.content],
    }));
    
    const chapterData: Chapter = {
      translation: {
        id: translationId,
        name: parsed.translation,
        englishName: parsed.translation,
        shortName: translationId.replace('eng_', '').toUpperCase(),
        language: 'en',
        languageName: 'English',
        textDirection: 'ltr',
        numberOfBooks: 66,
        totalNumberOfChapters: foundBook.chapters.length,
      },
      book: {
        id: `xml_${bookNumber}`,
        translationId,
        name: bookInfo.name,
        commonName: bookInfo.commonName,
        order: bookNumber,
        numberOfChapters: foundBook.chapters.length,
        firstChapterNumber: 1,
        lastChapterNumber: foundBook.chapters.length,
        totalNumberOfVerses: foundChapter.verses.length,
      },
      numberOfVerses: foundChapter.verses.length,
      chapter: {
        number: chapter,
        content: verseContent,
      },
      nextChapterApiLink: null,
      previousChapterApiLink: null,
    };
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(chapterData));
    return chapterData;
  } catch (error) {
    console.error('Error getting Beblia chapter:', error);
    return null;
  }
}
