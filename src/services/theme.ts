import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  THEME: 'app_theme',
  HIGHLIGHTS: 'bible_highlights',
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
