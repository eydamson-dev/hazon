import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useRouter } from 'expo-router';
import { useTheme } from "../src/store/ThemeContext";
import { ThemeMode } from "../src/services/theme";
import DownloadsScreen from "../src/components/Downloads";

const PRIMARY_COLOR = '#304080';

export default function Settings() {
  const router = useRouter();
  const { theme, isDark, setTheme } = useTheme();
  const [showDownloads, setShowDownloads] = useState(false);

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <Text style={styles.label}>Theme</Text>
        {[
          { label: 'Light', value: 'light' as ThemeMode, description: 'Always use light mode' },
          { label: 'Dark', value: 'dark' as ThemeMode, description: 'Always use dark mode' },
          { label: 'System', value: 'system' as ThemeMode, description: 'Follow system settings' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.themeOption,
              theme === option.value && styles.themeOptionSelected,
            ]}
            onPress={() => setTheme(option.value)}
          >
            <View>
              <Text
                style={[
                  styles.themeOptionText,
                  theme === option.value && styles.themeOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.themeOptionDesc}>
                {option.description}
              </Text>
            </View>
            {theme === option.value && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bible</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowDownloads(true)}
        >
          <View>
            <Text style={styles.menuItemText}>Bible Downloads</Text>
            <Text style={styles.menuItemDesc}>
              Download and manage Bible translations
            </Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            CJCRSG Bible App{'\n'}
            Version 1.1.0{'\n\n'}
            A Bible reading app with multiple translations,{'\n'}
            devotional content, and study features.
          </Text>
        </View>
      </View>

      <Modal visible={showDownloads} animationType="slide">
        <DownloadsScreen onClose={() => setShowDownloads(false)} />
      </Modal>
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    padding: 20,
    paddingBottom: 10,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#888' : '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#eee' : '#333',
    marginBottom: 8,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#e0e0e0',
  },
  themeOptionSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: isDark ? '#1a2a4a' : '#f0f4ff',
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#eee' : '#333',
  },
  themeOptionTextSelected: {
    color: PRIMARY_COLOR,
  },
  themeOptionDesc: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#eee' : '#333',
  },
  menuItemDesc: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    marginTop: 2,
  },
  menuItemArrow: {
    fontSize: 24,
    color: isDark ? '#666' : '#ccc',
  },
  aboutCard: {
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    padding: 16,
    borderRadius: 12,
  },
  aboutText: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
    lineHeight: 22,
  },
});
