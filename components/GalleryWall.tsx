import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { Artwork } from "@/constants/data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = SCREEN_WIDTH * 0.42;
const CARD_H = CARD_W * 1.35;

interface GalleryPaintingProps {
  artwork: Artwork;
  index: number;
  onPress: () => void;
  isLiked: boolean;
  style?: object;
  showPrice?: boolean;
  digital?: boolean;
}

function GalleryPaintingInner({
  artwork,
  onPress,
  isLiked,
  style,
  showPrice = false,
  digital = false,
}: GalleryPaintingProps) {
  const frameColor = digital ? "#2A1A4E" : "#C4A96B";
  const frameBg = digital ? "#1A0A2E" : "#D4B97B";
  const labelBg = digital ? "#12121E" : "#FFFDF7";
  const labelBorder = digital ? "#2A2040" : "#E0D8C8";
  const accentColor = digital ? "#BF00FF" : "#8B6914";
  const textColor = digital ? "#E0D0F0" : "#1A1A2E";
  const subtextColor = digital ? "#A090C0" : "#8C8476";

  return (
    <View style={[styles.container, style]}>
      {/* Hook + string */}
      <View style={styles.stringWrap}>
        <View style={[styles.hook, { backgroundColor: digital ? "#7B00CC" : "#B8A080" }]} />
        <View style={[styles.string, { backgroundColor: digital ? "rgba(191,0,255,0.5)" : "#B8A080" }]} />
      </View>

      <Pressable onPress={onPress} style={[styles.frame, { width: CARD_W, height: CARD_H, borderColor: frameColor, backgroundColor: frameBg }]}>
        <Image
          source={artwork.image}
          style={styles.image}
          contentFit="cover"
          recyclingKey={artwork.id}
          cachePolicy="disk"
          transition={0}
        />
        {artwork.isSoldOut && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>SOLD</Text>
          </View>
        )}
        {isLiked && (
          <View style={styles.heartBadge}>
            <Text style={styles.heartIcon}>♥</Text>
          </View>
        )}
      </Pressable>

      <View style={[styles.label, { width: CARD_W - 8, backgroundColor: labelBg, borderColor: labelBorder }]}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{artwork.title}</Text>
        <Text style={[styles.artist, { color: subtextColor }]} numberOfLines={1}>{artwork.artist}</Text>
        {showPrice && (
          <Text style={[styles.price, { color: artwork.isSoldOut ? "#C0392B" : accentColor }]}>
            {artwork.isSoldOut ? "Sold Out" : `${artwork.price.toLocaleString()} ${artwork.currency}`}
          </Text>
        )}
      </View>
    </View>
  );
}

export const GalleryPainting = memo(GalleryPaintingInner, (prev, next) =>
  prev.artwork.id === next.artwork.id &&
  prev.isLiked === next.isLiked &&
  prev.onPress === next.onPress &&
  prev.showPrice === next.showPrice &&
  prev.digital === next.digital
);

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  stringWrap: { alignItems: "center", height: 24 },
  hook: { width: 6, height: 6, borderRadius: 3, marginBottom: 1 },
  string: { width: 1, flex: 1 },
  frame: {
    borderRadius: 3,
    borderWidth: 5,
    padding: 2,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  image: { flex: 1, borderRadius: 1 },
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  title: { fontSize: 12, fontFamily: "Poppins_600SemiBold", marginBottom: 1 },
  artist: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  price: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginTop: 2 },
});
