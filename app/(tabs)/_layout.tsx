import { Tabs } from "expo-router";
import { Image, Film, ShoppingBag, BookOpen, CalendarDays, Users, type LucideIcon } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/context/ThemeContext";

const TAB_ITEMS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "index", label: "Gallery", Icon: Image },
  { name: "videos", label: "Video", Icon: Film },
  { name: "shop", label: "Shop", Icon: ShoppingBag },
  { name: "artists", label: "Artists", Icon: Users },
  { name: "articles", label: "Articles", Icon: BookOpen },
  { name: "events", label: "Events", Icon: CalendarDays },
];

function TabIcon({
  Icon,
  color,
  focused,
  accentColor,
}: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
  accentColor: string;
}) {
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={[styles.topMark, { backgroundColor: accentColor }]} />}
      <Icon size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
    </View>
  );
}

function TabBarBackground({ isDigital, bg }: { isDigital: boolean; bg: string }) {
  const isIOS = Platform.OS === "ios";
  const hairlineColor = isDigital ? "rgba(255,255,255,0.10)" : "rgba(139,105,20,0.18)";

  return (
    <View style={StyleSheet.absoluteFill}>
      {isIOS ? (
        <BlurView
          intensity={95}
          tint={isDigital ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />
      )}
      <View style={[styles.hairline, { backgroundColor: hairlineColor }]} />
    </View>
  );
}

export default function TabLayout() {
  const { isDigital, theme } = useTheme();
  const { fonts } = theme;
  const isIOS = Platform.OS === "ios";

  const accentColor = isDigital ? "#BF5CFF" : "#8B6914";
  const inactiveColor = isDigital ? "#6E6885" : "#9A8B6B";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: isIOS ? 86 : 68,
          paddingBottom: isIOS ? 28 : 10,
          paddingTop: 12,
          elevation: 0,
        },
        tabBarBackground: () => (
          <TabBarBackground isDigital={isDigital} bg={theme.tabBar} />
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: fonts.medium,
          letterSpacing: 1.8,
          textTransform: "uppercase",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
      }}
    >
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                Icon={tab.Icon}
                color={color}
                focused={focused}
                accentColor={accentColor}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 28,
  },
  topMark: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 1.5,
  },
  hairline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
