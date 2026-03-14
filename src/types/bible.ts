export interface Translation {
  id: string;
  name: string;
  englishName: string;
  shortName: string;
  language: string;
  languageName: string;
  textDirection: 'ltr' | 'rtl';
  numberOfBooks: number;
  totalNumberOfChapters: number;
}

export interface Book {
  id: string;
  translationId: string;
  name: string;
  commonName: string;
  order: number;
  numberOfChapters: number;
  firstChapterNumber: number;
  lastChapterNumber: number;
  totalNumberOfVerses: number;
}

export interface VerseContent {
  type: 'heading' | 'line_break' | 'verse' | 'hebrew_subtitle';
  number?: number;
  content?: (string | FormattedText | InlineHeading | InlineLineBreak | { noteId: number })[];
}

export interface FormattedText {
  text: string;
  poem?: number;
  wordsOfJesus?: boolean;
}

export interface InlineHeading {
  heading: string;
}

export interface InlineLineBreak {
  lineBreak: true;
}

export interface ChapterData {
  number: number;
  content: VerseContent[];
}

export interface Chapter {
  translation: Translation;
  book: Book;
  numberOfVerses: number;
  chapter: ChapterData;
  nextChapterApiLink: string | null;
  previousChapterApiLink: string | null;
}

export interface BibleVersion {
  id: string;
  shortName: string;
  name: string;
  isDownloaded: boolean;
  downloadProgress?: number;
}

export interface ReadingProgress {
  translationId: string;
  bookId: string;
  chapter: number;
  lastRead: number;
}

export interface Bookmark {
  id: string;
  translationId: string;
  bookId: string;
  chapter: number;
  verse?: number;
  note?: string;
  createdAt: number;
}

export interface XmlVerse {
  number: number;
  content: string;
}

export interface XmlChapter {
  number: number;
  verses: XmlVerse[];
}

export interface XmlBook {
  number: number;
  name: string;
  chapters: XmlChapter[];
}

export interface XmlTestament {
  name: string;
  books: XmlBook[];
}

export interface XmlBible {
  translation: string;
  testament: XmlTestament[];
}
