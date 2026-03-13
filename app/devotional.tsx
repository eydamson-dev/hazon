import { View, Text, StyleSheet } from "react-native";

export default function Devotional() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Devotional</Text>
      <Text style={styles.placeholder}>Coming soon...</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 16,
    color: "#999",
  },
});