import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Menu, ImageIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Artwork } from "@/constants/data";
import { GalleryPainting } from "@/components/GalleryWall";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";
import { Sidebar } from "@/components/Sidebar";
import { useDataStore } from "@/context/DataStoreContext";
import { useAuth } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  api,
  fetchPage,
  fetchTraditionalCategories,
  MediumCategory,
  PaginatedResult,
} from "@/services/api";
import {
  mapTraditionalArtwork,
  mapDigitalArtwork,
} from "@/services/mappers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ALL_FILTER_ID = "__all__";

const ITEMS_PER_PAGE = 20;

type ArtMode = "traditional" | "digital";

async function fetchArtworksPage(
  page: number,
  mode: ArtMode,
  mediumTypeId: string | null
): Promise<PaginatedResult<Artwork>> {
  const path = mode === "digital" ? "/artworks/digital" : "/artworks/traditional";
  const params = mediumTypeId ? { medium_type_id: mediumTypeId } : {};

  const data = await fetchPage(path, page, ITEMS_PER_PAGE, params);

  const mapper = mode === "digital" ? mapDigitalArtwork : mapTraditionalArtwork;
  const items = (data?.items ?? []).map((item: any, i: number) =>
    mapper(item, i)
  );

  return {
    items,
    hasMore: data?.hasMore ?? false,
    total: data?.total ?? null,
    totalPages: data?.totalPages ?? null,
  };
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [filterId, setFilterId] = useState<string>(ALL_FILTER_ID);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<MediumCategory[]>([]);
  const [traditionalCategories, setTraditionalCategories] = useState<MediumCategory[]>([]);
  const { isLiked } = useWishlist();
  const { theme, isDigital, setMode } = useTheme();
  const { setArtworks: storeArtworks } = useDataStore();

  // Mode switch animation
  const fabRotate = useRef(new Animated.Value(isDigital ? 1 : 0)).current;

  const handleModeToggle = () => {
    const newMode = isDigital ? "manual" : "digital";

    // Animate indicator slide
    Animated.spring(fabRotate, {
      toValue: newMode === "digital" ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Toggle mode
    setMode(newMode);
  };
  const { isAuthenticated } = useAuth();
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Refs to avoid stale closures in async fetchers
  const pageRef = React.useRef(1);
  const hasMoreRef = React.useRef(true);
  const loadingRef = React.useRef(false);
  const loadingMoreRef = React.useRef(false);
  const filterIdRef = React.useRef<string>(ALL_FILTER_ID);
  const modeRef = React.useRef<ArtMode>(isDigital ? "digital" : "traditional");
  const initialLoadedRef = React.useRef(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const currentMediumId = (id: string) => (id === ALL_FILTER_ID ? null : id);

  const load = React.useCallback(async (isRefresh = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchArtworksPage(
        1,
        modeRef.current,
        currentMediumId(filterIdRef.current)
      );
      setArtworks(result.items);
      pageRef.current = 1;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
      storeArtworks(result.items);
    } catch {
      // keep existing data
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeArtworks]);

  const loadMore = React.useCallback(async () => {
    if (
      loadingMoreRef.current ||
      loadingRef.current ||
      !hasMoreRef.current
    )
      return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    const requestFilter = filterIdRef.current;
    const requestMode = modeRef.current;

    try {
      const result = await fetchArtworksPage(
        nextPage,
        requestMode,
        currentMediumId(requestFilter)
      );

      // Discard if filter or mode changed mid-flight
      if (
        filterIdRef.current !== requestFilter ||
        modeRef.current !== requestMode
      )
        return;

      setArtworks((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newItems = result.items.filter((it) => !existingIds.has(it.id));
        return newItems.length ? [...prev, ...newItems] : prev;
      });

      pageRef.current = nextPage;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
    } catch {
      // keep existing data
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  // Reload when filter changes
  const handleSelectFilter = React.useCallback(
    (id: string) => {
      if (id === filterIdRef.current) return;
      filterIdRef.current = id;
      setFilterId(id);
      pageRef.current = 1;
      hasMoreRef.current = true;
      setHasMore(true);
      setArtworks([]);
      load(false);
    },
    [load]
  );

  // Initial load (only once per auth) — also fetch traditional categories
  useEffect(() => {
    if (isAuthenticated && !initialLoadedRef.current) {
      initialLoadedRef.current = true;
      fetchTraditionalCategories()
        .then((cats) => {
          setTraditionalCategories(cats);
          // Apply categories for current mode
          if (modeRef.current === "traditional") setCategories(cats);
        })
        .catch(() => setTraditionalCategories([]));
      load(false);
    }
  }, [isAuthenticated, load]);

  // Reload + reset whenever art mode (isDigital) toggles
  useEffect(() => {
    if (!initialLoadedRef.current) return;
    const newMode: ArtMode = isDigital ? "digital" : "traditional";
    if (modeRef.current === newMode) return;
    modeRef.current = newMode;
    filterIdRef.current = ALL_FILTER_ID;
    setFilterId(ALL_FILTER_ID);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    setArtworks([]);
    setCategories(newMode === "traditional" ? traditionalCategories : []);
    load(false);
  }, [isDigital, load, traditionalCategories]);

  // Memoized columns to avoid recomputing on every render
  const { leftCol, rightCol } = React.useMemo(() => {
    const seen = new Set<string>();
    const unique: Artwork[] = [];
    for (const a of artworks) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        unique.push(a);
      }
    }
    const left: Artwork[] = [];
    const right: Artwork[] = [];
    for (let i = 0; i < unique.length; i++) {
      (i % 2 === 0 ? left : right).push(unique[i]);
    }
    return { leftCol: left, rightCol: right };
  }, [artworks]);

  const wallBg = isDigital ? "#0D0D1A" : "#EDE8DC";
  const accent = isDigital ? "#BF00FF" : theme.gold;

  if (loading && artworks.length === 0) return <AuthGate><LoadingScreen /></AuthGate>;

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
            <Text style={[styles.brandMark, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
              MULA
            </Text>
            <Text style={[styles.brandSub, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>
              ART  ·  GALLERY
            </Text>
          </View>

          {/* Gallery mode - no shopping cart, but need spacer for center alignment */}
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Compact Mode Toggle */}
        <View style={styles.compactToggle}>
          <Pressable
            onPress={() => isDigital && handleModeToggle()}
            style={[styles.compactToggleBtn, !isDigital && styles.compactToggleActive]}
          >
            <Text style={[styles.compactToggleText, { color: !isDigital ? "#5C4A1E" : "#888" }]}>
              Manual
            </Text>
          </Pressable>
          <Pressable
            onPress={() => !isDigital && handleModeToggle()}
            style={[styles.compactToggleBtn, isDigital && styles.compactToggleActive]}
          >
            <Text style={[styles.compactToggleText, { color: isDigital ? "#BF00FF" : "#888" }]}>
              Digital
            </Text>
          </Pressable>
        </View>

        <Text
          style={[
            styles.tagline,
            { color: theme.textLight, fontFamily: theme.fonts.regular },
          ]}
        >
          Timeless Art For An Ever-Changing World
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: ALL_FILTER_ID, name: "All" },
            ...categories,
          ].map((c) => {
            const active = filterId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => handleSelectFilter(c.id)}
                style={[
                  styles.filterChip,
                  {
                    borderColor: active ? accent : theme.border,
                    backgroundColor: "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: active ? accent : theme.textLight,
                      fontFamily: active
                        ? theme.fonts.semiBold
                        : theme.fonts.medium,
                    },
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
          {loading && (
            <ActivityIndicator
              size="small"
              color={accent}
              style={{ marginLeft: 6 }}
            />
          )}
        </ScrollView>

      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={accent}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const scrollPosition = layoutMeasurement.height + contentOffset.y;
          const triggerPosition = contentSize.height - 400;

          if (scrollPosition >= triggerPosition && hasMore && !loadingMore && !loading) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
        contentContainerStyle={[
          styles.galleryWall,
          {
            backgroundColor: wallBg,
            paddingBottom:
              Platform.OS === "web" ? 120 : insets.bottom + 120,
          },
        ]}
      >
        <View style={styles.wallColumns}>
          {[leftCol, rightCol].map((col, colIdx) => (
            <View key={colIdx} style={styles.column}>
              {col.map((artwork, idx) => (
                <GalleryPainting
                  key={artwork.id}
                  artwork={artwork}
                  index={colIdx * 100 + idx}
                  onPress={() =>
                    router.push({
                      pathname: "/artwork/[id]",
                      params: { id: artwork.id, from: "gallery" },
                    })
                  }
                  isLiked={isLiked(artwork.id)}
                />
              ))}
            </View>
          ))}
        </View>

        {artworks.length === 0 && !loading && (
          <View style={styles.empty}>
            <ImageIcon size={40} color="rgba(139,105,20,0.3)" strokeWidth={1.3} />
            <Text style={[styles.emptyText, { color: theme.textLight }]}>
              No artworks found
            </Text>
          </View>
        )}

        {/* Load More Indicator */}
        {loadingMore && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={accent} />
            <Text style={[styles.loadMoreText, { color: theme.textLight }]}>
              Loading more artworks...
            </Text>
          </View>
        )}

        {/* End of List Indicator */}
        {!hasMore && artworks.length > 0 && !loadingMore && (
          <View style={styles.loadMoreContainer}>
            <Text style={[styles.loadMoreText, { color: theme.textLight }]}>
              — You've reached the end —
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
  brandWrap: {
    alignItems: "center",
  },
  brandMark: {
    fontSize: 22,
    letterSpacing: 6,
  },
  brandSub: {
    fontSize: 8,
    letterSpacing: 3,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  tagline: {
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 1.2,
    paddingTop: 14,
    paddingBottom: 16,
    fontStyle: "italic",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterText: { fontSize: 11, letterSpacing: 0.5 },
  galleryWall: { minHeight: "100%" },
  wallColumns: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 16,
    gap: 8,
  },
  column: { flex: 1, gap: 16 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  loadMoreText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  compactToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 20,
    padding: 3,
    marginTop: 8,
    marginBottom: 4,
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
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: "600",
  },
});
