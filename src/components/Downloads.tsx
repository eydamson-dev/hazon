import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { useTheme } from "../../src/store/ThemeContext";
import { useBible } from "../../src/store/BibleContext";
import { fetchAvailableTranslations, downloadBebliaTranslation, removeDownloadedVersion, type AvailableTranslation } from "../../src/services/bible";

const PRIMARY_COLOR = '#304080';

interface DownloadsScreenProps {
  onClose: () => void;
}

export default function DownloadsScreen({ onClose }: DownloadsScreenProps) {
  const { isDark } = useTheme();
  const { versions, refreshDownloadedVersions } = useBible();
  const [availableTranslations, setAvailableTranslations] = useState<AvailableTranslation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const translations = await fetchAvailableTranslations();
      setAvailableTranslations(translations);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (translation: AvailableTranslation) => {
    setDownloadingId(translation.id);
    try {
      const success = await downloadBebliaTranslation(translation.id);
      if (success) {
        await refreshDownloadedVersions();
        Alert.alert('Success', `${translation.name} downloaded successfully!`);
      } else {
        Alert.alert('Error', 'Failed to download translation');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download translation');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (translation: AvailableTranslation) => {
    Alert.alert(
      'Delete Translation',
      `Are you sure you want to delete ${translation.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeDownloadedVersion(translation.id);
            await refreshDownloadedVersions();
          },
        },
      ]
    );
  };

  const isDownloaded = (id: string) => versions.some(v => v.id === id && v.isDownloaded);

  const downloadedTranslations = availableTranslations.filter(t => isDownloaded(t.id));
  const availableToDownload = availableTranslations.filter(t => !isDownloaded(t.id));
  
  const filteredAvailable = availableToDownload.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadedCount = versions.filter(v => v.isDownloaded).length;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bible Downloads</Text>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.downloadCount}>
          {downloadedCount} translations downloaded
        </Text>
      </View>
      {downloadedCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloaded</Text>
          {downloadedTranslations.map((translation) => (
            <View key={translation.id} style={styles.translationItem}>
              <View style={styles.translationInfo}>
                <Text style={styles.translationName} numberOfLines={1}>
                  {translation.name}
                </Text>
                <Text style={styles.translationSize}>
                  {formatSize(translation.size)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(translation)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Translations</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search translations..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Loading translations...</Text>
          </View>
        ) : (
          <View style={styles.translationList}>
            {filteredAvailable.slice(0, 50).map((translation) => (
              <View key={translation.id} style={styles.translationItem}>
                <View style={styles.translationInfo}>
                  <Text style={styles.translationName} numberOfLines={1}>
                    {translation.name}
                  </Text>
                  <Text style={styles.translationSize}>
                    {formatSize(translation.size)}
                  </Text>
                </View>
                {downloadingId === translation.id ? (
                  <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                ) : (
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownload(translation)}
                  >
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {filteredAvailable.length > 50 ? (
              <Text style={styles.moreText}>
                Showing 50 of {filteredAvailable.length} translations. Use search to find specific translations.
              </Text>
            ) : null}
            {filteredAvailable.length === 0 && searchQuery ? (
              <Text style={styles.noResultsText}>
                No translations found matching "{searchQuery}"
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  countRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  downloadCount: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '600',
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
  searchInput: {
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: isDark ? '#eee' : '#333',
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#e0e0e0',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: isDark ? '#888' : '#666',
  },
  translationList: {
    paddingBottom: 40,
  },
  translationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#e0e0e0',
  },
  translationInfo: {
    flex: 1,
    marginRight: 12,
  },
  translationName: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#eee' : '#333',
  },
  translationSize: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    marginTop: 2,
  },
  downloadButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  moreText: {
    textAlign: 'center',
    color: isDark ? '#888' : '#666',
    padding: 12,
  },
  noResultsText: {
    textAlign: 'center',
    color: isDark ? '#888' : '#666',
    padding: 20,
  },
});
