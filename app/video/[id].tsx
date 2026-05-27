import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { X } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function VideoPlayerScreen() {
  const { id, url } = useLocalSearchParams<{ id: string; url?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDigital } = useTheme();

  const [error, setError] = useState<string | null>(null);

  const videoUrl = url || null;

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.play();
  });

  if (!videoUrl) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            Video not available
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: theme.gold }]}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Close Button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.closeBtn, { top: insets.top + 16 }]}
      >
        <X size={28} color="#FFF" strokeWidth={2} />
      </Pressable>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        {error ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <VideoView
            style={styles.video}
            player={player}
            contentFit="contain"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    zIndex: 100,
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
