import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ConfirmModal } from "@/components/ConfirmModal";

const GOLD = "#D4AF37";

interface FavItem {
  id: string;
  artwork_id?: string;
  digital_artwork_id?: string;
  title: string;
  artist: string;
  image: string;
  price: number;
  currency: string;
  isDigital: boolean;
}

function mapFavItem(item: any): FavItem {
  const artwork = item.artwork ?? item.digital_artwork ?? item;
  return {
    id: String(item.id ?? item.favourite_id ?? ""),
    artwork_id: item.fk_artwork_id ? String(item.fk_artwork_id) : undefined,
    digital_artwork_id: item.fk_digital_artwork_id ? String(item.fk_digital_artwork_id) : undefined,
    title: artwork.artwork_name ?? artwork.title ?? artwork.name ?? "Untitled",
    artist: artwork.artist_name ?? artwork.artist ?? "",
    image: artwork.artwork_image_url ?? artwork.image_url ?? artwork.image ?? "",
    price: Number(artwork.current_price ?? artwork.price ?? 0),
    currency: artwork.currency ?? "MMK",
    isDigital: !!(item.fk_digital_artwork_id),
  };
}

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [favs, setFavs] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<FavItem | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const fetchFavs = useCallback(async (isRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.engagement.getFavourites(user.id);
      const arr = Array.isArray(res) ? res
        : Array.isArray(res?.favourites) ? res.favourites
        : Array.isArray(res?.data) ? res.data
        : [];
      setFavs(arr.map(mapFavItem));
    } catch {
      setFavs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchFavs(); }, [fetchFavs]);

  const doRemove = async (fav: FavItem) => {
    setRemoving(fav.id);
    try {
      await api.engagement.deleteFavourite(fav.id);
      setFavs((prev) => prev.filter((f) => f.id !== fav.id));
    } catch {}
    finally { setRemoving(null); }
  };

  const handlePress = (fav: FavItem) => {
    const artworkId = fav.digital_artwork_id
      ? `digi-${fav.digital_artwork_id}`
      : fav.artwork_id
      ? `trad-${fav.artwork_id}`
      : null;
    if (artworkId) {
      router.push({ pathname: "/artwork/[id]", params: { id: artworkId } });
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color="#1A1A2E" />
        </Pressable>
        <Text style={styles.headerTitle}>Favourites</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchFavs(true)} tintColor={GOLD} />}
      >
        {favs.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="heart" size={52} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Favourites Yet</Text>
            <Text style={styles.emptyText}>Heart artworks to save them here</Text>
            <Pressable style={styles.browseBtn} onPress={() => router.push("/(tabs)")}>
              <Text style={styles.browseBtnText}>Browse Gallery</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {favs.map((fav) => (
              <Pressable
                key={fav.id}
                style={styles.card}
                onPress={() => handlePress(fav)}
              >
                <Image
                  source={fav.image ? { uri: fav.image } : require("../assets/images/logo.png")}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{fav.title}</Text>
                  {!!fav.artist && <Text style={styles.cardArtist} numberOfLines={1}>{fav.artist}</Text>}
                  {fav.price > 0 && (
                    <Text style={styles.cardPrice}>{fav.price.toLocaleString()} {fav.currency}</Text>
                  )}
                </View>
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => setPendingRemove(fav)}
                  hitSlop={8}
                  disabled={removing === fav.id}
                >
                  <Feather name="heart" size={18} color={GOLD} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={!!pendingRemove}
        title="Remove Favourite"
        message={`Remove "${pendingRemove?.title ?? ""}" from your favourites?`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        variant="danger"
        icon="heart"
        onConfirm={() => { if (pendingRemove) doRemove(pendingRemove); setPendingRemove(null); }}
        onCancel={() => setPendingRemove(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 19, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },

  content: { paddingHorizontal: 16, paddingTop: 16 },
  grid: { gap: 12 },

  card: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardImage: { width: 90, height: 90 },
  cardInfo: { flex: 1, padding: 12, justifyContent: "center", gap: 4 },
  cardTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },
  cardArtist: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#6B7280" },
  cardPrice: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: GOLD, marginTop: 2 },
  removeBtn: { padding: 14, alignItems: "center", justifyContent: "center" },

  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 19, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E", marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },
  browseBtn: { marginTop: 16, backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  browseBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
