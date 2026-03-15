import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Spinner } from 'tamagui';
import { useTheme } from '../src/store/ThemeContext';
import { useDevotional } from '../src/store/DevotionalContext';
import { useBible } from '../src/store/BibleContext';
import type { Devotion, VerseRef } from '../src/types/devotional';

const PRIMARY_COLOR = '#304080';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type ViewMode = 'list' | 'calendar' | 'trash';

export default function Devotional() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { devotions, trash, isLoading, deleteDevotion, restoreDevotion, permanentlyDeleteDevotion, emptyTrash, createDevotion, updateDevotion } = useDevotional();
  const { selectedVersion, books } = useBible();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDevotion, setSelectedDevotion] = useState<Devotion | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVerseRefs, setEditVerseRefs] = useState<VerseRef[]>([]);
  const [refreshingVerses, setRefreshingVerses] = useState(false);

  const styles = createStyles(isDark);

  const refreshVerseTexts = async () => {
    if (!selectedDevotion || selectedDevotion.verseRefs.length === 0) return;
    
    setRefreshingVerses(true);
    try {
      const { getBebliaChapter } = await import('../src/services/bible');
      const updatedVerseRefs: VerseRef[] = [];
      
      for (const verseRef of selectedDevotion.verseRefs) {
        const bookNumber = parseInt(verseRef.bookId.replace('xml_', ''), 10);
        const chapterData = await getBebliaChapter(selectedVersion.id, bookNumber, verseRef.chapter);
        
        if (chapterData) {
          const verseTexts: string[] = [];
          for (const verseNum of verseRef.verses) {
            const verse = chapterData.chapter.content.find(
              (c: any) => c.type === 'verse' && c.number === verseNum
            );
            if (verse) {
              const text = verse.content?.map((c: any) => typeof c === 'string' ? c : c.text).join(' ');
              verseTexts.push(text || '');
            }
          }
          
          updatedVerseRefs.push({
            ...verseRef,
            text: verseTexts.join(' '),
            translationId: selectedVersion.id,
            translationName: selectedVersion.name,
          });
        } else {
          updatedVerseRefs.push(verseRef);
        }
      }
      
      setEditVerseRefs(updatedVerseRefs);
    } catch (error) {
      console.error('Error refreshing verse texts:', error);
    } finally {
      setRefreshingVerses(false);
    }
  };

  useEffect(() => {
    if (selectedDevotion && selectedDevotion.verseRefs.length > 0) {
      refreshVerseTexts();
    }
  }, [selectedVersion.id, selectedDevotion?.id]);

  const devotionDates = useMemo(() => {
    const dates = new Set<string>();
    devotions.forEach(d => {
      dates.add(d.createdAt.split('T')[0]);
    });
    return dates;
  }, [devotions]);

  const getDevotionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return devotions.filter(d => d.createdAt.split('T')[0] === dateStr);
  };

  const handleDelete = async (devotion: Devotion) => {
    const success = await deleteDevotion(devotion.id);
    if (!success) {
      Alert.alert('Error', 'Failed to delete devotion');
    }
  };

  const handleRestore = async (devotion: Devotion) => {
    const success = await restoreDevotion(devotion.id);
    if (!success) {
      Alert.alert('Error', 'Failed to restore devotion');
    }
  };

  const handlePermanentDelete = async (devotion: Devotion) => {
    const success = await permanentlyDeleteDevotion(devotion.id);
    if (!success) {
      Alert.alert('Error', 'Failed to delete devotion');
    }
  };

  const handleEmptyTrash = async () => {
    const success = await emptyTrash();
    if (!success) {
      Alert.alert('Error', 'Failed to empty trash');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedDevotion || !editTitle.trim() || !editContent.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const success = await updateDevotion(selectedDevotion.id, editTitle.trim(), editContent.trim(), editVerseRefs);
    if (success) {
      setSelectedDevotion(null);
    } else {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleRemoveVerse = (index: number) => {
    const newRefs = [...editVerseRefs];
    newRefs.splice(index, 1);
    setEditVerseRefs(newRefs);
  };

  const handleAddVerse = () => {
    setSelectedDevotion(null);
    router.push('/');
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <Text style={styles.calendarNav}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <Text style={styles.calendarNav}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.calendarDays}>
          {DAYS.map(day => (
            <Text key={day} style={styles.calendarDayName}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (day === null) return <View key={index} style={styles.calendarDay} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasDevotion = devotionDates.has(dateStr);
            const isToday = dateStr === today;
            const dayDevotions = getDevotionsForDate(new Date(year, month, day));
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  hasDevotion && styles.calendarDayHasDevotion,
                  isToday && styles.calendarDayToday,
                ]}
                onPress={() => dayDevotions.length > 0 && dayDevotions[0] && setSelectedDevotion(dayDevotions[0])}
              >
                <Text style={[styles.calendarDayText, hasDevotion && styles.calendarDayTextActive]}>
                  {day}
                </Text>
                {hasDevotion && <View style={styles.calendarDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDevotionCard = (devotion: Devotion, isTrash: boolean = false) => (
    <View key={devotion.id} style={styles.devotionCard}>
      <TouchableOpacity
        style={styles.devotionCardContent}
        onPress={() => {
          if (isTrash) return;
          setSelectedDevotion(devotion);
          setEditTitle(devotion.title);
          setEditContent(devotion.content);
          setEditVerseRefs([...devotion.verseRefs]);
        }}
        disabled={isTrash}
      >
        <View style={styles.devotionCardHeader}>
          <Text style={styles.devotionTitle} numberOfLines={1}>{devotion.title}</Text>
          <Text style={styles.devotionDate}>
            {new Date(devotion.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.devotionContent} numberOfLines={2}>{devotion.content}</Text>
        {devotion.verseRefs.length > 0 && (
          <Text style={styles.devotionVerseRefs}>
            {devotion.verseRefs.map(v => {
              const translationLabel = v.translationName ? `(${v.translationName}) ` : '';
              return `${translationLabel}${v.bookName} ${v.chapter}:${v.verses.join(',')}`;
            }).join(' | ')}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.devotionActions}>
        {isTrash ? (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleRestore(devotion)}>
              <Text style={styles.restoreButton}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handlePermanentDelete(devotion)}>
              <Text style={styles.deleteButton}>Delete Forever</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(devotion)}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCreateModal = () => (
    <Modal visible={showCreateModal} animationType="slide">
      <View style={styles.createModalContainer}>
        <View style={styles.createModalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.createModalTitle}>New Devotion</Text>
          <View style={{ width: 60 }} />
        </View>
        <CreateDevotionForm onClose={() => setShowCreateModal(false)} />
      </View>
    </Modal>
  );

  const renderDetailModal = () => (
    <Modal visible={!!selectedDevotion} animationType="slide">
      <View style={styles.createModalContainer}>
        <View style={styles.createModalHeader}>
          <TouchableOpacity onPress={() => setSelectedDevotion(null)}>
            <Text style={styles.cancelButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.createModalTitle}>Edit Devotion</Text>
          <TouchableOpacity onPress={handleSaveEdit}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.editForm}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.input}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Enter title..."
            placeholderTextColor={isDark ? '#666' : '#999'}
          />
          <Text style={styles.inputLabel}>Reflection</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editContent}
            onChangeText={setEditContent}
            placeholder="Write your reflection..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
          <View style={styles.versesHeader}>
            <Text style={styles.inputLabel}>Verses</Text>
            <TouchableOpacity onPress={handleAddVerse}>
              <Text style={styles.addVerseButton}>+ Add Verse</Text>
            </TouchableOpacity>
          </View>
          {editVerseRefs.length > 0 ? (
            editVerseRefs.map((v, i) => (
              <View key={i} style={styles.verseRefBox}>
                <View style={styles.verseRefRow}>
                  <Text style={styles.verseRefText}>
                    {v.translationName ? `(${v.translationName}) ` : ''}{v.bookName} {v.chapter}:{v.verses.join(',')}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveVerse(i)}>
                    <Text style={styles.removeVerseButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                {refreshingVerses ? (
                  <ActivityIndicator size="small" color={PRIMARY_COLOR} style={styles.verseLoading} />
                ) : (
                  v.text && <Text style={styles.verseText}>{v.text}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noVersesText}>No verses added. Tap "+ Add Verse" to add verses from the Bible.</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <YStack style={styles.container} flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color={PRIMARY_COLOR} />
      </YStack>
    );
  }

  return (
    <YStack style={styles.container} flex={1}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, viewMode === 'list' && styles.tabActive]} onPress={() => setViewMode('list')}>
          <Text style={[styles.tabText, viewMode === 'list' && styles.tabTextActive]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, viewMode === 'calendar' && styles.tabActive]} onPress={() => setViewMode('calendar')}>
          <Text style={[styles.tabText, viewMode === 'calendar' && styles.tabTextActive]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, viewMode === 'trash' && styles.tabActive]} onPress={() => setViewMode('trash')}>
          <Text style={[styles.tabText, viewMode === 'trash' && styles.tabTextActive]}>Trash {trash.length > 0 && `(${trash.length})`}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {viewMode === 'list' && (
          <ScrollView>
            {devotions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No devotions yet</Text>
                <Text style={styles.emptySubtext}>Tap + to create your first devotion</Text>
              </View>
            ) : (
              devotions.map(d => renderDevotionCard(d))
            )}
          </ScrollView>
        )}

        {viewMode === 'calendar' && renderCalendar()}

        {viewMode === 'trash' && (
          <ScrollView>
            {trash.length > 0 && (
              <TouchableOpacity style={styles.emptyTrashButton} onPress={handleEmptyTrash}>
                <Text style={styles.emptyTrashText}>Empty Trash</Text>
              </TouchableOpacity>
            )}
            {trash.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Trash is empty</Text>
              </View>
            ) : (
              trash.map(d => renderDevotionCard(d, true))
            )}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {renderCreateModal()}
      {renderDetailModal()}
    </YStack>
  );
}

function CreateDevotionForm({ onClose }: { onClose: () => void }) {
  const { isDark } = useTheme();
  const { createDevotion } = useDevotional();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const styles = createStyles(isDark);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your reflection');
      return;
    }

    setIsSaving(true);
    try {
      const success = await createDevotion(title.trim(), content.trim(), []);
      if (success) {
        onClose();
      } else {
        Alert.alert('Error', 'Failed to save devotion');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save devotion');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.editForm}>
      <Text style={styles.inputLabel}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter devotion title..."
        placeholderTextColor={isDark ? '#666' : '#999'}
      />
      <Text style={styles.inputLabel}>Reflection</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Write your reflection..."
        placeholderTextColor={isDark ? '#666' : '#999'}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
      />
      <TouchableOpacity style={styles.saveButtonFull} onPress={handleSave} disabled={isSaving}>
        <Text style={styles.saveButtonFullText}>{isSaving ? 'Saving...' : 'Save Devotion'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#aaa' : '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDark ? '#666' : '#999',
    textAlign: 'center',
  },
  devotionCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 12,
  },
  devotionCardContent: {
    marginBottom: 8,
  },
  devotionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  devotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
    flex: 1,
  },
  devotionDate: {
    fontSize: 12,
    color: isDark ? '#888' : '#999',
    marginLeft: 8,
  },
  devotionContent: {
    fontSize: 14,
    color: isDark ? '#ccc' : '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  devotionVerseRefs: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontStyle: 'italic',
  },
  devotionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  deleteButton: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
  restoreButton: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  calendarContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNav: {
    fontSize: 20,
    color: PRIMARY_COLOR,
    paddingHorizontal: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
  },
  calendarDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayHasDevotion: {},
  calendarDayToday: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: isDark ? '#fff' : '#000',
  },
  calendarDayTextActive: {
    fontWeight: '600',
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLOR,
    position: 'absolute',
    bottom: 4,
  },
  emptyTrashButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyTrashText: {
    color: '#fff',
    fontWeight: '600',
  },
  createModalContainer: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: isDark ? '#888' : '#666',
    width: 60,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    width: 60,
    textAlign: 'right',
  },
  editForm: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#aaa' : '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: isDark ? '#fff' : '#000',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  verseRefBox: {
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  versesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  verseRefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addVerseButton: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  removeVerseButton: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 12,
  },
  noVersesText: {
    fontSize: 14,
    color: isDark ? '#666' : '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  verseRefText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  verseText: {
    fontSize: 14,
    color: isDark ? '#ccc' : '#333',
    fontStyle: 'italic',
    marginTop: 4,
  },
  verseLoading: {
    marginTop: 8,
  },
  saveButtonFull: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonFullText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
