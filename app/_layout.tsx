import { Tabs } from "expo-router";
import { BibleProvider } from "../src/store/BibleContext";
import { ThemeProvider, useTheme } from "../src/store/ThemeContext";

function TabLayout() {
  const { isDark } = useTheme();

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
        }}
      />
      <Tabs.Screen
        name="devotional"
        options={{
          title: "Devotional",
          tabBarLabel: "Devotional",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BibleProvider>
        <TabLayout />
      </BibleProvider>
    </ThemeProvider>
  );
}