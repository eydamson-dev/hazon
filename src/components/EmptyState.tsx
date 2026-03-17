import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  iconSize?: number;
}

export default function EmptyState({ icon, title, subtitle, iconSize = 64 }: EmptyStateProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={iconSize}
        color={isDark ? '#444' : '#ccc'}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: isDark ? '#aaa' : '#666' }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? '#666' : '#999' }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
