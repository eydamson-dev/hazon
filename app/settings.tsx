import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { YStack, XStack, Button, Card } from "tamagui";
import { useTheme } from "../src/store/ThemeContext";
import { ThemeMode } from "../src/services/theme";

const PRIMARY_COLOR = '#304080';

export default function Settings() {
  const { theme, isDark, setTheme } = useTheme();

  const themeOptions: { label: string; value: ThemeMode; description: string }[] = [
    { label: 'Light', value: 'light', description: 'Always use light mode' },
    { label: 'Dark', value: 'dark', description: 'Always use dark mode' },
    { label: 'System', value: 'system', description: 'Follow system settings' },
  ];

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <YStack padding="$4" space="$3">
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <Text style={styles.label}>Theme</Text>
        {themeOptions.map((option) => (
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
      </YStack>

      <YStack padding="$4" space="$3">
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            CJCRSG Bible App{'\n'}
            Version 1.0.0{'\n\n'}
            A Bible reading app with multiple translations,{'\n'}
            devotional content, and study features.
          </Text>
        </View>
      </YStack>
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
