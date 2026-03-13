import { View, Text, StyleSheet } from "react-native";
import { YStack } from "tamagui";
import { useTheme } from "../src/store/ThemeContext";

const PRIMARY_COLOR = '#304080';

export default function Devotional() {
  const { isDark } = useTheme();
  
  const styles = createStyles(isDark);

  return (
    <YStack style={styles.container} flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Text style={styles.title}>Daily Devotional</Text>
      <Text style={styles.placeholder}>Coming soon...</Text>
    </YStack>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#121212' : '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 16,
    color: isDark ? '#666' : '#999',
  },
});
