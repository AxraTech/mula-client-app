import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/services/storage";

const { width: W, height: H } = Dimensions.get("window");

type SlideKind = "intro" | "quote" | "manifesto" | "start3";

type Slide = {
  key: string;
  kind: SlideKind;
};

const slides: Slide[] = [
  { key: "manifesto", kind: "manifesto" },
  { key: "quote", kind: "quote" },
  { key: "start3", kind: "start3" },
  { key: "intro", kind: "intro" },
];

function Pagination({ activeIndex, light = false }: { activeIndex: number; light?: boolean }) {
  return (
    <View style={styles.pagination}>
      {slides.map((item, i) => (
        <View
          key={item.key}
          style={[
            styles.dot,
            light ? styles.dotLight : null,
            i === activeIndex ? styles.dotActive : null,
            i === activeIndex && light ? styles.dotActiveLight : null,
          ]}
        />
      ))}
    </View>
  );
}

function BrandLockup({ dark = false }: { dark?: boolean }) {
  return (
    <View style={styles.brandLockup}>
      <Image source={require("../assets/images/logos.png")} style={styles.brandLogo} resizeMode="contain" />
      <Text style={[styles.brandWordmark, dark ? styles.brandWordmarkDark : null]}>M U L A</Text>
    </View>
  );
}

function IntroSlide({ onVisit, topInset }: { onVisit: () => void; topInset: number }) {
  return (
    <View style={styles.slide}>
      <View style={styles.introCanvas}>
        <Text style={[styles.watermark, { top: topInset + 22, right: -40 }]}>MULA</Text>
        <Text style={[styles.watermark, { top: H * 0.29, left: -42 }]}>MULA</Text>
        <Text style={[styles.watermark, { top: H * 0.57, right: -36 }]}>MULA</Text>
      </View>

      <View style={[styles.introHeader, { paddingTop: topInset + 10 }]}>
        <BrandLockup dark />
      </View>

      <View style={styles.introHeroBlock}>
        <View style={styles.introFrame}>
          <Image
            source={require("../assets/images/visit-gallery-art.jpg")}
            style={styles.introImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.introCaptionRow}>
          <View style={styles.introCaptionLine} />
          <Text style={styles.introCaption}>A curated invitation</Text>
        </View>
      </View>

      <View style={styles.introContent}>
        <Text style={styles.introTitle}>MULA</Text>
        <Text style={styles.introSubtitle}>
          The Art Gallery, Timeless Art for an Ever-Changing World.
        </Text>

        <Pressable style={styles.primaryButton} onPress={onVisit}>
          <View style={styles.primaryButtonFill}>
            <Text style={styles.primaryButtonText}>Visit Gallery</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function QuoteSlide({
  onNext,
  activeIndex,
  topInset,
  bottomInset,
}: {
  onNext: () => void;
  activeIndex: number;
  topInset: number;
  bottomInset: number;
}) {
  return (
    <ImageBackground
      source={require("../assets/images/onboarding-bg-2.jpg")}
      style={styles.slide}
      blurRadius={5}
      imageStyle={styles.fullBg}
    >
      <LinearGradient
        colors={["rgba(10,10,10,0.18)", "rgba(235,235,232,0.88)", "rgba(244,244,241,0.95)"]}
        locations={[0, 0.54, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.diagonalMask, { top: topInset + 14 }]} />

      <View style={[styles.quoteHeader, { paddingTop: topInset + 4 }]}>
        <BrandLockup dark />
      </View>

      <View style={styles.quoteBody}>
        <View style={styles.quoteAvatarFrame}>
          <Image
            source={require("../assets/images/van-gogh-portrait.jpg")}
            style={styles.quoteAvatar}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.quoteHeadline}>
          {'"I dream of painting\nand then I paint\nmy dream."'}
        </Text>

        <View style={styles.quoteMeta}>
          <Text style={styles.quoteAuthor}>Vincent van Gogh</Text>
          <Text style={styles.quoteYears}>1853 - 1890</Text>
        </View>
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: bottomInset + 24 }]}>
        <Pagination activeIndex={activeIndex} />
        <Pressable onPress={onNext} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Next</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

function ManifestoSlide({
  onNext,
  activeIndex,
  topInset,
  bottomInset,
}: {
  onNext: () => void;
  activeIndex: number;
  topInset: number;
  bottomInset: number;
}) {
  return (
    <ImageBackground
      source={require("../assets/images/onboarding-bg-3.jpg")}
      style={styles.slide}
      blurRadius={5}
      imageStyle={styles.fullBg}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.18)", "rgba(239,239,241,0.78)", "rgba(230,231,234,0.90)"]}
        locations={[0, 0.46, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.manifestoHeader, { paddingTop: topInset + 4 }]}>
        <BrandLockup dark />
      </View>

      <View style={styles.manifestoBody}>
        <Text style={styles.manifestoEyebrow}>Modern exhibition series</Text>
        <Text style={styles.manifestoTitle}>
          {"Daring to be\nDifferent"}
        </Text>
        <Text style={styles.manifestoSubtitle}>
          A modern and contemporary art exhibition shaped by bold forms, restless ideas, and a sharper visual language.
        </Text>
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: bottomInset + 24 }]}>
        <Pagination activeIndex={activeIndex} />
        <Pressable style={styles.darkButton} onPress={onNext}>
          <Text style={styles.darkButtonText}>Next</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

function Start3Slide({
  onNext,
  activeIndex,
  topInset,
  bottomInset,
}: {
  onNext: () => void;
  activeIndex: number;
  topInset: number;
  bottomInset: number;
}) {
  return (
    <ImageBackground
      source={require("../assets/images/onboarding-bg-1.jpg")}
      style={styles.slide}
      blurRadius={5}
      imageStyle={styles.fullBg}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.58)", "rgba(241,241,240,0.82)", "rgba(233,233,231,0.90)"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.start3Body, { paddingTop: topInset + 170 }]}>
        <Text style={styles.start3Title}>
          {"MULA: The Art Gallery,\nTimeless art for an ever-\nchanging world."}
        </Text>
        <Text style={styles.start3Subtitle}>
          {"- Unearthing the Roots of\nCreativity"}
        </Text>
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: bottomInset + 24 }]}>
        <Pagination activeIndex={activeIndex} />
        <Pressable onPress={onNext} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Next</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCheckingGuard, setIsCheckingGuard] = useState(true);
  const viewabilityConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 60 }), []);

  useEffect(() => {
    if (isLoading) return;

    let mounted = true;

    storage
      .getWelcomeSeen()
      .then((hasSeenWelcome) => {
        if (!mounted) return;

        if (isAuthenticated) {
          router.replace("/(tabs)" as never);
          return;
        }

        if (hasSeenWelcome) {
          router.replace("/login?direct=1" as never);
          return;
        }

        setIsCheckingGuard(false);
      })
      .catch(() => {
        if (mounted) setIsCheckingGuard(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) {
      setActiveIndex(first.index);
    }
  }).current;

  const completeWelcome = async () => {
    await storage.setWelcomeSeen();
    router.replace("/(tabs)" as never);
  };

  const goNext = () => {
    if (activeIndex >= slides.length - 1) {
      void completeWelcome();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const enter = () => {
    void completeWelcome();
  };

  if (isLoading || isCheckingGuard) {
    return (
      <View style={styles.guardContainer}>
        <ActivityIndicator size="large" color="#A5650E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={activeIndex === slides.length - 1 ? "dark" : "light"} />

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => {
          if (item.kind === "intro") {
            return <IntroSlide onVisit={goNext} topInset={insets.top} />;
          }
          if (item.kind === "quote") {
            return (
              <QuoteSlide
                onNext={goNext}
                activeIndex={index}
                topInset={insets.top}
                bottomInset={insets.bottom}
              />
            );
          }
          if (item.kind === "manifesto") {
            return (
              <ManifestoSlide
                onNext={goNext}
                activeIndex={index}
                topInset={insets.top}
                bottomInset={insets.bottom}
              />
            );
          }
          return (
            <Start3Slide
              onNext={goNext}
              activeIndex={index}
              topInset={insets.top}
              bottomInset={insets.bottom}
            />
          );
        }}
      />

      {activeIndex > 0 ? (
        <Pressable onPress={enter} style={[styles.skipButton, { top: insets.top + 10 }]}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  guardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F1EA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F1EB",
  },
  slide: {
    width: W,
    height: H,
    alignItems: "center",
  },
  introCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F6F1EA",
  },
  watermark: {
    position: "absolute",
    fontFamily: "Poppins_400Regular",
    fontSize: 67,
    letterSpacing: 1,
    color: "rgba(198,147,74,0.18)",
  },
  introHeader: {
    alignItems: "center",
  },
  brandLockup: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogo: {
    width: 60,
    height: 60,
  },
  brandWordmark: {
    marginTop: 5,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    letterSpacing: 7,
    color: "#FFFFFF",
    textShadowColor: "rgba(255,255,255,0.78)",
    textShadowRadius: 10,
  },
  brandWordmarkDark: {
    color: "#171717",
    textShadowColor: "rgba(255,255,255,0.56)",
  },
  introHeroBlock: {
    marginTop: 18,
    alignItems: "center",
  },
  introFrame: {
    width: W * 0.56,
    height: H * 0.45,
    borderRadius: 170,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(155,94,17,0.12)",
    overflow: "hidden",
  },
  introImage: {
    width: "100%",
    height: "100%",
    borderRadius: 170,
  },
  introCaptionRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  introCaptionLine: {
    width: 28,
    height: 1,
    backgroundColor: "rgba(155,94,17,0.35)",
  },
  introCaption: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "rgba(120,87,45,0.72)",
  },
  introContent: {
    marginTop: 22,
    alignItems: "center",
    paddingHorizontal: 34,
  },
  introTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 47,
    lineHeight: 51,
    color: "#9B5E11",
    letterSpacing: 0.4,
  },
  introSubtitle: {
    marginTop: 12,
    maxWidth: 286,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    fontSize: 17,
    lineHeight: 28,
    color: "rgba(124,86,32,0.92)",
  },
  primaryButton: {
    marginTop: 28,
    borderRadius: 999,
    backgroundColor: "#A5650E",
  },
  primaryButtonFill: {
    minWidth: 194,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  primaryButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    letterSpacing: 1,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  fullBg: {
    width: W,
    height: H,
  },
  diagonalMask: {
    position: "absolute",
    left: -W * 0.12,
    width: W * 1.24,
    height: 108,
    backgroundColor: "rgba(190,190,190,0.84)",
    transform: [{ rotate: "-8deg" }],
  },
  quoteHeader: {
    width: "100%",
    alignItems: "center",
  },
  quoteBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 20,
  },
  quoteAvatarFrame: {
    width: 132,
    height: 132,
    borderRadius: 66,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
  },
  quoteAvatar: {
    width: "100%",
    height: "100%",
  },
  quoteHeadline: {
    marginTop: 4,
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
    fontSize: 25,
    lineHeight: 39,
    color: "#111111",
    maxWidth: W * 0.82,
  },
  quoteMeta: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 18,
  },
  quoteAuthor: {
    fontFamily: "Poppins_500Medium",
    fontSize: 20,
    color: "#343434",
  },
  quoteYears: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#5C5C5C",
    marginBottom: 2,
  },
  manifestoHeader: {
    width: "100%",
    alignItems: "center",
  },
  manifestoBody: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingBottom: 80,
  },
  manifestoEyebrow: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(17,17,17,0.65)",
    marginBottom: 16,
  },
  manifestoTitle: {
    width: W * 0.78,
    fontFamily: "Poppins_700Bold",
    fontSize: 45,
    lineHeight: 55,
    color: "#111111",
  },
  manifestoSubtitle: {
    width: W * 0.76,
    marginTop: 18,
    fontFamily: "Poppins_500Medium",
    fontSize: 17,
    lineHeight: 29,
    color: "rgba(17,17,17,0.78)",
  },
  start3Body: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 26,
    paddingBottom: 92,
    alignItems: "flex-start",
  },
  start3Title: {
    width: W * 0.86,
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    lineHeight: 41,
    color: "#111111",
  },
  start3Subtitle: {
    width: W * 0.82,
    marginTop: 52,
    textAlign: "center",
    alignSelf: "center",
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    lineHeight: 31,
    color: "rgba(17,17,17,0.82)",
  },
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#222222",
    backgroundColor: "transparent",
  },
  dotLight: {
    borderColor: "rgba(255,255,255,0.9)",
  },
  dotActive: {
    backgroundColor: "#353535",
  },
  dotActiveLight: {
    backgroundColor: "#FFFFFF",
  },
  linkButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  linkButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#1A1A1A",
  },
  darkButton: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "#141414",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  darkButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  skipButton: {
    position: "absolute",
    right: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  skipText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#202020",
  },
});
