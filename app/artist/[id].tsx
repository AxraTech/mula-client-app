import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Artist, Artwork } from "@/constants/data";
import { ArtworkCard } from "@/components/ArtworkCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useWishlist } from "@/context/WishlistContext";
import { useDataStore } from "@/context/DataStoreContext";
import { api, fetchAllPages } from "@/services/api";
import {
  mapArtist,
  mapTraditionalArtwork,
  mapDigitalArtwork,
  extractSingle,
} from "@/services/mappers";

const GOLD = "#D4AF37";

async function fetchArtistById(id: string): Promise<Artist | null> {
  try {
    const res = await api.artists.getById(id);
    const raw = extractSingle(res);
    if (raw && (raw.id || raw.artist_id)) return mapArtist(raw);
  } catch {}
  return null;
}

async function fetchArtistArtworks(id: string): Promise<Artwork[]> {
  try {
    const [tradItems, digiItems] = await Promise.allSettled([
      fetchAllPages("/artworks/traditional"),
      fetchAllPages("/artworks/digital"),
    ]);

    const tradArr =
      tradItems.status === "fulfilled"
        ? tradItems.value
            .filter(
              (a: any) =>
                String(a.fk_artist_id ?? a.artist?.id ?? a.artist_id) === id
            )
            .map((item: any, i: number) => {
              const aw = mapTraditionalArtwork(item, i);
              return { ...aw, id: `trad-${aw.id}` };
            })
        : [];

    const digiArr =
      digiItems.status === "fulfilled"
        ? digiItems.value
            .filter(
              (a: any) =>
                String(a.fk_artist_id ?? a.artist?.id ?? a.artist_id) === id
            )
            .map((item: any, i: number) => {
              const aw = mapDigitalArtwork(item, i);
              return { ...aw, id: `digi-${aw.id}` };
            })
        : [];

    return [...tradArr, ...digiArr];
  } catch {
    return [];
  }
}

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isLiked, toggleLike } = useWishlist();
  const { setArtist } = useDataStore();

  const [artist, setArtistLocal] = useState<Artist | null>(null);
  const [artworks, setArtworksList] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArts, setLoadingArts] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    fetchArtistById(id).then((a) => {
      if (a) {
        setArtistLocal(a);
        setArtist(a);
      }
      setLoading(false);
    });

    setLoadingArts(true);
    setArtworksList([]);
    fetchArtistArtworks(id)
      .then((list) => {
        const unique = list.filter(
          (aw, idx, arr) => arr.findIndex((x) => x.id === aw.id) === idx
        );
        setArtworksList(unique);
      })
      .finally(() => setLoadingArts(false));
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (!artist) {
    return (
      <View style={styles.notFound}>
        <Feather name="user" size={56} color="#D4AF3740" />
        <Text style={styles.notFoundTitle}>Artist not found</Text>
        <Pressable style={styles.notFoundBtn} onPress={() => router.back()}>
          <Text style={styles.notFoundBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const initials = artist.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarSrc: any = (() => {
    const a = artist.avatar;
    if (!a) return null;
    if (typeof a === "string") return { uri: a };
    if (typeof a === "object" && "uri" in a && a.uri) return a;
    return null;
  })();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="#1A1A2E" />
        </Pressable>
        <Text style={styles.headerTitle}>Artist Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Platform.OS === "web" ? 100 : insets.bottom + 100,
          },
        ]}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarFrame}>
            {avatarSrc ? (
              <Image source={avatarSrc} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <LinearGradient colors={["#B8940D", "#D4AF37"]} style={styles.avatarGrad}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>

          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.specialization}>{artist.specialization}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {loadingArts ? "—" : (artist.artworkCount || artworks.length)}
              </Text>
              <Text style={styles.statLabel}>Artworks</Text>
            </View>
            {(artist.followers ?? 0) > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{(artist.followers ?? 0).toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              </>
            )}
          </View>

          {!!artist.bio && <Text style={styles.bio}>{artist.bio}</Text>}

          <Pressable style={styles.followBtn}>
            <LinearGradient colors={["#B8940D", "#D4AF37"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.followGrad}>
              <Text style={styles.followBtnText}>Follow Artist</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.artworksSection}>
          <View style={styles.artworksSectionHeader}>
            <Text style={styles.sectionTitle}>Artworks</Text>
            {loadingArts && <ActivityIndicator size="small" color={GOLD} />}
          </View>

          {artworks.length === 0 && !loadingArts ? (
            <View style={styles.emptyState}>
              <Feather name="image" size={40} color="#E5E7EB" />
              <Text style={styles.emptyText}>No artworks yet</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {artworks.map((aw) => (
                <ArtworkCard
                  key={aw.id}
                  artwork={aw}
                  onPress={() =>
                    router.push({
                      pathname: "/artwork/[id]",
                      params: { id: aw.id },
                    })
                  }
                  isLiked={isLiked(aw.id)}
                  onToggleLike={() => toggleLike(aw.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  loadingView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },

  notFound: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  notFoundTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },
  notFoundBtn: {
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
  },
  notFoundBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    letterSpacing: 0.3,
  },

  content: {},

  profileSection: {
    alignItems: "center",
    padding: 28,
    gap: 10,
    backgroundColor: "#FFFDF7",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarFrame: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: "#D4AF3760",
    overflow: "hidden",
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarGrad: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontSize: 34, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },

  artistName: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#1A1A2E" },
  specialization: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#D4AF37" },

  statsRow: { flexDirection: "row", alignItems: "center", gap: 0, marginTop: 4 },
  statItem: { alignItems: "center", paddingHorizontal: 24 },
  statValue: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#1A1A2E" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#9CA3AF", marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: "#E5E7EB" },

  bio: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
    lineHeight: 28,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  followBtn: {
    marginTop: 6,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 5 },
    }),
  },
  followGrad: { paddingHorizontal: 40, paddingVertical: 12 },
  followBtnText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },

  artworksSection: { padding: 16 },
  artworksSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#1A1A2E" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
