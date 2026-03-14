import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  THEME: 'app_theme',
  HIGHLIGHTS: 'bible_highlights',
  TABS: 'bible_tabs',
  ACTIVE_TAB: 'bible_active_tab',
};

export type ThemeMode = 'light' | 'dark' | 'system';

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
