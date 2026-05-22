import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ArtModeToggle } from "./ArtModeToggle";
import { ConfirmModal } from "./ConfirmModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);
const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5ECC8";
const GOLD_DARK = "#8B6914";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: "image" as const,       label: "Gallery",   route: "/(tabs)/index" },
  { icon: "shopping-bag" as const, label: "Shop",      route: "/(tabs)/shop" },
  { icon: "users" as const,        label: "Artists",   route: "/(tabs)/artists" },
  { icon: "play-circle" as const,  label: "Videos",    route: "/(tabs)/videos" },
  { icon: "book-open" as const,    label: "Articles",  route: "/(tabs)/articles" },
  { icon: "calendar" as const,     label: "Events",    route: "/(tabs)/events" },
];

const ACCOUNT_ITEMS = [
  { icon: "heart" as const,        label: "Wishlist",      route: "/favourites" },
  { icon: "shopping-cart" as const, label: "My Cart",      route: "/cart" },
  { icon: "package" as const,       label: "Orders",       route: "/order-history" },
  { icon: "user" as const,          label: "Profile",      route: "/profile" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, isDigital } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [logoutModal, setLogoutModal] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 240, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const accent = isDigital ? "#BF00FF" : GOLD;

  const displayName = user?.fullname ?? user?.name ?? "Guest";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleNav = (route: string) => { onClose(); router.push(route as any); };
  const handleLogout = async () => { await logout(); onClose(); router.replace("/welcome"); };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]} pointerEvents={isOpen ? "auto" : "none"}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }], paddingTop: topPad, paddingBottom: bottomPad + 16 }]}>

        {/* Top gold accent bar */}
        <View style={[styles.topAccentBar, { backgroundColor: accent }]} />

        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.brandName}>MULA</Text>
              <Text style={styles.brandTagline}>ART  ·  GALLERY</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Feather name="x" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Art Mode Toggle */}
          <View style={styles.modeSection}>
            <ArtModeToggle />
          </View>

          {/* User Card */}
          {isAuthenticated && user ? (
            <Pressable style={styles.userCard} onPress={() => handleNav("/profile")}>
              <LinearGradient colors={isDigital ? ["#2D0050", "#1A0035"] : ["#F5ECC8", "#EDD98A"]} style={styles.avatarCircle}>
                <Text style={[styles.avatarText, { color: isDigital ? "#BF00FF" : GOLD_DARK }]}>{initials}</Text>
              </LinearGradient>
              <View style={styles.userMeta}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userSub} numberOfLines={1}>{user.phone ?? user.email ?? "Mula Member"}</Text>
              </View>
              <View style={[styles.chevronWrap, { backgroundColor: isDigital ? "#BF00FF18" : "#D4AF3718" }]}>
                <Feather name="chevron-right" size={14} color={accent} />
              </View>
            </Pressable>
          ) : (
            <View style={styles.authRow}>
              <Pressable style={[styles.authBtn, styles.authBtnPrimary, { backgroundColor: accent }]} onPress={() => handleNav("/login")}>
                <Text style={styles.authBtnPrimaryText}>Sign In</Text>
              </Pressable>
              <Pressable style={[styles.authBtn, styles.authBtnOutline, { borderColor: accent }]} onPress={() => handleNav("/signup")}>
                <Text style={[styles.authBtnOutlineText, { color: accent }]}>Sign Up</Text>
              </Pressable>
            </View>
          )}

          {/* Gold divider */}
          <View style={styles.goldDivider} />

          {/* Navigation */}
          <Text style={styles.sectionLabel}>EXPLORE</Text>
          <View style={styles.navGroup}>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} accent={accent} isDigital={isDigital} onPress={() => handleNav(item.route)} />
            ))}
          </View>

          {/* Gold divider */}
          <View style={styles.goldDivider} />

          {/* Account row — 2×2 grid */}
          <Text style={styles.sectionLabel}>MY ACCOUNT</Text>
          <View style={styles.accountGrid}>
            {ACCOUNT_ITEMS.map((item) => (
              <AccountTile key={item.label} item={item} accent={accent} isDigital={isDigital} onPress={() => handleNav(item.route)} />
            ))}
          </View>

          {/* Sign out */}
          {isAuthenticated && (
            <>
              <View style={styles.goldDivider} />
              <Pressable style={styles.logoutBtn} onPress={() => setLogoutModal(true)}>
                <Feather name="log-out" size={15} color="#EF4444" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>

      <ConfirmModal
        visible={logoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your Mula account?"
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        variant="danger"
        icon="log-out"
        onConfirm={() => { setLogoutModal(false); handleLogout(); }}
        onCancel={() => setLogoutModal(false)}
      />
    </View>
  );
}

function AccountTile({ item, accent, isDigital, onPress }: { item: any; accent: string; isDigital: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.accountTile, { borderColor: `${accent}22` }, pressed && { backgroundColor: `${accent}10` }]}
      onPress={onPress}
    >
      <View style={[styles.accountTileIcon, { backgroundColor: `${accent}15` }]}>
        <Feather name={item.icon} size={18} color={accent} />
      </View>
      <Text style={styles.accountTileLabel}>{item.label}</Text>
    </Pressable>
  );
}

function NavItem({ item, accent, isDigital, onPress }: { item: any; accent: string; isDigital: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navItem, pressed && { backgroundColor: `${accent}12` }]}
      onPress={onPress}
    >
      <View style={[styles.navIcon, { backgroundColor: `${accent}15` }]}>
        <Feather name={item.icon} size={16} color={accent} />
      </View>
      <Text style={styles.navLabel}>{item.label}</Text>
      <Feather name="chevron-right" size={14} color="#D1D5DB" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,8,5,0.55)",
  },

  drawer: {
    position: "absolute",
    top: 0, left: 0, bottom: 0,
    zIndex: 1000,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },

  topAccentBar: { height: 3, width: "100%" },

  inner: { flex: 1, paddingHorizontal: 20 },
  navGroup: { gap: 0 },
  accountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  accountTile: {
    width: "47%",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FAFAF8",
    alignItems: "center",
    gap: 6,
  },
  accountTileIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  accountTileLabel: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#1A1A2E", textAlign: "center" },

  /* Header */
  drawerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 14,
    paddingBottom: 10,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    letterSpacing: 5,
  },
  brandTagline: {
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
    letterSpacing: 3,
    marginTop: 1,
  },
  closeBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: "#F9FAFB",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#F3F4F6",
  },

  /* Mode section */
  modeSection: { marginBottom: 10 },

  /* User card */
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAFAF8",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F0EBD8",
    marginBottom: 4,
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  userMeta: { flex: 1 },
  userName: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },
  userSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#9CA3AF", marginTop: 1 },
  chevronWrap: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  /* Auth */
  authRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  authBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center" },
  authBtnPrimary: {},
  authBtnPrimaryText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  authBtnOutline: { borderWidth: 1.5 },
  authBtnOutlineText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },

  /* Divider */
  goldDivider: { height: 1, backgroundColor: "#F5ECC8", marginVertical: 10 },

  /* Section label */
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Poppins_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 2,
    marginBottom: 4,
  },

  /* Nav items */
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  navIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  navLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium", color: "#1A1A2E" },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  logoutText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#EF4444" },
});
