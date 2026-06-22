import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { ShoppingBag, Search, X, ImageIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Artwork } from "@/constants/data";
import { GalleryPainting } from "@/components/GalleryWall";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useDataStore } from "@/context/DataStoreContext";
import { useAuth } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import {
  fetchPage,
  fetchTraditionalCategories,
  MediumCategory,
  PaginatedResult,
} from "@/services/api";
import { mapProduct } from "@/services/mappers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ALL_FILTER_ID = "__all__";

const shopPressHandlers = new Map<string, () => void>();
function getShopPress(id: string) {
  let fn = shopPressHandlers.get(id);
  if (!fn) {
    fn = () => router.push({ pathname: "/artwork/[id]", params: { id, from: "shop" } });
    shopPressHandlers.set(id, fn);
  }
  return fn;
}

const MemoShopItem = React.memo(
  function ShopItem({ artwork, index, liked, digital }: { artwork: Artwork; index: number; liked: boolean; digital: boolean }) {
    return (
      <GalleryPainting
        artwork={artwork}
        index={index}
        onPress={getShopPress(artwork.id)}
        isLiked={liked}
        showPrice
        digital={digital}
      />
    );
  },
  (prev, next) =>
    prev.artwork.id === next.artwork.id &&
    prev.liked === next.liked &&
    prev.digital === next.digital
);
const ITEMS_PER_PAGE = 10; // Smaller page size for faster load

type ArtMode = "traditional" | "digital";

interface ShopItem extends Artwork {
  source?: "product" | "traditional" | "digital";
}

async function fetchShopPage(
  page: number,
  mode: ArtMode,
  mediumTypeId: string | null,
  searchQuery: string
): Promise<PaginatedResult<ShopItem>> {
  // Shop uses /products endpoint for ALL items (both manual and digital)
  const params: Record<string, string> = {};
  if (searchQuery) params.search = searchQuery;
  if (mode === "traditional") params.type = "manual";
  if (mode === "digital") params.type = "digital";

  const data = await fetchPage("/products", page, ITEMS_PER_PAGE, params);
  const mapped = (data?.items ?? []).map((item: any, i: number) => ({
    ...mapProduct(item, i),
    source: "product" as const,
  }));

  return {
    items: mapped,
    hasMore: data?.hasMore ?? false,
    total: data?.total ?? mapped.length,
    totalPages: data?.hasMore ? null : 1,
  };
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState<string>(ALL_FILTER_ID);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [categories, setCategories] = useState<MediumCategory[]>([]);
  const [traditionalCategories, setTraditionalCategories] = useState<MediumCategory[]>([]);

  const { isLiked } = useWishlist();
  const { itemCount } = useCart();
  const { theme, isDigital } = useTheme();
  const { setArtworks: storeArtworks } = useDataStore();
  const { isAuthenticated } = useAuth();
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Refs to avoid stale closures in async fetchers
  const pageRef = React.useRef(1);
  const hasMoreRef = React.useRef(true);
  const loadingRef = React.useRef(false);
  const loadingMoreRef = React.useRef(false);
  const filterIdRef = React.useRef<string>(ALL_FILTER_ID);
  const modeRef = React.useRef<ArtMode>(isDigital ? "digital" : "traditional");
  const searchRef = React.useRef("");
  const initialLoadedRef = React.useRef(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const accent = isDigital ? "#BF00FF" : theme.gold;
  const wallBg = isDigital ? "#0D0D1A" : "#EDE8DC";

  const currentMediumId = (id: string) => (id === ALL_FILTER_ID ? null : id);

  const load = React.useCallback(async (isRefresh = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchShopPage(
        1,
        modeRef.current,
        currentMediumId(filterIdRef.current),
        searchRef.current
      );
      setTotalCount(result.total);
      setItems(result.items);
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
    const requestSearch = searchRef.current;

    try {
      const result = await fetchShopPage(
        nextPage,
        requestMode,
        currentMediumId(requestFilter),
        requestSearch
      );

      // Discard if filter, mode, or search changed mid-flight
      if (
        filterIdRef.current !== requestFilter ||
        modeRef.current !== requestMode ||
        searchRef.current !== requestSearch
      )
        return;

      setItems((prev) => {
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
      setItems([]);
      load(false);
    },
    [load]
  );

  // Debounced search
  const handleSearchChange = React.useCallback((text: string) => {
    setSearch(text);
    searchRef.current = text;
    // Reset and reload with search
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    setItems([]);
    load(false);
  }, [load]);

  const clearSearch = React.useCallback(() => {
    setSearch("");
    searchRef.current = "";
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    setItems([]);
    load(false);
  }, [load]);

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
    searchRef.current = "";
    setSearch("");
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    setItems([]);
    setCategories(newMode === "traditional" ? traditionalCategories : []);
    load(false);
  }, [isDigital, load, traditionalCategories]);

  // Memoized columns to avoid recomputing on every render
  const { leftCol, rightCol } = React.useMemo(() => {
    const seen = new Set<string>();
    const unique: ShopItem[] = [];
    for (const a of items) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        unique.push(a);
      }
    }
    const left: ShopItem[] = [];
    const right: ShopItem[] = [];
    for (let i = 0; i < unique.length; i++) {
      (i % 2 === 0 ? left : right).push(unique[i]);
    }
    return { leftCol: left, rightCol: right };
  }, [items]);

  return (
    <AuthGate>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Header */}
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
            <View style={{ width: 40 }} />
            <View style={styles.brandWrap}>
              <Text style={[styles.brandMark, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
                MULA
              </Text>
              <Text style={[styles.brandSub, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>
                SHOP  ·  COLLECTION
              </Text>
            </View>
            <Pressable onPress={() => router.push("/cart")} style={styles.iconBtn} hitSlop={8}>
              <ShoppingBag size={22} color={theme.text} strokeWidth={1.5} />
              {itemCount > 0 && (
                <View style={[styles.badge, { backgroundColor: accent }]}>
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isDigital ? "#000" : "#fff",
                        fontFamily: theme.fonts.semiBold,
                      },
                    ]}
                  >
                    {itemCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Search */}
          <View
            style={[
              styles.searchWrapper,
              { backgroundColor: theme.bgCard, borderColor: theme.border },
            ]}
          >
            <Search size={16} color={theme.textLight} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, fontFamily: theme.fonts.regular }]}
              placeholder="Search artworks or artists…"
              placeholderTextColor={theme.textLight}
              value={search}
              onChangeText={handleSearchChange}
            />
            {search !== "" && (
              <Pressable onPress={clearSearch}>
                <X size={16} color={theme.textLight} strokeWidth={1.5} />
              </Pressable>
            )}
            {loading && (
              <ActivityIndicator
                size="small"
                color={accent}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>

          {/* Filter Chips */}
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

          {/* Count */}
          {(() => {
            const display =
              totalCount !== null && totalCount > 0 ? totalCount : items.length;
            if (display <= 0) return null;
            return (
              <Text
                style={[
                  styles.countText,
                  {
                    color: theme.textLight,
                    fontFamily: theme.fonts.regular,
                    paddingHorizontal: 20,
                    paddingTop: 8,
                  },
                ]}
              >
                {display.toLocaleString()} {modeRef.current === "digital" ? "digital works & products" : "traditional artworks"}
              </Text>
            );
          })()}
        </View>

        {/* Gallery Grid */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true} // Memory optimization
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
            const triggerPosition = contentSize.height - 800; // Load earlier

            if (scrollPosition >= triggerPosition && hasMore && !loadingMore && !loading && !loadingRef.current) {
              loadMore();
            }
          }}
          scrollEventThrottle={16} // 60fps for smoother scroll
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
                  <MemoShopItem
                    key={artwork.id}
                    artwork={artwork}
                    index={idx}
                    liked={isLiked(artwork.id)}
                    digital={isDigital}
                  />
                ))}
              </View>
            ))}
          </View>

          {items.length === 0 && !loading && (
            <View style={styles.empty}>
              <ImageIcon size={40} color="rgba(139,105,20,0.3)" strokeWidth={1.3} />
              <Text style={[styles.emptyText, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                No artworks found
              </Text>
            </View>
          )}

          {/* Load More Indicator */}
          {loadingMore && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={accent} />
              <Text style={[styles.loadMoreText, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                Loading more artworks...
              </Text>
            </View>
          )}

          {/* End of List Indicator */}
          {!hasMore && items.length > 0 && !loadingMore && (
            <View style={styles.loadMoreContainer}>
              <Text style={[styles.loadMoreText, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                — You've reached the end —
              </Text>
            </View>
          )}
        </ScrollView>
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
    fontSize: 23,
    letterSpacing: 6,
  },
  brandSub: {
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10 },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
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
  filterText: { fontSize: 12, letterSpacing: 0.5 },
  countText: {
    fontSize: 12,
    letterSpacing: 0.5,
    fontStyle: "italic",
  },
  galleryWall: { minHeight: "100%" },
  wallColumns: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 16,
    gap: 8,
  },
  column: { flex: 1, gap: 16 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  loadMoreText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
