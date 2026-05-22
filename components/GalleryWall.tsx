import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Artwork } from "@/constants/data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GalleryPaintingProps {
  artwork: Artwork;
  index: number;
  onPress: () => void;
  isLiked: boolean;
  style?: object;
  showPrice?: boolean;
}

export function GalleryPainting({
  artwork,
  index,
  onPress,
  isLiked,
  style,
  showPrice = false,
}: GalleryPaintingProps) {
  const { theme, isDigital } = useTheme();
  const { fonts } = theme;

  const swingAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Faster animation with less stagger delay for better perceived performance
    const staggerDelay = Math.min(index * 50, 300); // Max 300ms delay
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400, // Faster fade
        delay: staggerDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        delay: staggerDelay,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(swingAnim, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(swingAnim, {
            toValue: -1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(swingAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const rotate = swingAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-1.5deg", "0deg", "1.5deg"],
  });

  const cardWidth = SCREEN_WIDTH * 0.42;
  const cardHeight = cardWidth * 1.35;

  // Frame colours by mode
  const outerFrameColor = isDigital ? "#2A1A4E" : "#C4A96B";
  const frameBackColor = isDigital ? "#1A0A2E" : "#D4B97B";
  const innerFrameColor = isDigital ? "#BF00FF" : "#A8883E";
  const hookColor = isDigital ? "#7B00CC" : "#B8A080";
  const stringColor = isDigital ? "rgba(191,0,255,0.6)" : "#B8A080";
  const labelBg = isDigital ? "#12121E" : "#FFFDF7";
  const labelBorder = isDigital ? "#2A2040" : "#E0D8C8";

  return (
    <Animated.View
      style={[
        styles.paintingContainer,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.swingWrapper,
          { transform: [{ rotate }] },
          { width: cardWidth },
        ]}
      >
        {/* Hanging string/wire */}
        <View style={styles.stringContainer}>
          <View style={[styles.hook, { backgroundColor: hookColor, borderColor: isDigital ? "#9B00FF" : "#9A8060" }]} />
          <View style={[styles.string, { backgroundColor: stringColor }]} />
        </View>

        {/* Painting frame */}
        <Pressable onPress={onPress} style={styles.pressable}>
          {/* Neon glow for digital */}
          {isDigital && (
            <View style={[styles.neonGlow, { width: cardWidth, height: cardHeight }]} />
          )}
          <View style={[styles.frameShadow, { width: cardWidth, height: cardHeight }]} />
          <View
            style={[
              styles.outerFrame,
              {
                width: cardWidth,
                height: cardHeight,
                borderColor: outerFrameColor,
                backgroundColor: frameBackColor,
              },
            ]}
          >
            <View style={[styles.innerFrame, { borderColor: innerFrameColor, backgroundColor: isDigital ? "#1A0A2E" : "#E8E0D0" }]}>
              <Image 
                source={artwork.image} 
                style={styles.paintingImage} 
                resizeMode="cover"
                fadeDuration={300}
              />
              {isDigital && <View style={styles.digitalScanLine} />}
              {artwork.isSoldOut && (
                <View style={[styles.soldOutBadge, { backgroundColor: theme.red }]}>
                  <Text style={styles.soldOutText}>SOLD</Text>
                </View>
              )}
              {isLiked && (
                <View style={styles.likedBadge}>
                  <Text style={[styles.likedIcon, { color: theme.red }]}>♥</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>

        {/* Label */}
        <View
          style={[
            styles.label,
            {
              width: cardWidth - 8,
              backgroundColor: labelBg,
              borderColor: labelBorder,
            },
          ]}
        >
          <Text style={[styles.labelTitle, { color: theme.text, fontFamily: fonts.semiBold }]} numberOfLines={1}>
            {artwork.title}
          </Text>
          <Text style={[styles.labelArtist, { color: theme.textLight, fontFamily: fonts.regular }]} numberOfLines={1}>
            {artwork.artist}
          </Text>
          {showPrice && (
            <Text style={[styles.labelPrice, { color: isDigital ? "#BF00FF" : "#8B6914", fontFamily: fonts.semiBold }]}>
              {artwork.isSoldOut
                ? "Sold Out"
                : `${artwork.price.toLocaleString()} ${artwork.currency}`}
            </Text>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  paintingContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  swingWrapper: {
    alignItems: "center",
  },
  stringContainer: {
    alignItems: "center",
    height: 32,
  },
  hook: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    marginBottom: 2,
  },
  string: {
    width: 1.5,
    flex: 1,
  },
  pressable: {
    alignItems: "center",
  },
  neonGlow: {
    position: "absolute",
    borderRadius: 4,
    backgroundColor: "rgba(191,0,255,0.15)",
    transform: [{ scaleX: 1.04 }, { scaleY: 1.03 }],
  },
  frameShadow: {
    position: "absolute",
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    transform: [{ translateX: 4 }, { translateY: 6 }],
  },
  outerFrame: {
    borderRadius: 4,
    borderWidth: 6,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 2,
    overflow: "hidden",
  },
  paintingImage: {
    width: "100%",
    height: "100%",
  },
  digitalScanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,255,204,0.15)",
    opacity: 0.5,
  },
  soldOutBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  soldOutText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  likedBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  likedIcon: {
    fontSize: 12,
  },
  label: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  labelTitle: {
    fontSize: 12,
    marginBottom: 1,
  },
  labelArtist: {
    fontSize: 10,
    marginBottom: 4,
  },
  labelPrice: {
    fontSize: 11,
  },
});
