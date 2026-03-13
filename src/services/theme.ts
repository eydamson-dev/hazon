import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  THEME: 'app_theme',
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
