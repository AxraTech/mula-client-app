import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { Article } from "@/constants/data";
import { api } from "@/services/api";
import { mapArticle, extractSingle } from "@/services/mappers";
import { LoadingScreen } from "@/components/LoadingScreen";

const { width: SW } = Dimensions.get("window");

async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    console.log("[ArticleDetail] Fetching article id:", id);
    const res = await api.articles.getById(id);
    console.log("[ArticleDetail] API response:", res);
    const item = extractSingle(res);
    console.log("[ArticleDetail] Extracted item:", item);
    if (!item) return null;
    const mapped = mapArticle(item);
    console.log("[ArticleDetail] Mapped article:", mapped);
    return mapped;
  } catch (e) {
    console.error("[ArticleDetail] Error fetching article:", e);
    return null;
  }
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDigital } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const accent = isDigital ? "#BF00FF" : theme.gold;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticleById(id).then((data) => {
        setArticle(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (!article) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          
          <View style={styles.brandWrap}>
            <Text style={[styles.brandMark, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
              MULA
            </Text>
            <Text style={[styles.brandSub, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>
              ART  ·  READING
            </Text>
          </View>
          
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Feather name="book-open" size={48} color={theme.textLight} />
          <Text style={[styles.title, { color: theme.text, marginTop: 16 }]}>Article Not Found</Text>
          <Text style={[styles.date, { color: theme.textLight, textAlign: "center" }]}>
            This article could not be loaded.{'\n'}ID: {id}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>

        <View style={styles.brandWrap}>
          <Text style={[styles.brandMark, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
            MULA
          </Text>
          <Text style={[styles.brandSub, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>
            ART  ·  READING
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Hero Image */}
        {article.image && (
          <View style={styles.imageWrap}>
            <Image
              source={typeof article.image === "string" ? { uri: article.image } : article.image}
              style={styles.image}
              contentFit="cover"
            />
            <View style={[styles.overlay, { backgroundColor: isDigital ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.2)" }]} />
          </View>
        )}

        {/* Article Content */}
        <View style={styles.articleContent}>
          {/* Category & Meta */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryPill, { backgroundColor: `${accent}15` }]}>
              <View style={[styles.dot, { backgroundColor: accent }]} />
              <Text style={[styles.categoryText, { color: accent }]}>
                {article.category.toUpperCase()}
              </Text>
            </View>

            <View style={styles.readTime}>
              <Feather name="clock" size={14} color={theme.textLight} />
              <Text style={[styles.readTimeText, { color: theme.textLight }]}>
                {article.readTime} min read
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text, fontFamily: theme.fonts.bold }]}>
            {article.title}
          </Text>

          {/* Date */}
          <Text style={[styles.date, { color: theme.textLight }]}>
            {article.date}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Content */}
          {article.content ? (
            <Text style={[styles.body, { color: theme.text, fontFamily: theme.fonts.regular, lineHeight: 32 }]}>
              {article.content}
            </Text>
          ) : (
            <Text style={[styles.body, { color: theme.textLight, fontStyle: "italic" }]}>
              No content available for this article.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
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
    fontSize: 18,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  content: {
    flexGrow: 1,
  },
  imageWrap: {
    width: SW,
    height: SW * 0.6,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  articleContent: {
    padding: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  readTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readTimeText: {
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    marginBottom: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 30,
  },
});
