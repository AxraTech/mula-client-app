import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme, ArtMode } from "@/context/ThemeContext";

export function ArtModeToggle() {
  const { mode, setMode, theme, isDigital } = useTheme();
  const slideAnim = useRef(new Animated.Value(isDigital ? 1 : 0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleToggle = (newMode: ArtMode) => {
    if (newMode === mode) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: newMode === "digital" ? 1 : 0,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]),
    ]).start();
    setMode(newMode);
  };

  const thumbLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, "50%"],
  });

  const containerBg = isDigital
    ? "rgba(191, 0, 255, 0.15)"
    : "rgba(139, 105, 20, 0.1)";

  const thumbBg = isDigital
    ? "linear-gradient(135deg, #BF00FF, #00FFCC)"
    : theme.gold;

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <Pressable
        style={[styles.option, mode === "manual" && { backgroundColor: theme.gold }]}
        onPress={() => handleToggle("manual")}
      >
        <Feather name="edit-2" size={14} color={mode === "manual" ? "#fff" : theme.textLight} />
        <Text style={[styles.optionText, { color: mode === "manual" ? "#fff" : theme.textLight }]}>
          Manual
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.option,
          mode === "digital" && { backgroundColor: "#BF00FF" },
        ]}
        onPress={() => handleToggle("digital")}
      >
        <Feather name="zap" size={14} color={mode === "digital" ? "#fff" : theme.textLight} />
        <Text style={[styles.optionText, { color: mode === "digital" ? "#fff" : theme.textLight }]}>
          Digital
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    borderRadius: 24,
    borderWidth: 1,
    padding: 3,
    overflow: "hidden",
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
