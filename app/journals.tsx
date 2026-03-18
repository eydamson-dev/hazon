import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/store/ThemeContext';
import DevotionalsContent from '../src/components/journals/devotionals';
import NotesContent from '../src/components/journals/notes';

const PRIMARY_COLOR = '#304080';

type JournalSection = 'devotionals' | 'notes';

export default function Journals() {
  const { isDark } = useTheme();
  const [section, setSection] = useState<JournalSection>('devotionals');
  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.sectionTabs}>
        <TouchableOpacity
          style={[styles.sectionTab, section === 'devotionals' && styles.sectionTabActive]}
          onPress={() => setSection('devotionals')}
        >
          <Ionicons
            name="heart"
            size={18}
            color={section === 'devotionals' ? PRIMARY_COLOR : (isDark ? '#888' : '#666')}
            style={styles.sectionTabIcon}
          />
          <Text style={[styles.sectionTabText, section === 'devotionals' && styles.sectionTabTextActive]}>
            Devotionals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, section === 'notes' && styles.sectionTabActive]}
          onPress={() => setSection('notes')}
        >
          <Ionicons
            name="document-text"
            size={18}
            color={section === 'notes' ? PRIMARY_COLOR : (isDark ? '#888' : '#666')}
            style={styles.sectionTabIcon}
          />
          <Text style={[styles.sectionTabText, section === 'notes' && styles.sectionTabTextActive]}>
            Notes
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {section === 'devotionals' ? <DevotionalsContent /> : <NotesContent />}
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  sectionTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  sectionTabActive: {
    borderBottomColor: PRIMARY_COLOR,
  },
  sectionTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#888' : '#666',
  },
  sectionTabTextActive: {
    color: PRIMARY_COLOR,
  },
  sectionTabIcon: {
    marginRight: 4,
  },
  content: {
    flex: 1,
  },
});
