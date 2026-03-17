import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  THEME: 'app_theme',
  FONT_SIZE: 'app_font_size',
  HIGHLIGHTS: 'bible_highlights',
  TABS: 'bible_tabs',
  ACTIVE_TAB: 'bible_active_tab',
  NOTES: 'bible_notes',
};

export type ThemeMode = 'light' | 'dark' | 'system';

export type FontSize = 'small' | 'medium' | 'large' | 'extraLarge';

export const FONT_SIZES: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
  extraLarge: 22,
};

export async function getTheme(): Promise<ThemeMode> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as ThemeMode) || 'system';
  } catch {
    return 'system';
  }
}

export async function saveTheme(theme: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

export async function getFontSize(): Promise<FontSize> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    return (saved as FontSize) || 'medium';
  } catch {
    return 'medium';
  }
}

export async function saveFontSize(fontSize: FontSize): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
  } catch (error) {
    console.error('Error saving font size:', error);
  }
}

export type HighlightData = Record<string, Record<number, string>>;

export async function getHighlights(): Promise<HighlightData> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export async function saveHighlights(highlights: HighlightData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
  } catch (error) {
    console.error('Error saving highlights:', error);
  }
}

export type TabData = {
  id: string;
  bookId: string;
  bookName: string;
  chapterNum: number;
  currentVerse: number;
};

export async function getTabs(): Promise<{ tabs: TabData[]; activeTabId: string | null }> {
  try {
    const tabsJson = await AsyncStorage.getItem(STORAGE_KEYS.TABS);
    const activeTabId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    return {
      tabs: tabsJson ? JSON.parse(tabsJson) : [],
      activeTabId: activeTabId || null,
    };
  } catch {
    return { tabs: [], activeTabId: null };
  }
}

export async function saveTabs(tabs: TabData[], activeTabId: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
    if (activeTabId) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTabId);
    }
  } catch (error) {
    console.error('Error saving tabs:', error);
  }
}

export interface Note {
  id: string;
  content: string;
  verseRefs: string[];
  noteRefs: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getNotes(): Promise<Note[]> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function saveNotes(notes: Note[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}
