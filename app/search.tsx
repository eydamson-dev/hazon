import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../src/store/ThemeContext";

export default function Search() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Search</Text>
      <Text style={[styles.placeholder, isDark && styles.placeholderDark]}>Search the Bible...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#304080",
    marginBottom: 8,
  },
  titleDark: {
    color: "#fff",
  },
  placeholder: {
    fontSize: 16,
    color: "#999",
  },
  placeholderDark: {
    color: "#666",
  },
});
