import { Tabs } from "expo-router";
import { TamaguiProvider } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import tamaguiConfig from "../tamagui.config";
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
        name="devotional"
        options={{
          title: "Devotional",
          tabBarLabel: "Devotional",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
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
    </Tabs>
  );
}

function ThemedApp() {
  const { isDark } = useAppTheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={isDark ? "dark" : "light"}>
      <BibleProvider>
        <DevotionalProvider>
          <TabLayout />
        </DevotionalProvider>
      </BibleProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
