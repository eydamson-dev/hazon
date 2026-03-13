import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { BibleProvider } from "../src/store/BibleContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <BibleProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#304080",
          tabBarInactiveTintColor: "#666",
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
          },
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
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
    </BibleProvider>
  );
}