import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useCart } from "@/context/CartContext";
import { router } from "expo-router";

interface MulaHeaderProps {
  showSearch?: boolean;
  showCart?: boolean;
  showMenu?: boolean;
  title?: string;
  transparent?: boolean;
}

export function MulaHeader({
  showSearch = true,
  showCart = true,
  showMenu = true,
  title,
  transparent = false,
}: MulaHeaderProps) {
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();

  const topPad =
    Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.header,
        transparent && styles.transparent,
        { paddingTop: topPad + 12 },
      ]}
    >
      <View style={styles.row}>
        {showMenu && (
          <Pressable style={styles.iconBtn} hitSlop={8}>
            <Feather name="menu" size={22} color={transparent ? "#fff" : Colors.text} />
          </Pressable>
        )}

        <View style={styles.titleContainer}>
          {title ? (
            <Text style={[styles.screenTitle, transparent && styles.lightText]}>
              {title}
            </Text>
          ) : (
            <Text style={[styles.logoText, transparent && styles.lightText]}>
              M U L A
            </Text>
          )}
        </View>

        <View style={styles.rightActions}>
          {showSearch && (
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <Feather name="search" size={22} color={transparent ? "#fff" : Colors.text} />
            </Pressable>
          )}
          {showCart && (
            <Pressable
              style={styles.iconBtn}
              hitSlop={8}
              onPress={() => router.push("/cart")}
            >
              <Feather name="shopping-bag" size={22} color={transparent ? "#fff" : Colors.text} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.cream,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transparent: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: 8,
  },
  lightText: {
    color: "#fff",
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: 1,
  },
  rightActions: {
    flexDirection: "row",
    gap: 4,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: Colors.gold,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
});
