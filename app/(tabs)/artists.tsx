import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchPage } from "@/services/api";
import { mapArtist } from "@/services/mappers";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react-native";

const ITEMS_PER_PAGE = 20;

interface Artist {
  id: string;
  name: string;
  avatar?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  specialty?: string;
  specialization?: string;
  location?: string;
  artworkCount?: number;
  followers?: number;
}

export default function ArtistsScreen() {
  const { top: topPad } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);

  const numColumns = width > 600 ? 3 : 2;
  const cardWidth = (width - 40 - (numColumns - 1) * 14) / numColumns;

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      pageRef.current = 1;
      hasMoreRef.current = false;
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      setError(null);
      const result = await fetchPage("/artists", 1, ITEMS_PER_PAGE);
      const mapped = result.items.map(mapArtist);
      setArtists(mapped);
      pageRef.current = 1;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
    } catch {
      setError("Failed to load artists");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const result = await fetchPage("/artists", nextPage, ITEMS_PER_PAGE);
      const mapped = result.items.map(mapArtist);
      setArtists((prev) => [...prev, ...mapped]);
      pageRef.current = nextPage;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
    } catch {
      // silent fail on load more
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <Pressable style={styles.menuBtn} onPress={() => setSidebarOpen(true)} hitSlop={8}>
            <Menu size={22} color="#1A1A2E" strokeWidth={1.5} />
          </Pressable>
          <View style={styles.brandWrap}>
            <Text style={styles.brandMark}>MULA</Text>
            <Text style={styles.brandSub}>ART  ·  ARTISTS</Text>
          </View>
          <Pressable style={styles.menuBtn} onPress={() => load(true)}>
            <Feather name="refresh-cw" size={20} color="#1A1A2E" />
          </Pressable>
        </View>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Discover talented artists and their creative journey</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={GOLD} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="users" size={48} color="#E5E7EB" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => load(false)}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#D4AF37"
              colors={["#D4AF37"]}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 300) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              width={cardWidth}
            />
          ))}

          {loadingMore && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={GOLD} />
              <Text style={styles.loadMoreText}>Loading more artists...</Text>
            </View>
          )}
          {!hasMore && artists.length > 0 && !loadingMore && (
            <View style={styles.endOfListContainer}>
              <Text style={styles.endOfListText}>— You've reached the end —</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </View>
  );
}

const GOLD = "#D4AF37";

function resolveArtistImageUri(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.uri && typeof val.uri === "string") return val.uri;
  return null;
}

function ArtistCard({ artist, width }: { artist: Artist; width: number }) {
  const imageUri =
    resolveArtistImageUri(artist.avatar) ??
    resolveArtistImageUri(artist.image) ??
    resolveArtistImageUri(artist.thumbnail) ??
    null;

  const initials = artist.name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const specialty = artist.specialty ?? artist.specialization ?? "";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width, opacity: pressed ? 0.92 : 1, transform: pressed ? [{ scale: 0.97 }] : [{ scale: 1 }] },
      ]}
      onPress={() => router.push(`/artist/${artist.id}`)}
    >
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {/* Outer decorative ring */}
        <View style={styles.avatarOuterRing}>
          <View style={styles.avatarInnerRing}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={350}
              />
            ) : (
              <LinearGradient
                colors={["#EDE4C0", "#C4952A"]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.portraitInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
        {!!specialty && (
          <Text style={styles.specialty} numberOfLines={1}>{specialty}</Text>
        )}
        {/* Gold underline accent */}
        <View style={styles.goldAccent} />
        <Text style={styles.viewLabel}>View Profile</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  menuBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  brandWrap: { alignItems: "center" },
  brandMark: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#1A1A2E", letterSpacing: 4 },
  brandSub: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#9CA3AF", letterSpacing: 2, marginTop: 1 },
  divider: { height: 1, backgroundColor: "#D4AF3730", marginBottom: 10 },
  tagline: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#9CA3AF", textAlign: "center" },

  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 15, fontFamily: "Poppins_500Medium", color: "#1A1A2E", marginTop: 14, marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: GOLD },
  retryText: { color: "#FFF", fontSize: 14, fontFamily: "Poppins_700Bold" },

  grid: { padding: 16, flexDirection: "row", flexWrap: "wrap", gap: 16 },

  card: {
    borderRadius: 20,
    backgroundColor: "#FFFDF7",
    alignItems: "center",
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#EAE0C8",
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },

  avatarWrapper: { marginBottom: 14 },
  avatarOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: "#D4AF3780",
    padding: 4,
    backgroundColor: "#FFF8E7",
    ...Platform.select({
      ios: { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  avatarInnerRing: {
    flex: 1,
    borderRadius: 44,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  portraitInitials: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },

  infoContainer: { alignItems: "center", width: "100%" },
  artistName: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 3,
  },
  specialty: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 10,
  },
  goldAccent: {
    width: 32,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: GOLD,
    opacity: 0.6,
    marginBottom: 8,
  },
  viewLabel: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
    color: GOLD,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardDivider: { width: "55%", height: 1, backgroundColor: "#D4AF3730", marginBottom: 10 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },

  loadMoreContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 8, width: "100%" },
  loadMoreText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },
  endOfListContainer: { alignItems: "center", paddingVertical: 18, width: "100%" },
  endOfListText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#C0C0C0", letterSpacing: 0.5 },
});
