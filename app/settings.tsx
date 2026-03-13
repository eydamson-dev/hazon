import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useTheme } from "../src/store/ThemeContext";
import { ThemeMode } from "../src/services/theme";

export default function Settings() {
  const { theme, isDark, setTheme } = useTheme();

  const themeOptions: { label: string; value: ThemeMode; description: string }[] = [
    { label: 'Light', value: 'light', description: 'Always use light mode' },
    { label: 'Dark', value: 'dark', description: 'Always use dark mode' },
    { label: 'System', value: 'system', description: 'Follow system settings' },
  ];

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Settings</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Appearance</Text>
        
        <Text style={[styles.label, isDark && styles.labelDark]}>Theme</Text>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.themeOption,
              theme === option.value && styles.themeOptionSelected,
              isDark && styles.themeOptionDark,
            ]}
            onPress={() => setTheme(option.value)}
          >
            <View>
              <Text
                style={[
                  styles.themeOptionText,
                  theme === option.value && styles.themeOptionTextSelected,
                  isDark && styles.themeOptionTextDark,
                ]}
              >
                {option.label}
              </Text>
              <Text style={[styles.themeOptionDesc, isDark && styles.themeOptionDescDark]}>
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
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>About</Text>
        <Text style={[styles.aboutText, isDark && styles.aboutTextDark]}>
          CJCRSG Bible App{'\n'}
          Version 1.0.0{'\n\n'}
          A Bible reading app with multiple translations,{'\n'}
          devotional content, and study features.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#304080',
    padding: 20,
    paddingBottom: 10,
  },
  titleDark: {
    color: '#fff',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionTitleDark: {
    color: '#888',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelDark: {
    color: '#eee',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  themeOptionDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  themeOptionSelected: {
    borderColor: '#304080',
    backgroundColor: '#f0f4ff',
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  themeOptionTextDark: {
    color: '#eee',
  },
  themeOptionTextSelected: {
    color: '#304080',
  },
  themeOptionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  themeOptionDescDark: {
    color: '#888',
  },
  checkmark: {
    fontSize: 18,
    color: '#304080',
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  aboutTextDark: {
    color: '#888',
    backgroundColor: '#1e1e1e',
  },
});
