import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { Menu } from "lucide-react-native";
import { Sidebar } from "@/components/Sidebar";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EVENTS, Event } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/services/api";
import { mapEvent, extractArray } from "@/services/mappers";

type EventTab = "current" | "upcoming" | "past";

const GOLD = "#D4AF37";

const STATUS_COLORS: Record<EventTab, { text: string; bg: string; dot: string }> = {
  current:  { text: "#16A34A", bg: "#DCFCE7", dot: "#22C55E" },
  upcoming: { text: "#92400E", bg: "#FEF3C7", dot: "#D4AF37" },
  past:     { text: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
};

async function fetchEvents(): Promise<Event[]> {
  const res = await api.events.getAll();
  const arr = extractArray(res);
  if (arr.length === 0) throw new Error("empty");
  return arr.map(mapEvent);
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<EventTab>("upcoming");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: apiEvents, loading, refetch } = useApiData<Event[]>(fetchEvents);

  useEffect(() => {
    if (isAuthenticated) refetch();
  }, [isAuthenticated]);

  const events = loading ? [] : (apiEvents ?? []);

  const filtered = useMemo(
    () => events.filter((e) => e.status === tab),
    [events, tab]
  );

  const TABS: { key: EventTab; label: string }[] = [
    { key: "current", label: "Current" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
  ];

  return (
    <AuthGate>
      <View style={[styles.container, { paddingTop: topPad, backgroundColor: theme.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.bg }]}>
          {/* Top row: menu / brand / refresh */}
          <View style={styles.headerTop}>
            <Pressable style={styles.iconBtn} onPress={() => setSidebarOpen(true)} hitSlop={8}>
              <Menu size={22} color={theme.text} strokeWidth={1.5} />
            </Pressable>

            <View style={styles.brandWrap}>
              <Text style={[styles.brandMark, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>MULA</Text>
              <Text style={[styles.brandSub, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>ART  ·  EVENTS</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={GOLD} style={styles.iconBtn} />
            ) : (
              <Pressable style={styles.iconBtn} onPress={refetch} hitSlop={8}>
                <Feather name="refresh-cw" size={18} color={theme.text} />
              </Pressable>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Tabs */}
          <View style={styles.tabRow}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setTab(t.key)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={GOLD} />}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 },
          ]}
        >
          {filtered.map((event) => {
            const sc = STATUS_COLORS[event.status as EventTab] ?? STATUS_COLORS.upcoming;
            return (
              <Pressable key={event.id} style={styles.eventCard} onPress={() => router.push(`/event/${event.id}` as any)}>
                <Image
                  source={typeof event.image === "string" ? { uri: event.image } : event.image}
                  style={styles.eventImg}
                  contentFit="cover"
                />
                {/* Gradient overlay */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.82)"]}
                  style={styles.cardOverlay}
                >
                  {/* Status badge top-right */}
                  <View style={styles.cardTop}>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                      <Text style={[styles.statusText, { color: sc.text }]}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom info */}
                  <View style={styles.cardBottom}>
                    <Text style={styles.heroTitle} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.heroMeta}>{event.date}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.heroMeta} numberOfLines={1}>{event.location}</Text>
                      </View>
                    </View>
                    {!!event.description && (
                      <Text style={styles.heroDesc} numberOfLines={2}>{event.description}</Text>
                    )}
                    <Pressable style={styles.learnBtn} onPress={() => router.push(`/event/${event.id}` as any)}>
                      <Text style={styles.learnBtnText}>Learn More</Text>
                      <Feather name="arrow-right" size={13} color={GOLD} />
                    </Pressable>
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}

          {filtered.length === 0 && !loading && (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Feather name="calendar" size={32} color={GOLD} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No {tab} events</Text>
              <Text style={[styles.emptyText, { color: theme.textLight }]}>Check back soon for new events</Text>
            </View>
          )}
        </ScrollView>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  brandWrap: {
    alignItems: "center",
  },
  brandMark: {
    fontSize: 21,
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  // List
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  // Card
  eventCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 300,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  eventImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cardBottom: {
    gap: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  heroTitle: {
    fontSize: 19,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    lineHeight: 35,
  },
  metaRow: { gap: 4 },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroMeta: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.8)",
    flex: 1,
  },
  heroDesc: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 19,
  },
  learnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(212,175,55,0.2)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.6)",
    marginTop: 2,
  },
  learnBtnText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: GOLD,
  },

  // Empty
  empty: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D4AF3740",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
});
