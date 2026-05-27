import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ARTWORKS, Artwork } from "@/constants/data";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useDataStore } from "@/context/DataStoreContext";
import { api } from "@/services/api";
import {
  mapTraditionalArtwork,
  mapDigitalArtwork,
  mapProduct,
  extractSingle,
} from "@/services/mappers";
import { LoadingScreen } from "@/components/LoadingScreen";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CURTAIN_W = SCREEN_WIDTH * 0.52;

const FOLDS = [
  { pos: CURTAIN_W * 0.06, highlightOp: 0.38, shadowOp: 0.0  },
  { pos: CURTAIN_W * 0.17, highlightOp: 0.0,  shadowOp: 0.28 },
  { pos: CURTAIN_W * 0.28, highlightOp: 0.30, shadowOp: 0.0  },
  { pos: CURTAIN_W * 0.39, highlightOp: 0.0,  shadowOp: 0.24 },
  { pos: CURTAIN_W * 0.50, highlightOp: 0.26, shadowOp: 0.0  },
  { pos: CURTAIN_W * 0.61, highlightOp: 0.0,  shadowOp: 0.20 },
  { pos: CURTAIN_W * 0.72, highlightOp: 0.18, shadowOp: 0.0  },
];

const TASSELS = 11;

function CurtainPanel({
  side,
  translateAnim,
  isDigital,
}: {
  side: "left" | "right";
  translateAnim: Animated.Value;
  isDigital: boolean;
}) {
  const base    = isDigital ? "#5B0096" : "#8B0000";
  const dark    = isDigital ? "#35005A" : "#550000";
  const pelmetC = isDigital ? "#2A004A" : "#3E0A00";
  const rodC    = isDigital ? "#A040D0" : "#C8860A";
  const scallC  = isDigital ? "#6A0DAD" : "#7A1800";
  const tassC   = isDigital ? "#CC80FF" : "#D4A017";
  const tassKnot= isDigital ? "#9B30CC" : "#B8860B";
  const hlColor = isDigital ? "rgba(200,100,255," : "rgba(220,80,40,";
  const edgeSide = side === "left" ? { right: 0 } : { left: 0 };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.curtainPanel,
        side === "left" ? styles.curtainLeft : styles.curtainRight,
        { transform: [{ translateX: translateAnim }] },
      ]}
    >
      {/* ── Fabric base ── */}
      <View style={[styles.fabricBase, { backgroundColor: base }]} />

      {/* ── Gather folds ── */}
      {FOLDS.map((f, i) =>
        f.highlightOp > 0 ? (
          <View
            key={i}
            style={[
              styles.foldStrip,
              { left: f.pos, backgroundColor: `${hlColor}${f.highlightOp})` },
            ]}
          />
        ) : (
          <View
            key={i}
            style={[
              styles.foldStrip,
              { left: f.pos, backgroundColor: `rgba(0,0,0,${f.shadowOp})` },
            ]}
          />
        )
      )}

      {/* ── Inner-edge gather shadow ── */}
      <View style={[styles.edgeGather, edgeSide, { backgroundColor: dark }]} />

      {/* ── Pelmet (top valance) ── */}
      <View style={[styles.pelmet, { backgroundColor: pelmetC }]}>
        {/* Curtain rod */}
        <View style={[styles.pelmetRod, { backgroundColor: rodC }]} />
        {/* Scalloped bottom edge — 4 arches */}
        <View style={styles.scallopRow}>
          {[0,1,2,3].map(i => (
            <View key={i} style={[styles.scallop, { backgroundColor: scallC }]} />
          ))}
        </View>
      </View>

      {/* ── Tie-back knot (mid height) ── */}
      <View
        style={[
          styles.tieBack,
          side === "left" ? { right: -6 } : { left: -6 },
          { backgroundColor: dark, borderColor: tassKnot },
        ]}
      />

      {/* ── Tassel fringe bar ── */}
      <View style={[styles.fringeBar, { backgroundColor: dark }]}>
        <View style={[styles.fringeRope, { backgroundColor: tassKnot }]} />
        <View style={styles.tasselRow}>
          {[...Array(TASSELS)].map((_, i) => (
            <View key={i} style={styles.tasselWrap}>
              {/* knot head */}
              <View style={[styles.tasselKnot, { backgroundColor: tassKnot }]} />
              {/* drop body */}
              <View style={[styles.tasselDrop, { backgroundColor: tassC }]} />
              {/* rounded tip */}
              <View style={[styles.tasselTip, { backgroundColor: tassC }]} />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

async function fetchArtworkById(rawId: string, from?: string): Promise<Artwork | null> {
  const tryFetch = async (fetcher: () => Promise<any>, mapper: (x: any) => Artwork) => {
    try {
      const res = await fetcher();
      const raw = extractSingle(res);
      if (raw && (raw.id || raw.artwork_id || raw._id || raw.product_id)) {
        return mapper(raw);
      }
    } catch {}
    return null;
  };

  // Strip trad-/digi- prefix added by artist detail screen
  const isTraditional = rawId.startsWith("trad-");
  const isDigitalArt = rawId.startsWith("digi-");
  const id = rawId.replace(/^(trad-|digi-)/, "");

  if (isTraditional) {
    return (await tryFetch(() => api.artworks.getTraditionalById(id), mapTraditionalArtwork)) ?? null;
  }
  if (isDigitalArt) {
    return (await tryFetch(() => api.artworks.getDigitalById(id), mapDigitalArtwork)) ?? null;
  }

  // Shop items — product endpoint first
  if (from === "shop") {
    return (
      (await tryFetch(() => api.products.getById(id), mapProduct)) ??
      (await tryFetch(() => api.artworks.getTraditionalById(id), mapTraditionalArtwork)) ??
      null
    );
  }

  // Gallery — traditional/digital first
  return (
    (await tryFetch(() => api.artworks.getTraditionalById(id), mapTraditionalArtwork)) ??
    (await tryFetch(() => api.artworks.getDigitalById(id), mapDigitalArtwork)) ??
    (await tryFetch(() => api.artworks.getById(id), mapTraditionalArtwork)) ??
    (await tryFetch(() => api.products.getById(id), mapProduct)) ??
    null
  );
}

export default function ArtworkDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const insets = useSafeAreaInsets();
  const { isLiked, toggleLike } = useWishlist();
  const { addToCart, items } = useCart();
  const { theme, isDigital } = useTheme();
  const { getArtwork, setArtwork } = useDataStore();
  const isFromGallery = from === "gallery" || (Array.isArray(from) && from[0] === "gallery");

  const [artwork, setArtworkLocal] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const heartScale = useRef(new Animated.Value(1)).current;
  const cartScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const curtainLeft = useRef(new Animated.Value(0)).current;
  const curtainRight = useRef(new Animated.Value(0)).current;
  const artworkScale = useRef(new Animated.Value(0.8)).current;
  const artworkOpacity = useRef(new Animated.Value(0)).current;

  const liked = artwork ? isLiked(artwork.id) : false;
  const inCart = artwork ? items.some((i) => i.artwork.id === artwork.id) : false;
  const showCart = !isFromGallery;

  const accent = isDigital ? "#BF00FF" : theme.gold;
  const accentGrad = isDigital ? (["#BF00FF", "#7B00CC"] as const) : (["#C4952A", "#8B6914"] as const);

  useEffect(() => {
    console.log("[ArtworkDetail] isFromGallery:", isFromGallery, "from param:", from);
    if (artwork) {
      if (isFromGallery) {
        console.log("[ArtworkDetail] Starting curtain animation");
        // Reset curtain positions to cover the screen
        curtainLeft.setValue(0);
        curtainRight.setValue(0);
        artworkOpacity.setValue(0);
        artworkScale.setValue(0.8);
        fadeAnim.setValue(0);

        // Velvet curtain reveal - faster and elegant
        Animated.sequence([
          // Quick reveal
          Animated.delay(400),
          // All animations together
          Animated.parallel([
            // Curtains slide open
            Animated.timing(curtainLeft, {
              toValue: -Dimensions.get("window").width * 0.56,
              duration: 1200,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(curtainRight, {
              toValue: Dimensions.get("window").width * 0.56,
              duration: 1200,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            // Artwork appears
            Animated.timing(artworkOpacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.spring(artworkScale, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
            // Info card fades in with curtains
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
        ]).start();
      } else {
        // Normal animation for shop view
        fadeAnim.setValue(0);
        slideAnim.setValue(30);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [artwork, isFromGallery]);

  useEffect(() => {
    if (artwork) {
      console.log("[ArtworkDetail] Using cached artwork");
      return;
    }
    setLoading(true);
    fetchArtworkById(id, from)
      .then((a) => {
        if (a) {
          setArtworkLocal(a);
          setArtwork(a);
        }
      })
      .finally(() => setLoading(false));
  }, [id, artwork, setArtwork]);

  const handleLike = () => {
    if (!artwork) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(artwork.id);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true, friction: 4 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  };

  const handleAddToCart = () => {
    if (!artwork || artwork.isSoldOut) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart(artwork);
    Animated.sequence([
      Animated.spring(cartScale, { toValue: 0.95, useNativeDriver: true, friction: 6 }),
      Animated.spring(cartScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (loading) return <LoadingScreen />;

  if (!artwork) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <Feather name="image" size={48} color={theme.border} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Artwork not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: accent }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const imageSource = imgError
    ? require("../../assets/images/art1.png")
    : artwork.image ?? require("../../assets/images/art1.png");

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Theater Curtains (gallery view only) */}
      {isFromGallery && (
        <>
          <CurtainPanel side="left"  translateAnim={curtainLeft}  isDigital={isDigital} />
          <CurtainPanel side="right" translateAnim={curtainRight} isDigital={isDigital} />

          {/* Back Button - Above Curtains */}
          <Pressable
            style={[styles.galleryBackBtn, { top: topPad + 12 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#FFF" />
          </Pressable>
        </>
      )}

      {/* Main Content with opacity animation */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header - Hidden in gallery view, shown in shop */}
        {!isFromGallery && (
          <View style={[styles.header, { top: topPad + 12 }]}>
            <Pressable style={[styles.headerBtn, { backgroundColor: isDigital ? "rgba(18,18,30,0.8)" : "rgba(255,255,255,0.9)" }]} onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} color={theme.text} />
            </Pressable>
            <Pressable style={[styles.headerBtn, { backgroundColor: isDigital ? "rgba(18,18,30,0.8)" : "rgba(255,255,255,0.9)" }]} onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Feather name="heart" size={22} color={liked ? "#FF3366" : theme.text} fill={liked ? "#FF3366" : "transparent"} />
              </Animated.View>
            </Pressable>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
          {/* Artwork on Wall */}
        <View style={styles.imageSection}>
          <Animated.View
            style={[
              styles.artworkWrapper,
              {
                transform: isFromGallery ? [{ scale: artworkScale }] : [{ translateY: slideAnim }],
                opacity: isFromGallery ? artworkOpacity : 1,
              },
            ]}
          >
            {/* Wooden Frame */}
            <View style={[styles.woodFrameOuter, { backgroundColor: isDigital ? "#2A1A3E" : "#3D2817", shadowColor: isDigital ? "#BF00FF50" : "#00000070" }]}>
              <View style={styles.woodFrameInner}>
                <View style={styles.matBoard}>
                  <Image
                    source={imageSource}
                    style={styles.artworkImage}
                    contentFit="cover"
                    onError={() => setImgError(true)}
                    transition={400}
                  />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Clean Type Badge */}
          <View style={[styles.pillBadge, { backgroundColor: isDigital ? "#BF00FF" : "#C4952A" }]}>
            <Text style={styles.pillText}>{artwork.type === "manual" ? "Traditional Art" : "Digital Art"}</Text>
          </View>
        </View>

        {/* Elegant Info Card */}
        <Animated.View style={[styles.infoCard, { backgroundColor: theme.bgCard, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Title & Artist */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.text, fontFamily: theme.fonts.bold }]}>{artwork.title}</Text>
            <Text style={[styles.artist, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
              {artwork.artist}
            </Text>
          </View>

          {/* Elegant Details */}
          <View style={styles.detailsGrid}>
            {artwork.year && (
              <View style={styles.detailBox}>
                <Text style={[styles.detailLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Year</Text>
                <Text style={[styles.detailValue, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>{artwork.year}</Text>
              </View>
            )}
            {artwork.medium && (
              <View style={styles.detailBox}>
                <Text style={[styles.detailLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Medium</Text>
                <Text style={[styles.detailValue, { color: theme.text, fontFamily: theme.fonts.semiBold }]} numberOfLines={2}>{artwork.medium}</Text>
              </View>
            )}
            {artwork.dimensions && (
              <View style={styles.detailBox}>
                <Text style={[styles.detailLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Size</Text>
                <Text style={[styles.detailValue, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>{artwork.dimensions}</Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Price</Text>
            <Text style={[styles.priceValue, { color: artwork.isSoldOut ? theme.red : accent, fontFamily: theme.fonts.bold }]}>
              {artwork.isSoldOut ? "Sold Out" : `${artwork.price.toLocaleString()} ${artwork.currency}`}
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: bottomPad + 100 }} />
      </ScrollView>

      {/* Bottom Bar - Shop only */}
      {showCart && (
        <View style={[styles.floatingBar, { bottom: bottomPad + 16 }]}>
          {!artwork.isSoldOut && inCart && (
            <Pressable style={styles.cartChip} onPress={() => router.push("/cart")}>
              <View style={[styles.cartIndicator, { backgroundColor: accent }]}>
                <Feather name="shopping-bag" size={14} color="#FFF" />
              </View>
              <Text style={[styles.cartChipText, { color: theme.text }]}>View Cart</Text>
            </Pressable>
          )}
          <Animated.View style={{ transform: [{ scale: cartScale }] }}>
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: inCart ? "#888" : accent },
                (artwork.isSoldOut || inCart) && { opacity: 0.6 }
              ]}
              onPress={handleAddToCart}
              disabled={artwork.isSoldOut || inCart}
            >
              <Text style={styles.actionBtnText}>
                {artwork.isSoldOut ? "Sold Out" : inCart ? "In Cart ✓" : "Add to Cart"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      {/* End of content Animated.View */}
    </Animated.View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: { fontSize: 16 },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  backBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  // Velvet Curtains
  curtainPanel: {
    position: "absolute",
    top: 0,
    width: CURTAIN_W,
    height: SCREEN_HEIGHT,
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: { width: 20, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 24,
    overflow: "hidden",
  },
  curtainLeft:  { left: 0 },
  curtainRight: { right: 0 },
  fabricBase: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },
  foldStrip: {
    position: "absolute",
    top: 56,
    width: 20,
    bottom: 56,
    borderRadius: 10,
  },
  edgeGather: {
    position: "absolute",
    top: 0,
    width: 32,
    bottom: 0,
    opacity: 0.55,
  },
  pelmet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 10,
    overflow: "hidden",
  },
  pelmetRod: {
    position: "absolute",
    top: 8,
    left: -4,
    right: -4,
    height: 14,
    borderRadius: 7,
    zIndex: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  scallopRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  scallop: {
    flex: 1,
    height: 28,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    marginHorizontal: 1,
  },
  tieBack: {
    position: "absolute",
    top: "38%",
    width: 20,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    zIndex: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  fringeBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    overflow: "hidden",
  },
  fringeRope: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
    marginBottom: 2,
    opacity: 0.9,
  },
  tasselRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  tasselWrap: {
    alignItems: "center",
    width: 12,
  },
  tasselKnot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 0,
  },
  tasselDrop: {
    width: 7,
    height: 28,
  },
  tasselTip: {
    width: 7,
    height: 7,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  galleryBackBtn: {
    position: "absolute",
    left: 16,
    zIndex: 250,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 100,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Image Section - Artwork on Wall
  imageSection: {
    paddingTop: 100,
    paddingHorizontal: 32,
    paddingBottom: 24,
    alignItems: "center",
  },
  artworkWrapper: {
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
  },
  woodFrameOuter: {
    width: "100%",
    borderRadius: 4,
    padding: 8,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 25,
    zIndex: 10,
  },
  woodFrameInner: {
    borderRadius: 2,
    borderWidth: 5,
    borderColor: "#5C4024",
    padding: 8,
    backgroundColor: "#2A1F12",
  },
  matBoard: {
    backgroundColor: "#F5F0E8",
    padding: 12,
    borderRadius: 1,
  },
  artworkImage: {
    width: "100%",
    aspectRatio: 2 / 3,
    backgroundColor: "#1A1A1A",
  },
  pillBadge: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Elegant Info Card
  infoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  titleSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    lineHeight: 35,
    marginBottom: 6,
    textAlign: "center",
  },
  artist: {
    fontSize: 14,
    textAlign: "center",
  },

  // Details Grid
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  detailBox: {
    alignItems: "center",
    minWidth: 70,
  },
  detailLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    textAlign: "center",
  },

  divider: {
    height: 1,
    marginHorizontal: 8,
    marginBottom: 16,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  priceLabel: {
    fontSize: 13,
  },
  priceValue: {
    fontSize: 24,
  },

  // Modern Floating Bottom Bar
  floatingBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cartChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cartIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cartChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionBtn: {
    flex: 1,
    maxWidth: 200,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
