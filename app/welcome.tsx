import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width: W, height: H } = Dimensions.get("window");
const GOLD = "#D4AF37";
const GOLD2 = "#B8960C";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const imgAnim   = useRef(new Animated.Value(0)).current;
  const logoAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(imgAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(logoAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad    = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Full-screen painting */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgAnim }]}>
        <Image
          source={require("../assets/images/art3.png")}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        {/* Deep bottom gradient */}
        <LinearGradient
          colors={["transparent", "rgba(5,3,2,0.5)", "rgba(5,3,2,0.92)", "#050302"]}
          locations={[0.25, 0.55, 0.78, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Subtle top vignette */}
        <LinearGradient
          colors={["rgba(0,0,0,0.45)", "transparent"]}
          locations={[0, 0.35]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Top: MULA logo */}
      <Animated.View style={[styles.topBar, { paddingTop: topPad + 12, opacity: logoAnim }]}>
        <Image
          source={require("../assets/images/logos.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Bottom content */}
      <Animated.View
        style={[
          styles.bottomContent,
          { paddingBottom: bottomPad + 32, opacity: logoAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Gold rule */}
        <View style={styles.goldRule} />

        <Text style={styles.headline}>Discover Myanmar's{"\n"}Finest Artworks.</Text>
        <Text style={styles.sub}>A curated gallery of traditional{"\n"}& digital masterpieces.</Text>

        {/* CTA button */}
        <Animated.View style={[styles.btnWrap, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }]}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace("/(tabs)" as any)}
          >
            <LinearGradient
              colors={[GOLD, GOLD2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGradient}
            >
              <Text style={styles.primaryBtnText}>Explore the Gallery</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={() => router.push("/login")}>
            <Text style={styles.secondaryBtnText}>
              Already a member?{"  "}
              <Text style={styles.secondaryBtnBold}>Sign In</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050302",
  },

  // Top logo bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },

  // Bottom content
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    gap: 12,
  },
  goldRule: {
    width: 44,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
    marginBottom: 4,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
    lineHeight: 40,
    letterSpacing: 0.3,
  },
  sub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    marginBottom: 8,
  },

  // Buttons
  btnWrap: {
    gap: 14,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
  primaryGradient: {
    paddingVertical: 17,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  secondaryBtnText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  secondaryBtnBold: {
    color: GOLD,
    fontFamily: "Poppins_600SemiBold",
  },
});
