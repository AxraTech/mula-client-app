import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Menu, ImageIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Artwork } from "@/constants/data";
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
type ArtworkRow = [Artwork, Artwork | null];

const CARD_W = Math.round(SCREEN_WIDTH * 0.42);
const CARD_H = Math.round(CARD_W * 1.35);
const FRAME_BORDER = 5;
const FRAME_PAD = 2;
const IMG_W = CARD_W - (FRAME_BORDER + FRAME_PAD) * 2;
const IMG_H = CARD_H - (FRAME_BORDER + FRAME_PAD) * 2;
const ROW_HEIGHT = 24 + CARD_H + 60 + 16;

async function fetchArtworksPage(
  page: number,
  mode: ArtMode,
  mediumTypeId: string | null
): Promise<PaginatedResult<Artwork>> {
  const path = mode === "digital" ? "/artworks/digital" : "/artworks/traditional";
  const params = mediumTypeId ? { medium_type_id: mediumTypeId } : {};
  const data = await fetchPage(path, page, ITEMS_PER_PAGE, params);
  const mapper = mode === "digital" ? mapDigitalArtwork : mapTraditionalArtwork;
  const items = (data?.items ?? []).map((item: any, i: number) => mapper(item, i));
  return {
    items,
    hasMore: data?.hasMore ?? false,
    total: data?.total ?? null,
    totalPages: data?.totalPages ?? null,
  };
}

/* ─── Lightweight card (no context hooks, no deep nesting) ─── */
const GalleryCard = React.memo(function GalleryCard({
  artwork,
  isLiked,
  digital,
}: {
  artwork: Artwork;
  isLiked: boolean;
  digital: boolean;
}) {
  const frameColor = digital ? "#2A1A4E" : "#C4A96B";
  const frameBg = digital ? "#1A0A2E" : "#D4B97B";
  const labelBg = digital ? "#12121E" : "#FFFDF7";
  const labelBorder = digital ? "#2A2040" : "#E0D8C8";
  const textColor = digital ? "#E0D0F0" : "#1A1A2E";
  const subtextColor = digital ? "#A090C0" : "#8C8476";
  const hookColor = digital ? "#7B00CC" : "#B8A080";

  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.stringWrap}>
        <View style={[cardStyles.hook, { backgroundColor: hookColor }]} />
        <View style={[cardStyles.string, { backgroundColor: hookColor }]} />
      </View>

      <Pressable
        onPress={() => router.push({ pathname: "/artwork/[id]", params: { id: artwork.id, from: "gallery" } })}
        style={[cardStyles.frame, { borderColor: frameColor, backgroundColor: frameBg }]}
      >
        <Image
          source={artwork.image}
          style={cardStyles.image}
          contentFit="cover"
          recyclingKey={artwork.id}
          cachePolicy="disk"
          transition={0}
        />
        {artwork.isSoldOut && (
          <View style={cardStyles.soldBadge}>
            <Text style={cardStyles.soldText}>SOLD</Text>
          </View>
        )}
        {isLiked && (
          <View style={cardStyles.heartBadge}>
            <Text style={cardStyles.heartIcon}>♥</Text>
          </View>
        )}
      </Pressable>

      <View style={[cardStyles.label, { backgroundColor: labelBg, borderColor: labelBorder }]}>
        <Text style={[cardStyles.title, { color: textColor }]} numberOfLines={1}>{artwork.title}</Text>
        <Text style={[cardStyles.artist, { color: subtextColor }]} numberOfLines={1}>{artwork.artist}</Text>
      </View>
    </View>
  );
}, (prev, next) =>
  prev.artwork.id === next.artwork.id &&
  prev.isLiked === next.isLiked &&
  prev.digital === next.digital
);

/* ─── Row component with its own wishlist subscription ─── */
const GalleryRow = React.memo(function GalleryRow({
  row,
  digital,
}: {
  row: ArtworkRow;
  digital: boolean;
}) {
  const { isLiked } = useWishlist();
  return (
    <View style={styles.row}>
      <View style={styles.rowCell}>
        <GalleryCard artwork={row[0]} isLiked={isLiked(row[0].id)} digital={digital} />
      </View>
      <View style={styles.rowCell}>
        {row[1] && <GalleryCard artwork={row[1]} isLiked={isLiked(row[1].id)} digital={digital} />}
      </View>
    </View>
  );
}, (prev, next) =>
  prev.row[0].id === next.row[0].id &&
  prev.row[1]?.id === next.row[1]?.id &&
  prev.digital === next.digital
);

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
  const { theme, isDigital, setMode } = useTheme();
  const { setArtworks: storeArtworks } = useDataStore();

  const fabRotate = useRef(new Animated.Value(isDigital ? 1 : 0)).current;

  const handleModeToggle = () => {
    const newMode = isDigital ? "manual" : "digital";
    Animated.spring(fabRotate, {
      toValue: newMode === "digital" ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setMode(newMode);
  };

  const { isAuthenticated } = useAuth();
  const listRef = useRef<FlashList<ArtworkRow>>(null);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const filterIdRef = useRef<string>(ALL_FILTER_ID);
  const modeRef = useRef<ArtMode>(isDigital ? "digital" : "traditional");
  const initialLoadedRef = useRef(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const currentMediumId = (id: string) => (id === ALL_FILTER_ID ? null : id);

  const load = useCallback(async (isRefresh = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchArtworksPage(1, modeRef.current, currentMediumId(filterIdRef.current));
      setArtworks(result.items);
      pageRef.current = 1;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
      storeArtworks(result.items);
    } catch {
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeArtworks]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || loadingRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    const requestFilter = filterIdRef.current;
    const requestMode = modeRef.current;
    try {
      const result = await fetchArtworksPage(nextPage, requestMode, currentMediumId(requestFilter));
      if (filterIdRef.current !== requestFilter || modeRef.current !== requestMode) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
        return;
      }
      pageRef.current = nextPage;
      hasMoreRef.current = result.hasMore;
      React.startTransition(() => {
        setArtworks((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newItems = result.items.filter((it) => !existingIds.has(it.id));
          return newItems.length ? [...prev, ...newItems] : prev;
        });
        setHasMore(result.hasMore);
        setLoadingMore(false);
      });
      loadingMoreRef.current = false;
    } catch {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  const handleSelectFilter = useCallback(
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

  useEffect(() => {
    if (isAuthenticated && !initialLoadedRef.current) {
      initialLoadedRef.current = true;
      fetchTraditionalCategories()
        .then((cats) => {
          setTraditionalCategories(cats);
          if (modeRef.current === "traditional") setCategories(cats);
        })
        .catch(() => setTraditionalCategories([]));
      load(false);
    }
  }, [isAuthenticated, load]);

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

  const rows = useMemo(() => {
    const seen = new Set<string>();
    const unique: Artwork[] = [];
    for (const a of artworks) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        unique.push(a);
      }
    }
    const result: ArtworkRow[] = [];
    for (let i = 0; i < unique.length; i += 2) {
      result.push([unique[i], unique[i + 1] ?? null]);
    }
    return result;
  }, [artworks]);

  const wallBg = isDigital ? "#0D0D1A" : "#EDE8DC";
  const accent = isDigital ? "#BF00FF" : theme.gold;

  const renderRow = useCallback(
    ({ item }: { item: ArtworkRow }) => (
      <GalleryRow row={item} digital={isDigital} />
    ),
    [isDigital]
  );

  const keyExtractor = useCallback(
    (item: ArtworkRow) => item[0].id + (item[1]?.id ?? ""),
    []
  );

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }) => {
      layout.size = ROW_HEIGHT;
    },
    []
  );

  if (loading && artworks.length === 0) return <AuthGate><LoadingScreen /></AuthGate>;

  return (
    <AuthGate>
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.hero,
          { paddingTop: topPad + 16, backgroundColor: theme.bg },
        ]}
      >
        <View style={styles.heroTop}>
          <Pressable style={styles.iconBtn} onPress={() => setSidebarOpen(true)} hitSlop={8}>
            <Menu size={22} color={theme.text} strokeWidth={1.5} />
          </Pressable>
          <View style={styles.brandWrap}>
            <Text style={[styles.brandMark, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>MULA</Text>
            <Text style={[styles.brandSub, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>ART  ·  GALLERY</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.compactToggle}>
          <Pressable
            onPress={() => isDigital && handleModeToggle()}
            style={[styles.compactToggleBtn, !isDigital && styles.compactToggleActive]}
          >
            <Text style={[styles.compactToggleText, { color: !isDigital ? "#5C4A1E" : "#888" }]}>Contemporary</Text>
          </Pressable>
          <Pressable
            onPress={() => !isDigital && handleModeToggle()}
            style={[styles.compactToggleBtn, isDigital && styles.compactToggleActive]}
          >
            <Text style={[styles.compactToggleText, { color: isDigital ? "#BF00FF" : "#888" }]}>Digital</Text>
          </Pressable>
        </View>

        <Text style={[styles.tagline, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
          Timeless Art For An Ever-Changing World
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[{ id: ALL_FILTER_ID, name: "All" }, ...categories].map((c) => {
            const active = filterId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => handleSelectFilter(c.id)}
                style={[styles.filterChip, { borderColor: active ? accent : theme.border, backgroundColor: "transparent" }]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? accent : theme.textLight, fontFamily: active ? theme.fonts.semiBold : theme.fonts.medium },
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
          {loading && <ActivityIndicator size="small" color={accent} style={{ marginLeft: 6 }} />}
        </ScrollView>
      </View>

      <FlashList<ArtworkRow>
        ref={listRef}
        data={rows}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        estimatedItemSize={ROW_HEIGHT}
        overrideItemLayout={overrideItemLayout}
        drawDistance={ROW_HEIGHT * 3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={accent} />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore && !loading) loadMore();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={accent} />
              <Text style={[styles.loadMoreText, { color: theme.textLight }]}>Loading more artworks...</Text>
            </View>
          ) : !hasMore && artworks.length > 0 ? (
            <View style={styles.loadMoreContainer}>
              <Text style={[styles.loadMoreText, { color: theme.textLight }]}>— You've reached the end —</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <ImageIcon size={40} color="rgba(139,105,20,0.3)" strokeWidth={1.3} />
              <Text style={[styles.emptyText, { color: theme.textLight }]}>No artworks found</Text>
            </View>
          )
        }
        contentContainerStyle={{
          backgroundColor: wallBg,
          paddingHorizontal: 8,
          paddingTop: 16,
          paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </View>
    </AuthGate>
  );
}

/* ─── Card styles (flat, minimal views) ─── */
const cardStyles = StyleSheet.create({
  container: { alignItems: "center", width: CARD_W },
  stringWrap: { alignItems: "center", height: 24 },
  hook: { width: 6, height: 6, borderRadius: 3, marginBottom: 1 },
  string: { width: 1, flex: 1, opacity: 0.6 },
  frame: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 3,
    borderWidth: 5,
    padding: 2,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  image: { width: IMG_W, height: IMG_H, borderRadius: 1 },
  soldBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: "#C0392B",
  },
  soldText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  heartBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(255,255,255,0.85)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: { fontSize: 11, color: "#C0392B" },
  label: {
    width: CARD_W - 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  title: { fontSize: 12, fontFamily: "Poppins_600SemiBold", marginBottom: 1 },
  artist: { fontSize: 10, fontFamily: "Poppins_400Regular" },
});

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
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 20 },
  tagline: {
    textAlign: "center",
    fontSize: 12,
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
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  filterText: { fontSize: 12, letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  rowCell: { flex: 1, alignItems: "center" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  loadMoreText: { fontSize: 13, letterSpacing: 0.3 },
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
  compactToggleBtn: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 17 },
  compactToggleActive: {
    backgroundColor: "#FFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactToggleText: { fontSize: 13, fontFamily: "Poppins", fontWeight: "600" },
});
