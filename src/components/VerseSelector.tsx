import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface VerseSelectorProps {
  totalVerses: number;
  selectedVerse: number;
  isDark: boolean;
  onSelect: (verse: number) => void;
  onClose: () => void;
}

const PRIMARY_COLOR = '#304080';

export default function VerseSelector({ totalVerses, selectedVerse, isDark, onSelect, onClose }: VerseSelectorProps) {
  const verses = Array.from({ length: totalVerses }, (_, i) => i + 1);

  return (
    <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select Verse</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.modalContent}>
        <View style={styles.verseGrid}>
          {verses.map((verse) => (
            <TouchableOpacity
              key={verse}
              style={[
                styles.verseItem,
                isDark && styles.verseItemDark,
                selectedVerse === verse && styles.verseItemSelected,
              ]}
              onPress={() => onSelect(verse)}
            >
              <Text
                style={[
                  styles.verseItemText,
                  isDark && styles.verseItemTextDark,
                  selectedVerse === verse && styles.verseItemTextSelected,
                ]}
              >
                {verse}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainerDark: {
    backgroundColor: '#121212',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTitleDark: {
    color: '#fff',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  closeButtonDark: {
    color: '#fff',
  },
  modalContent: {
    flex: 1,
  },
  verseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  verseItem: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  verseItemDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  verseItemSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  verseItemText: {
    fontSize: 14,
    color: '#333',
  },
  verseItemTextDark: {
    color: '#fff',
  },
  verseItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
