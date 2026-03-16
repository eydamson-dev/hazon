import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, saveTheme, ThemeMode, getFontSize, saveFontSize, FontSize, FONT_SIZES } from '../services/theme';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  fontSize: FontSize;
  fontSizeValue: number;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setFontSize: (fontSize: FontSize) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    const savedTheme = await getTheme();
    setThemeState(savedTheme);
    const savedFontSize = await getFontSize();
    setFontSizeState(savedFontSize);
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await saveTheme(newTheme);
  };

  const setFontSize = async (newFontSize: FontSize) => {
    setFontSizeState(newFontSize);
    await saveFontSize(newFontSize);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark, 
      fontSize,
      fontSizeValue: FONT_SIZES[fontSize],
      setTheme,
      setFontSize,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
