import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Menu } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Article, ARTICLES } from "@/constants/data";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { Sidebar } from "@/components/Sidebar";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/services/api";
import { mapArticle, extractArray } from "@/services/mappers";

const { width: SW } = Dimensions.get("window");
const SHELF_W = SW - 32;
const SHELF_GAP = 10;

// Rich book color palettes - velvet, leather, cloth textures
const PALETTES = {
  traditional: [
    { bg: "#722F37", text: "#E8D5C4", accent: "#D4A017" }, // Claret velvet
    { bg: "#1E3A5F", text: "#F0E6D2", accent: "#C9B037" }, // Navy leather
    { bg: "#2C4A2C", text: "#E8E4D9", accent: "#B4A642" }, // Forest cloth
    { bg: "#4B3621", text: "#E6DCC4", accent: "#D4AF37" }, // Brown leather
    { bg: "#4A2C5A", text: "#E4DCE8", accent: "#E6B89C" }, // Aubergine
    { bg: "#1E4A4A", text: "#DDE8E4", accent: "#AEC6CF" }, // Teal
    { bg: "#5C2A3A", text: "#EAD4D4", accent: "#F4C2C2" }, // Berry
    { bg: "#3A3A5C", text: "#D4D4E8", accent: "#B4C7E7" }, // Slate
  ],
  digital: [
    { bg: "#4A0080", text: "#E0B0FF", accent: "#00FFCC" }, // Deep violet
    { bg: "#2A0050", text: "#D4A5FF", accent: "#BF00FF" }, // Dark purple
    { bg: "#1A0A2E", text: "#C8A8FF", accent: "#E040FF" }, // Midnight
    { bg: "#3D0066", text: "#E8C4FF", accent: "#40E0D0" }, // Indigo
    { bg: "#2E0854", text: "#DDB4FF", accent: "#FF00CC" }, // Royal
    { bg: "#4A154B", text: "#F4D0F4", accent: "#00FFFF" }, // Wine
    { bg: "#1A1A3E", text: "#B4B4FF", accent: "#9B30FF" }, // Navy neon
    { bg: "#0D0221", text: "#C8C8FF", accent: "#FF40FF" }, // Void
  ],
};

async function fetchArticles(): Promise<Article[]> {
  const res = await api.articles.getAll();
  const arr = extractArray(res);
  if (arr.length === 0) throw new Error("empty");
  return arr.map(mapArticle);
}

// ── Elegant Article Card ─────────────────────────────────────────
function ArticleCard({
  article,
  theme,
  isDigital,
  index,
}: {
  article: Article;
  theme: any;
  isDigital: boolean;
  index: number;
}) {
  const accent = isDigital ? "#BF00FF" : theme.gold;

  return (
    <Pressable 
      style={[cardStyles.container, { backgroundColor: theme.bgCard }]} 
      onPress={() => router.push(`/article/${article.id}`)}
    >
      {/* Full bleed image */}
      <View style={cardStyles.imageWrap}>
        <Image
          source={typeof article.image === "string" ? { uri: article.image } : article.image}
          style={cardStyles.image}
          contentFit="cover"
        />
        {/* Subtle overlay */}
        <View style={[cardStyles.overlay, { backgroundColor: isDigital ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)" }]} />
      </View>
      
      {/* Content below image */}
      <View style={cardStyles.content}>
        {/* Category pill */}
        <View style={[cardStyles.categoryPill, { backgroundColor: `${accent}15` }]}>
          <View style={[cardStyles.dot, { backgroundColor: accent }]} />
          <Text style={[cardStyles.categoryText, { color: accent }]}>
            {article.category.toUpperCase()}
          </Text>
        </View>
        
        {/* Title */}
        <Text style={[cardStyles.title, { color: theme.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        
        {/* Excerpt */}
        <Text 
          style={[cardStyles.excerpt, { color: theme.textLight }]} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {article.content || "Read more about this article..."}
        </Text>
        
        {/* Meta row */}
        <View style={cardStyles.metaRow}>
          <View style={cardStyles.metaItem}>
            <Feather name="clock" size={12} color={theme.textLight} />
            <Text style={[cardStyles.metaText, { color: theme.textLight }]}>
              {article.readTime} min read
            </Text>
          </View>
          
          <Pressable 
            style={[cardStyles.readBtn, { borderColor: accent }]} 
            onPress={() => router.push(`/article/${article.id}`)}
          >
            <Text style={[cardStyles.readBtnText, { color: accent }]}>Read</Text>
            <Feather name="arrow-right" size={12} color={accent} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

// ── Skeleton for loading ─────────────────────────────────────────
function SkeletonOpenBook() {
  return (
    <View style={skeletonStyles.container}>
      <View style={skeletonStyles.shimmer} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    height: 320,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E8E4DC",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F0E8DC",
    opacity: 0.5,
  },
});

const cardStyles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imageWrap: {
    height: 200,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 18,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 25,
    fontFamily: "Poppins-Regular",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
  },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  readBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default function ArticlesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { theme, isDigital } = useTheme();
  const { isAuthenticated } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const accent = isDigital ? "#BF00FF" : theme.gold;

  const { data: apiArticles, loading, refetch } = useApiData<Article[]>(fetchArticles);

  useEffect(() => {
    if (isAuthenticated) refetch();
  }, [isAuthenticated]);

  // Show skeleton while loading, then API data, never fallback mock data
  const articles = apiArticles ?? [];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(articles.map((a) => a.category))];
    return ["All", ...cats.slice(0, 6)];
  }, [articles]);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <AuthGate>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── HERO HEADER (matching gallery/videos) ── */}
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: theme.bg }]}>
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
                ART  ·  READING
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <Pressable style={styles.iconBtn} onPress={refetch} hitSlop={8}>
                <Feather name="refresh-cw" size={18} color={theme.text} />
              </Pressable>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.pill,
                  { borderColor: theme.border, backgroundColor: theme.bgCard },
                  selectedCategory === cat && { backgroundColor: accent, borderColor: accent },
                ]}
              >
                <Text style={[
                  styles.pillText,
                  { color: selectedCategory === cat ? (isDigital ? "#000" : "#fff") : theme.textLight },
                  selectedCategory === cat && { fontFamily: theme.fonts.semiBold },
                ]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* <Text style={[styles.tagline, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
            Stories Behind Every Brushstroke
          </Text> */}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={accent} />}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }}
        >
          {/* ── DEBUG: API Status (can remove) ── */}
          {/* {!loading && apiArticles && apiArticles.length > 0 && (
            <Text style={{ fontSize: 10, color: theme.textLight, paddingHorizontal: 20, marginBottom: 8 }}>
             Total {apiArticles.length} articles
            </Text>
          )}
          {!loading && (!apiArticles || apiArticles.length === 0) && (
            <Text style={{ fontSize: 10, color: "#C0392B", paddingHorizontal: 20, marginBottom: 8 }}>
              No API data - check connection
            </Text>
          )} */}

          {/* ── SECTION LABEL ── */}
          {filtered.length > 0 && (
            <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
              <View style={[styles.sectionAccent, { backgroundColor: accent }]} />
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
                Featured Stories
              </Text>
            </View>
          )}

          {/* ── LOADING SKELETON ── */}
          {loading && (
            <>
              <SkeletonOpenBook />
              <SkeletonOpenBook />
              <SkeletonOpenBook />
            </>
          )}

          {/* ── ARTICLE CARDS ── */}
          {!loading && filtered.map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              theme={theme}
              isDigital={isDigital}
              index={i}
            />
          ))}

          {!loading && filtered.length === 0 && (
            <View style={styles.empty}>
              <Feather name="book-open" size={44} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
                Nothing here yet
              </Text>
              <Text style={[styles.emptyText, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                New stories arrive soon
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

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  headerSub: { fontSize: 10, letterSpacing: 2.5, marginBottom: 2 },
  headerTitle: { fontSize: 28, letterSpacing: 0.3 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  pillRow: { gap: 8, paddingRight: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    marginBottom: 13,
  },
  pillText: { fontSize: 12, letterSpacing: 0.3 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  sectionAccent: { width: 3, height: 16, borderRadius: 2 },
  sectionTitle: { fontSize: 13, letterSpacing: 1 },

  // Hero Header (matching gallery/videos)
  hero: {
    paddingHorizontal: 20,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWrap: {
    alignItems: "center",
  },
  brandMark: {
    fontSize: 20,
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: -20,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },

  // Empty
  empty: { alignItems: "center", paddingVertical: 80, gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 21 },
});
