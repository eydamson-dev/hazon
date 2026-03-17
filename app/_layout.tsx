import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme as useAppTheme } from "../src/store/ThemeContext";
import { BibleProvider } from "../src/store/BibleContext";
import { DevotionalProvider } from "../src/store/DevotionalContext";

function TabLayout() {
  const { isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#304080",
        headerStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
        },
        headerTintColor: isDark ? "#fff" : "#000",
        tabBarStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
        },
        tabBarInactiveTintColor: isDark ? "#888" : "#666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Bible",
          tabBarLabel: "Bible",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journals"
        options={{
          title: "Journal",
          tabBarLabel: "Journal",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="devotional" options={{ href: null }} />
      <Tabs.Screen name="notes" options={{ href: null }} />
      <Tabs.Screen name="note" options={{ href: null }} />
    </Tabs>
  );
}

function ThemedApp() {
  return (
    <BibleProvider>
      <DevotionalProvider>
        <TabLayout />
      </DevotionalProvider>
    </BibleProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
