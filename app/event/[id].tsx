import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { Event } from "@/constants/data";
import { api } from "@/services/api";
import { mapEvent, extractSingle } from "@/services/mappers";
import { LoadingScreen } from "@/components/LoadingScreen";

const { width: SW, height: SH } = Dimensions.get("window");
const HERO_H = SH * 0.42;
const GOLD = "#D4AF37";
const GOLD_DARK = "#B8960C";

const STATUS_COLORS: Record<string, { text: string; bg: string; dot: string }> = {
  current:  { text: "#16A34A", bg: "#DCFCE7", dot: "#22C55E" },
  upcoming: { text: "#92400E", bg: "#FEF3C7", dot: "#D4AF37" },
  past:     { text: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
};

async function fetchEventById(id: string): Promise<{ event: Event; raw: any } | null> {
  try {
    const res = await api.events.getById(id);
    const item = extractSingle(res);
    if (!item) return null;
    console.log("Event raw fields:", JSON.stringify(item));
    return { event: mapEvent(item), raw: item };
  } catch {
    return null;
  }
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [event, setEvent] = useState<Event | null>(null);
  const [rawEvent, setRawEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventById(id).then((data) => {
        setEvent(data?.event ?? null);
        setRawEvent(data?.raw ?? null);
        setLoading(false);
      });
    }
  }, [id]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (loading) return <LoadingScreen />;

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Feather name="calendar" size={48} color={GOLD} />
        <Text style={[styles.notFoundText, { color: theme.text }]}>Event not found</Text>
        <Pressable style={styles.backBtnCenter} onPress={() => router.back()}>
          <Text style={styles.backBtnCenterText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const sc = STATUS_COLORS[event.status] ?? STATUS_COLORS.upcoming;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 48 }}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Image
            source={typeof event.image === "string" ? { uri: event.image } : event.image}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          {/* Top dark fade for back button readability */}
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.0)"]}
            locations={[0, 0.4]}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Bottom fade for title */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.92)"]}
            locations={[0.4, 0.72, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Back button */}
          <Pressable style={[styles.backBtn, { top: topPad + 10 }]} onPress={() => router.back()}>
            <Feather name="chevron-left" size={22} color="#fff" />
          </Pressable>

          {/* Title area */}
          <View style={styles.heroContent}>
            <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
              <Text style={[styles.statusLabel, { color: sc.text, fontFamily: theme.fonts.semiBold }]}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { fontFamily: theme.fonts.bold }]} numberOfLines={3}>
              {event.title}
            </Text>
            {event.title_mm && event.title_mm !== event.title && (
              <Text style={[styles.heroSubTitle, { fontFamily: theme.fonts.regular }]}>
                {event.title_mm}
              </Text>
            )}
            <View style={styles.heroAccentLine} />
          </View>
        </View>

        {/* ── Info Cards Row ── */}
        <View style={styles.infoRow}>
          {/* Date */}
          <View style={[styles.infoCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={[styles.infoCardIcon, { backgroundColor: `${GOLD}15` }]}>
              <Feather name="calendar" size={16} color={GOLD} />
            </View>
            <Text style={[styles.infoCardLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Date</Text>
            <Text style={[styles.infoCardValue, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
              {event.date}
            </Text>
            {event.end_date && event.end_date !== event.date && (
              <Text style={[styles.infoCardSub, { color: GOLD, fontFamily: theme.fonts.medium }]}>
                → {event.end_date}
              </Text>
            )}
          </View>

          {/* Time */}
          <View style={[styles.infoCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={[styles.infoCardIcon, { backgroundColor: `${GOLD}15` }]}>
              <Feather name="clock" size={16} color={GOLD} />
            </View>
            <Text style={[styles.infoCardLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Time</Text>
            <Text style={[styles.infoCardValue, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
              {event.start_time ?? "—"}
            </Text>
            {event.end_time && (
              <Text style={[styles.infoCardSub, { color: GOLD, fontFamily: theme.fonts.medium }]}>
                → {event.end_time}
              </Text>
            )}
          </View>
        </View>

        {/* ── Location ── */}
        <View style={[styles.locationCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <View style={[styles.locationIcon, { backgroundColor: `${GOLD}15` }]}>
            <Feather name="map-pin" size={17} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoCardLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Location</Text>
            <Text style={[styles.locationValue, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
              {event.location}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.textLight} />
        </View>

        {/* ── About ── */}
        {!!event.description && (
          <View style={styles.aboutSection}>
            <View style={styles.aboutHeader}>
              <View style={styles.aboutAccent} />
              <Text style={[styles.aboutTitle, { color: theme.text, fontFamily: theme.fonts.bold }]}>About this Event</Text>
            </View>
            <Text style={[styles.aboutBody, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
              {event.description}
            </Text>
            {!!event.description_mm && event.description_mm !== event.description && (
              <>
                <View style={[styles.aboutDivider, { backgroundColor: theme.border }]} />
                <Text style={[styles.aboutBody, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                  {event.description_mm}
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  backBtnCenter: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: GOLD },
  backBtnCenterText: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 14 },

  // Hero
  hero: { width: SW, height: HERO_H, position: "relative" },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 28,
    gap: 8,
  },
  statusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 12 },
  heroTitle: { fontSize: 26, color: "#fff", lineHeight: 34, letterSpacing: 0.2 },
  heroSubTitle: { fontSize: 15, color: "rgba(255,255,255,0.75)", marginTop: -4 },
  heroAccentLine: { width: 44, height: 3, backgroundColor: GOLD, borderRadius: 2, marginTop: 4 },

  // Info cards row
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 24,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  infoCardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoCardLabel: { fontSize: 11, marginTop: 2 },
  infoCardValue: { fontSize: 13, lineHeight: 18 },
  infoCardSub: { fontSize: 12 },

  // Location
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  locationIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  locationValue: { fontSize: 14, marginTop: 2, lineHeight: 20 },

  // About
  aboutSection: { marginHorizontal: 20, marginTop: 28, gap: 14 },
  aboutHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  aboutAccent: { width: 4, height: 20, backgroundColor: GOLD, borderRadius: 2 },
  aboutTitle: { fontSize: 16 },
  aboutBody: { fontSize: 14, lineHeight: 26 },
  aboutDivider: { height: 1 },
});
