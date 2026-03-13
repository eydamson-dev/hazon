import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, saveTheme, ThemeMode } from '../services/theme';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

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
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
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
