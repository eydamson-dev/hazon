export interface VerseRef {
  bookId: string;
  bookName: string;
  chapter: number;
  verses: number[];
  text?: string;
  translationId?: string;
  translationName?: string;
}

export interface Devotion {
  id: string;
  title: string;
  content: string;
  verseRefs: VerseRef[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface DevotionalState {
  devotions: Devotion[];
  trash: Devotion[];
  isLoading: boolean;
}
