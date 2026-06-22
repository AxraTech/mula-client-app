import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  TextInput,
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
const SEARCH_DEBOUNCE_MS = 400;

type ArtistSort = "asc" | "desc";

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

function getArtistQueryParams(search: string, sort: ArtistSort) {
  const params: Record<string, string> = { sort };
  const query = search.trim();
  if (query) params.search = query;
  return params;
}

function groupArtistsByLetter(artists: Artist[]) {
  const groups: { letter: string; artists: Artist[] }[] = [];

  for (const artist of artists) {
    const first = artist.name.trim().charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    const last = groups[groups.length - 1];

    if (!last || last.letter !== letter) {
      groups.push({ letter, artists: [artist] });
    } else {
      last.artists.push(artist);
    }
  }

  return groups;
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
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [sortOrder, setSortOrder] = useState<ArtistSort>("asc");

  const scrollViewRef = useRef<ScrollView>(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const searchRef = useRef("");
  const sortRef = useRef<ArtistSort>("asc");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const numColumns = width > 600 ? 3 : 2;
  const cardWidth = (width - 40 - (numColumns - 1) * 14) / numColumns;
  const artistGroups = useMemo(
    () =>
      search.trim()
        ? [{ letter: "", artists }]
        : groupArtistsByLetter(artists),
    [artists, search]
  );

  const reloadArtists = useCallback(
    async (isRefresh = false, options?: { silent?: boolean }) => {
      if (isRefresh) {
        pageRef.current = 1;
        hasMoreRef.current = false;
        setRefreshing(true);
      } else if (!options?.silent) {
        setLoading(true);
      }
      try {
        setError(null);
        const result = await fetchPage(
          "/artists",
          1,
          ITEMS_PER_PAGE,
          getArtistQueryParams(searchRef.current, sortRef.current)
        );
        const mapped = result.items.map(mapArtist);
        setArtists(mapped);
        pageRef.current = 1;
        hasMoreRef.current = result.hasMore;
        setHasMore(result.hasMore);
      } catch {
        setError("Failed to load artists");
      } finally {
        setLoading(false);
        setSearching(false);
        setRefreshing(false);
      }
    },
    []
  );

  const load = reloadArtists;

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const result = await fetchPage(
        "/artists",
        nextPage,
        ITEMS_PER_PAGE,
        getArtistQueryParams(searchRef.current, sortRef.current)
      );
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

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(() => {
      searchRef.current = text;
      pageRef.current = 1;
      hasMoreRef.current = false;
      setSearching(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      load(false, { silent: true });
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setSearch("");
    searchRef.current = "";
    pageRef.current = 1;
    hasMoreRef.current = false;
    setSearching(true);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    reloadArtists(false, { silent: true });
  };

  const handleSortChange = (nextSort: ArtistSort) => {
    if (nextSort === sortOrder) return;
    setSortOrder(nextSort);
    sortRef.current = nextSort;
    pageRef.current = 1;
    hasMoreRef.current = false;
    setSearching(true);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    reloadArtists(false, { silent: true });
  };

  useEffect(() => {
    reloadArtists(false);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [reloadArtists]);

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

        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists by name…"
            placeholderTextColor="#C0C0C0"
            value={search}
            onChangeText={handleSearchChange}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search !== "" && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Feather name="x" size={16} color="#9CA3AF" />
            </Pressable>
          )}
          {searching && <ActivityIndicator size="small" color={GOLD} style={styles.searchSpinner} />}
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by</Text>
          <View style={styles.sortToggle}>
            <Pressable
              style={[styles.sortBtn, sortOrder === "asc" && styles.sortBtnActive]}
              onPress={() => handleSortChange("asc")}
            >
              <Feather
                name="arrow-up"
                size={14}
                color={sortOrder === "asc" ? "#FFFFFF" : "#9CA3AF"}
              />
              <Text style={[styles.sortBtnText, sortOrder === "asc" && styles.sortBtnTextActive]}>
                A–Z
              </Text>
            </Pressable>
            <Pressable
              style={[styles.sortBtn, sortOrder === "desc" && styles.sortBtnActive]}
              onPress={() => handleSortChange("desc")}
            >
              <Feather
                name="arrow-down"
                size={14}
                color={sortOrder === "desc" ? "#FFFFFF" : "#9CA3AF"}
              />
              <Text style={[styles.sortBtnText, sortOrder === "desc" && styles.sortBtnTextActive]}>
                Z–A
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Content */}
      {loading && artists.length === 0 ? (
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
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
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
          {artists.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={40} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No artists found</Text>
              <Text style={styles.emptyText}>
                {search.trim()
                  ? `No results for "${search.trim()}". Try another name.`
                  : "No artists available right now."}
              </Text>
            </View>
          ) : (
            artistGroups.map((group) => (
              <View key={group.letter || "results"} style={styles.section}>
                {!!group.letter && (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLetter}>{group.letter}</Text>
                    <View style={styles.sectionLine} />
                  </View>
                )}
                <View style={styles.grid}>
                  {group.artists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      width={cardWidth}
                    />
                  ))}
                </View>
              </View>
            ))
          )}

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
  brandMark: { fontSize: 21, fontFamily: "Poppins_700Bold", color: "#1A1A2E", letterSpacing: 4 },
  brandSub: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#9CA3AF", letterSpacing: 2, marginTop: 1 },
  divider: { height: 1, backgroundColor: "#D4AF3730", marginBottom: 10 },
  tagline: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#9CA3AF", textAlign: "center" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    backgroundColor: "#FAFAFA",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#1A1A2E",
    paddingVertical: 0,
  },
  searchSpinner: { marginLeft: 2 },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sortLabel: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#9CA3AF",
  },
  sortToggle: {
    flexDirection: "row",
    gap: 8,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    backgroundColor: "#FAFAFA",
  },
  sortBtnActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  sortBtnText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#9CA3AF",
  },
  sortBtnTextActive: {
    color: "#FFFFFF",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  listContent: { paddingBottom: 24 },
  section: { width: "100%" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionLetter: {
    fontSize: 19,
    fontFamily: "Poppins_700Bold",
    color: GOLD,
    minWidth: 18,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D4AF3730",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Poppins_600SemiBold",
    color: "#1A1A2E",
    marginTop: 14,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 21,
  },
  errorText: { fontSize: 16, fontFamily: "Poppins_500Medium", color: "#1A1A2E", marginTop: 14, marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: GOLD },
  retryText: { color: "#FFF", fontSize: 15, fontFamily: "Poppins_700Bold" },

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
    fontSize: 29,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },

  infoContainer: { alignItems: "center", width: "100%" },
  artistName: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 3,
  },
  specialty: {
    fontSize: 12,
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
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: GOLD,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardDivider: { width: "55%", height: 1, backgroundColor: "#D4AF3730", marginBottom: 10 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },

  loadMoreContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 8, width: "100%" },
  loadMoreText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },
  endOfListContainer: { alignItems: "center", paddingVertical: 18, width: "100%" },
  endOfListText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#C0C0C0", letterSpacing: 0.5 },
});
