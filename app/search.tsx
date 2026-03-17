import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../src/store/ThemeContext";
import { useBible } from "../src/store/BibleContext";
import EmptyState from "../src/components/EmptyState";
import { searchBible, type SearchResult } from "../src/services/bible";
import { useRouter } from "expo-router";

const PRIMARY_COLOR = '#304080';

function HighlightedText({ text, highlight, textStyle, highlightStyle }: { 
  text: string; 
  highlight: string;
  textStyle: object;
  highlightStyle: object;
}) {
  if (!highlight) {
    return <Text style={textStyle}>{text}</Text>;
  }
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <Text style={textStyle} numberOfLines={2}>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={index} style={highlightStyle}>{part}</Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

export default function Search() {
  const { isDark } = useTheme();
  const { selectedVersion } = useBible();
  const router = useRouter();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const styles = createStyles(isDark);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const searchResults = await searchBible(selectedVersion.id, text, 50);
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedVersion.id]);

  const handleResultPress = useCallback((result: SearchResult) => {
    router.push({
      pathname: "/",
      params: { 
        bookId: result.bookId, 
        chapter: result.chapter.toString(),
        verse: result.verse.toString()
      }
    });
  }, [router]);

  const renderResult = useCallback(({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.resultItem} 
      onPress={() => handleResultPress(item)}
    >
      <Text style={styles.resultReference}>
        {item.bookName} {item.chapter}:{item.verse}
      </Text>
      <HighlightedText 
        text={item.text} 
        highlight={query}
        textStyle={styles.resultText}
        highlightStyle={styles.highlight}
      />
    </TouchableOpacity>
  ), [styles, handleResultPress, query]);

  return (
    <View style={[styles.container, { flex: 1 }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Bible verses..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isSearching && (
          <ActivityIndicator 
            color={PRIMARY_COLOR} 
            style={styles.loader} 
          />
        )}
      </View>

      {hasSearched && !isSearching && results.length === 0 && (
        <EmptyState
          icon="search-outline"
          title="No results found"
          subtitle={`Try a different search term`}
        />
      )}

      {results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item, index) => `${item.bookId}-${item.chapter}-${item.verse}-${index}`}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!hasSearched && !isSearching && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Search the Bible</Text>
          <Text style={styles.placeholderText}>
            Enter at least 2 characters to search
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: isDark ? '#fff' : '#000',
  },
  loader: {
    marginLeft: 12,
  },
  resultsList: {
    padding: 12,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: isDark ? '#ccc' : '#666',
    lineHeight: 20,
  },
  highlight: {
    backgroundColor: '#FFF59D',
    color: '#000',
    fontWeight: 'bold',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: isDark ? '#666' : '#999',
    textAlign: 'center',
  },
});
