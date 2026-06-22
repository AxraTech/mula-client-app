import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Menu, Play, Clock, Eye, Film as FilmIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VIDEOS, Video } from "@/constants/data";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { Sidebar } from "@/components/Sidebar";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/services/api";
import { mapVideo, extractArray } from "@/services/mappers";

const GRID_GAP = 10;
const GRID_PADDING = 16;

// Compact Mode Toggle Component
function CompactModeToggle() {
  const { isDigital, setMode, theme } = useTheme();
  return (
    <View style={styles.compactToggle}>
      <Pressable
        onPress={() => isDigital && setMode("manual")}
        style={[styles.compactToggleBtn, !isDigital && styles.compactToggleActive]}
      >
        <Text style={[styles.compactToggleText, { color: !isDigital ? "#5C4A1E" : "#888" }]}>
          Contemporary
        </Text>
      </Pressable>
      <Pressable
        onPress={() => !isDigital && setMode("digital")}
        style={[styles.compactToggleBtn, isDigital && styles.compactToggleActive]}
      >
        <Text style={[styles.compactToggleText, { color: isDigital ? "#BF00FF" : "#888" }]}>
          Digital
        </Text>
      </Pressable>
    </View>
  );
}

async function fetchVideos(): Promise<Video[]> {
  const res = await api.videos.getAll();
  const arr = extractArray(res);
  if (arr.length === 0) throw new Error("empty");
  return arr.map(mapVideo);
}

export default function VideosScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, isDigital } = useTheme();
  const { fonts } = theme;
  const { isAuthenticated } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const accent = isDigital ? "#BF00FF" : theme.gold;

  const { data: apiVideos, loading, refetch } = useApiData<Video[]>(fetchVideos);

  useEffect(() => {
    if (isAuthenticated) refetch();
  }, [isAuthenticated]);

  const allVideos = loading ? [] : (apiVideos ?? []);

  // Filter by current art mode (traditional vs digital)
  const videos = React.useMemo(() => {
    return allVideos.filter((v) => {
      // If isTraditional is undefined (no API field), show in traditional mode by default
      if (v.isTraditional === undefined) return !isDigital;
      return isDigital ? !v.isTraditional : v.isTraditional;
    });
  }, [allVideos, isDigital]);

  // Split into 2 columns for masonry-style grid (matching gallery wall)
  const { leftCol, rightCol } = React.useMemo(() => {
    const left: Video[] = [];
    const right: Video[] = [];
    videos.forEach((v, i) => {
      (i % 2 === 0 ? left : right).push(v);
    });
    return { leftCol: left, rightCol: right };
  }, [videos]);

  return (
    <AuthGate>
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.hero,
          {
            paddingTop: topPad + 16,
            backgroundColor: theme.bg,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setSidebarOpen(true)}
            hitSlop={8}
          >
            <Menu size={22} color={theme.text} strokeWidth={1.5} />
          </Pressable>

          <View style={styles.brandWrap}>
            <Text
              style={[
                styles.brandMark,
                { color: theme.text, fontFamily: fonts.semiBold },
              ]}
            >
              MULA
            </Text>
            <Text
              style={[
                styles.brandSub,
                { color: theme.textLight, fontFamily: fonts.medium },
              ]}
            >
              ART  ·  VIDEO
            </Text>
          </View>

          {/* Film mode - no shopping cart */}
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Compact Mode Toggle */}
        <CompactModeToggle />

        <Text
          style={[
            styles.tagline,
            { color: theme.textLight, fontFamily: fonts.regular },
          ]}
        >
          Moving Stories Behind Every Brushstroke
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={accent}
          />
        }
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 120 },
        ]}
      >
        <View style={styles.gridRow}>
          {[leftCol, rightCol].map((col, ci) => (
            <View key={ci} style={styles.gridColumn}>
              {col.map((video) => (
                <FilmCard
                  key={video.id}
                  video={video}
                  accent={accent}
                  isDigital={isDigital}
                  theme={theme}
                />
              ))}
            </View>
          ))}
        </View>

        {videos.length === 0 && !loading && (
          <View style={styles.empty}>
            <FilmIcon
              size={40}
              color="rgba(139,105,20,0.3)"
              strokeWidth={1.3}
            />
            <Text
              style={[
                styles.emptyText,
                { color: theme.textLight, fontFamily: fonts.regular },
              ]}
            >
              No films available
            </Text>
          </View>
        )}
      </ScrollView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingBottom: 12 },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWrap: { alignItems: "center" },
  brandMark: { fontSize: 23, letterSpacing: 6 },
  brandSub: { fontSize: 9, letterSpacing: 3, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  tagline: {
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1.2,
    paddingTop: 10,
    paddingBottom: 12,
    fontStyle: "italic",
  },
  compactToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 20,
    padding: 3,
    marginTop: 6,
    alignSelf: "center",
  },
  compactToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 17,
  },
  compactToggleActive: {
    backgroundColor: "#FFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactToggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  content: { paddingTop: 20 },
  gridRow: {
    flexDirection: "row",
    paddingHorizontal: GRID_PADDING,
    gap: GRID_GAP,
  },
  gridColumn: {
    flex: 1,
    gap: 16,
  },
  filmCard: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  filmThumbWrap: {
    width: "100%",
    aspectRatio: 16 / 10,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filmThumb: {
    width: "100%",
    height: "100%",
  },
  filmGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  filmDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  filmDurationText: { color: "#fff", fontSize: 10, letterSpacing: 0.4 },
  filmPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  filmInfo: {
    paddingTop: 10,
    paddingHorizontal: 2,
    gap: 3,
  },
  filmTitle: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  filmArtist: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.4,
  },
  filmMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  filmMetaText: { fontSize: 10, letterSpacing: 0.3 },
  empty: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 14, letterSpacing: 0.3, fontStyle: "italic" },
});

// FilmCard component for grid layout
function FilmCard({
  video,
  accent,
  isDigital,
  theme,
}: {
  video: Video;
  accent: string;
  isDigital: boolean;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  const { fonts } = theme;
  return (
    <Pressable 
      style={styles.filmCard}
      onPress={() => {
        console.log("[Video] Opening:", video.id, video.title, video.url);
        if (video.url) {
          router.push({
            pathname: "/video/[id]",
            params: { id: video.id, url: video.url },
          });
        }
      }}
    >
      <View style={styles.filmThumbWrap}>
        <Image
          source={
            typeof video.thumbnail === "string"
              ? { uri: video.thumbnail }
              : video.thumbnail
          }
          style={styles.filmThumb}
          contentFit="cover"
        />
        <View style={styles.filmGradient} />
        <View
          style={[
            styles.filmPlay,
            { backgroundColor: accent, shadowColor: accent },
          ]}
        >
          <Play
            size={16}
            color={isDigital ? "#000" : "#fff"}
            fill={isDigital ? "#000" : "#fff"}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.filmDuration}>
          <Clock size={9} color="#fff" strokeWidth={1.8} />
          <Text
            style={[styles.filmDurationText, { fontFamily: fonts.medium }]}
          >
            {video.duration}
          </Text>
        </View>
      </View>
      <View style={styles.filmInfo}>
        <Text
          style={[
            styles.filmTitle,
            { color: theme.text, fontFamily: fonts.semiBold },
          ]}
          numberOfLines={2}
        >
          {video.title}
        </Text>
        <Text
          style={[
            styles.filmArtist,
            { color: accent, fontFamily: fonts.medium },
          ]}
          numberOfLines={1}
        >
          {video.artist}
        </Text>
        <View style={styles.filmMeta}>
          <Eye size={9} color={theme.textLight} strokeWidth={1.5} />
          <Text
            style={[
              styles.filmMetaText,
              { color: theme.textLight, fontFamily: fonts.regular },
            ]}
          >
            {video.views.toLocaleString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
