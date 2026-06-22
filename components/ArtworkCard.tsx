import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { Artwork } from "@/constants/data";
import { useTheme } from "@/context/ThemeContext";
import { ArtistNameLink } from "@/components/ArtistNameLink";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const FALLBACKS = [
  require("../assets/images/art1.png"),
  require("../assets/images/art2.png"),
  require("../assets/images/art3.png"),
];

interface ArtworkCardProps {
  artwork: Artwork;
  onPress: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export function ArtworkCard({ artwork, onPress, isLiked, onToggleLike }: ArtworkCardProps) {
  const { theme, isDigital } = useTheme();
  const { fonts } = theme;
  const [imgError, setImgError] = useState(false);
  const accent = isDigital ? "#BF00FF" : theme.gold;
  const typeBadgeBg = artwork.type === "digital"
    ? "rgba(191,0,255,0.85)"
    : "rgba(139,105,20,0.9)";

  const imageSource = imgError
    ? FALLBACKS[Number(artwork.id || 0) % 3]
    : artwork.image;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          onError={() => setImgError(true)}
          transition={300}
        />
        <View style={[styles.typeBadge, { backgroundColor: typeBadgeBg }]}>
          <Text style={[styles.typeBadgeText, { fontFamily: fonts.semiBold }]}>
            {artwork.type === "manual" ? "Contemporary" : "Digital"}
          </Text>
        </View>
        <Pressable style={styles.likeBtn} onPress={onToggleLike} hitSlop={8}>
          <Feather
            name="heart"
            size={16}
            color={isLiked ? theme.red : theme.textLight}
            style={{ opacity: isLiked ? 1 : 0.7 }}
          />
        </Pressable>
        {artwork.isSoldOut && (
          <View style={[styles.soldBadge, { backgroundColor: theme.red }]}>
            <Text style={[styles.soldText, { fontFamily: fonts.bold }]}>SOLD OUT</Text>
          </View>
        )}
        {isDigital && <View style={styles.neonOverlay} />}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text, fontFamily: fonts.semiBold }]} numberOfLines={1}>
          {artwork.title}
        </Text>
        <ArtistNameLink
          name={artwork.artist}
          artistId={artwork.artistId}
          prefix="by "
          style={[styles.artist, { color: theme.textLight, fontFamily: fonts.regular }]}
          linkStyle={{ color: accent }}
          numberOfLines={1}
        />
        <Text style={[styles.price, { color: artwork.isSoldOut ? theme.red : accent, fontFamily: fonts.semiBold }]}>
          {artwork.isSoldOut ? "Sold Out" : `${artwork.price.toLocaleString()} ${artwork.currency}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 0.8,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  neonOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(191,0,255,0.3)",
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  likeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  soldBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    alignItems: "center",
    opacity: 0.85,
  },
  soldText: {
    color: "#fff",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  info: { padding: 10 },
  title: { fontSize: 14, marginBottom: 2 },
  artist: { fontSize: 12, marginBottom: 6 },
  price: { fontSize: 14 },
});
