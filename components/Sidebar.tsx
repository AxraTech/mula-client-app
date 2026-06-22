import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { router, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ConfirmModal } from "./ConfirmModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.76, 300);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  route: string;
  match: string[];
};

const NAV_ITEMS: NavItem[] = [
  { icon: "image", label: "Gallery", route: "/(tabs)/index", match: ["", "index"] },
  { icon: "shopping-bag", label: "Shop", route: "/(tabs)/shop", match: ["shop"] },
  { icon: "users", label: "Artists", route: "/(tabs)/artists", match: ["artists"] },
  { icon: "play-circle", label: "Videos", route: "/(tabs)/videos", match: ["videos"] },
  { icon: "book-open", label: "Articles", route: "/(tabs)/articles", match: ["articles"] },
  { icon: "calendar", label: "Events", route: "/(tabs)/events", match: ["events"] },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { icon: "heart", label: "Wishlist", route: "/favourites", match: ["favourites"] },
  { icon: "shopping-cart", label: "My Cart", route: "/cart", match: ["cart"] },
  { icon: "package", label: "Orders", route: "/order-history", match: ["order-history"] },
  { icon: "user", label: "Profile", route: "/profile", match: ["profile"] },
];

function isNavActive(pathname: string, item: NavItem): boolean {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";

  if (item.match.includes("") || item.match.includes("index")) {
    if (!segments.length || last === "index" || last === "(tabs)") return true;
  }

  return item.match.some((key) => key && (last === key || pathname.includes(`/${key}`)));
}

function NavRow({
  item,
  active,
  accent,
  textColor,
  mutedColor,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  accent: string;
  textColor: string;
  mutedColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.6 }]}
      onPress={onPress}
    >
      {active && <View style={[styles.activeMark, { backgroundColor: accent }]} />}
      <Feather name={item.icon} size={19} color={active ? accent : mutedColor} />
      <Text
        style={[
          styles.navLabel,
          {
            color: active ? accent : textColor,
            fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular",
          },
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, isDigital } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [logoutModal, setLogoutModal] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 10, tension: 70, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const accent = isDigital ? "#BF00FF" : "#8B6914";
  const drawerBg = isDigital ? "#0D0A14" : "#FEFCF8";
  const textColor = theme.text;
  const mutedColor = isDigital ? "#7A6F96" : "#9A8B6B";
  const dividerColor = isDigital ? "rgba(255,255,255,0.08)" : "rgba(139,105,20,0.10)";

  const pathname = usePathname();
  const resolvedName = user?.fullname?.trim() || user?.name?.trim() || user?.phone?.trim() || null;
  const displayName = resolvedName ?? "Mula Member";
  const initials = (resolvedName ?? "M")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleNav = (route: string) => {
    onClose();
    router.push(route as any);
  };
  const handleLogout = async () => {
    await logout();
    onClose();
    router.replace("/");
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]} pointerEvents={isOpen ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
            paddingTop: topPad + 16,
            paddingBottom: bottomPad + 16,
            backgroundColor: drawerBg,
          },
        ]}
      >
        <ScrollView style={styles.inner} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.brand, { color: textColor }]}>MULA</Text>
              <Text style={[styles.brandSub, { color: mutedColor }]}>ART · GALLERY</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={22} color={mutedColor} />
            </Pressable>
          </View>

          {!isLoading && isAuthenticated && resolvedName ? (
            <Pressable style={styles.userRow} onPress={() => handleNav("/profile")}>
              <View style={[styles.avatar, { backgroundColor: `${accent}20` }]}>
                <Text style={[styles.avatarText, { color: accent }]}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={[styles.userSub, { color: mutedColor }]} numberOfLines={1}>
                  {user?.phone ?? user?.email ?? ""}
                </Text>
              </View>
            </Pressable>
          ) : !isLoading && !isAuthenticated ? (
            <Pressable style={[styles.signInBtn, { backgroundColor: accent }]} onPress={() => handleNav("/login")}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          ) : null}

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {NAV_ITEMS.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={isNavActive(pathname, item)}
              accent={accent}
              textColor={textColor}
              mutedColor={mutedColor}
              onPress={() => handleNav(item.route)}
            />
          ))}

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {ACCOUNT_ITEMS.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={isNavActive(pathname, item)}
              accent={accent}
              textColor={textColor}
              mutedColor={mutedColor}
              onPress={() => handleNav(item.route)}
            />
          ))}

          {isAuthenticated && (
            <>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <Pressable
                style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.6 }]}
                onPress={() => setLogoutModal(true)}
              >
                <Feather name="log-out" size={19} color="#E05252" />
                <Text style={[styles.navLabel, { color: "#E05252", fontFamily: "Poppins_500Medium" }]}>
                  Sign Out
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </Animated.View>

      <ConfirmModal
        visible={logoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your Mula account?"
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        variant="danger"
        icon="log-out"
        onConfirm={() => {
          setLogoutModal(false);
          handleLogout();
        }}
        onCancel={() => setLogoutModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 3, height: 0 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 12 },
    }),
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 4,
  },
  brandSub: {
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
    letterSpacing: 2,
    marginTop: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  userName: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  userSub: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  signInBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 4,
  },
  signInText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 11,
    paddingLeft: 10,
    position: "relative",
  },
  activeMark: {
    position: "absolute",
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 16,
  },
});
