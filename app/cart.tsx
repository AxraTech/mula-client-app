import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft, ShoppingBag, Trash2, Lock, Tag, Truck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { ConfirmModal } from "@/components/ConfirmModal";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5ECC8";
const GOLD_DARK = "#8B6914";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, clearCart, total, itemCount } = useCart();
  const { theme, isDigital } = useTheme();

  const [clearModal, setClearModal] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const accent = isDigital ? "#BF00FF" : GOLD;
  const accentGrad: readonly [string, string] = isDigital
    ? ["#BF00FF", "#7B00CC"]
    : ["#C4952A", GOLD_DARK];

  const handleCheckout = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/checkout");
  };

  return (
    <View style={[styles.container, { backgroundColor: "#FAFAF8" }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={22} color="#1A1A2E" strokeWidth={1.8} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {itemCount > 0 && (
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{itemCount}</Text>
            </View>
          )}
        </View>
        {items.length > 0 ? (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setClearModal(true);
            }}
            hitSlop={8}
          >
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Gold rule */}
      <View style={styles.goldRule} />

      {items.length === 0 ? (
        /* ── Empty State ── */
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <ShoppingBag size={44} color={GOLD} strokeWidth={1.2} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Discover original artworks and add them to your collection
          </Text>
          <Pressable style={styles.browseBtn} onPress={() => router.back()}>
            <LinearGradient colors={["#C4952A", GOLD_DARK]} style={styles.browseBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.browseBtnText}>Browse Gallery</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 140 }]}
          >
            {/* ── Cart Items ── */}
            {items.map((item, index) => (
              <View key={item.artwork.id}>
                <View style={styles.cartItem}>
                  {/* Artwork image */}
                  <View style={styles.imageWrap}>
                    <Image
                      source={item.artwork.image}
                      style={styles.itemImage}
                      contentFit="cover"
                    />
                    <View style={[styles.imageAccentLine, { backgroundColor: accent }]} />
                  </View>

                  {/* Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.artwork.title}
                    </Text>
                    <Text style={styles.itemArtist} numberOfLines={1}>
                      {item.artwork.artist}
                    </Text>
                    {!!item.artwork.medium && (
                      <View style={styles.mediumPill}>
                        <Tag size={9} color={GOLD} strokeWidth={2} />
                        <Text style={styles.mediumText}>{item.artwork.medium}</Text>
                      </View>
                    )}
                    <View style={styles.priceRow}>
                      <Text style={[styles.itemPrice, { color: accent }]}>
                        {item.artwork.price.toLocaleString()}
                      </Text>
                      <Text style={styles.currency}>MMK</Text>
                      {item.quantity > 1 && (
                        <View style={styles.qtyBadge}>
                          <Text style={styles.qtyText}>×{item.quantity}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Remove */}
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setRemoveId(item.artwork.id);
                    }}
                    hitSlop={6}
                  >
                    <Trash2 size={17} color="#C0392B" strokeWidth={1.8} />
                  </Pressable>
                </View>

                {/* Separator (not last) */}
                {index < items.length - 1 && <View style={styles.itemSeparator} />}
              </View>
            ))}

            {/* ── Order Summary ── */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryHeading}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {itemCount} {itemCount === 1 ? "artwork" : "artworks"}
                </Text>
                <Text style={styles.summaryValue}>{total.toLocaleString()} MMK</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.deliveryRow}>
                  <Truck size={13} color="#22C55E" strokeWidth={2} />
                  <Text style={styles.summaryLabel}>Delivery</Text>
                </View>
                <Text style={[styles.summaryValue, { color: "#22C55E" }]}>Free</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={[styles.totalValue, { color: accent }]}>
                  {total.toLocaleString()} MMK
                </Text>
              </View>
            </View>

            {/* ── Payment Methods ── */}
            <View style={styles.paymentRow}>
              {["KBZPay", "WavePay", "AYA Pay", "Card"].map((m) => (
                <View key={m} style={[styles.payChip, { borderColor: `${accent}55` }]}>
                  <Text style={[styles.payChipText, { color: accent }]}>{m}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* ── Checkout Bar ── */}
          <View style={[styles.bottomBar, { paddingBottom: bottomPad + 16 }]}>
            <LinearGradient
              colors={["rgba(250,250,248,0)", "rgba(250,250,248,0.97)", "#FAFAF8"]}
              style={styles.bottomFade}
              pointerEvents="none"
            />
            <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
              <LinearGradient
                colors={accentGrad}
                style={styles.checkoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Lock size={15} color="#fff" strokeWidth={2} />
                <Text style={styles.checkoutBtnText}>
                  Proceed to Checkout
                </Text>
              
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}

      {/* Clear cart modal */}
      <ConfirmModal
        visible={clearModal}
        title="Clear Cart"
        message="Remove all artworks from your cart? This cannot be undone."
        confirmLabel="Clear All"
        variant="danger"
        icon="trash-2"
        onConfirm={() => { setClearModal(false); clearCart(); }}
        onCancel={() => setClearModal(false)}
      />

      {/* Remove single item modal */}
      <ConfirmModal
        visible={!!removeId}
        title="Remove Artwork"
        message="Remove this artwork from your cart?"
        confirmLabel="Remove"
        variant="warning"
        icon="x-circle"
        onConfirm={() => { if (removeId) removeFromCart(removeId); setRemoveId(null); }}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FAFAF8",
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E", letterSpacing: 0.3 },
  itemCountBadge: {
    backgroundColor: GOLD,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  itemCountText: { fontSize: 11, fontFamily: "Poppins_700Bold", color: "#fff" },
  clearText: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#9CA3AF", width: 60, textAlign: "right" },

  goldRule: { height: 1.5, marginHorizontal: 20, backgroundColor: GOLD_LIGHT, marginBottom: 8 },

  /* Empty */
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: GOLD_LIGHT,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },
  emptyText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#9CA3AF", textAlign: "center", lineHeight: 20 },
  browseBtn: { borderRadius: 24, overflow: "hidden", marginTop: 8 },
  browseBtnGrad: { paddingHorizontal: 36, paddingVertical: 13 },
  browseBtnText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#fff" },

  /* Content */
  content: { paddingHorizontal: 20, paddingTop: 8 },

  /* Cart Item */
  cartItem: { flexDirection: "row", paddingVertical: 16, alignItems: "center" },
  imageWrap: { position: "relative", borderRadius: 12, overflow: "hidden" },
  itemImage: { width: 80, height: 96, borderRadius: 12 },
  imageAccentLine: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  itemInfo: { flex: 1, paddingHorizontal: 14, gap: 3 },
  itemTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E", lineHeight: 20 },
  itemArtist: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#6B7280" },
  mediumPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    backgroundColor: GOLD_LIGHT,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, marginTop: 2,
  },
  mediumText: { fontSize: 10, fontFamily: "Poppins_500Medium", color: GOLD_DARK },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  itemPrice: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  currency: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#9CA3AF", marginTop: 2 },
  qtyBadge: {
    backgroundColor: "#F3F4F6", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 1, marginLeft: 4,
  },
  qtyText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#6B7280" },
  removeBtn: { padding: 8 },
  itemSeparator: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 4 },

  /* Summary */
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F0EBD8",
    ...Platform.select({
      ios: { shadowColor: "#C9A22720", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  summaryHeading: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryLabel: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#6B7280" },
  summaryValue: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },
  summaryDivider: { height: 1, backgroundColor: "#F0EBD8" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },
  totalValue: { fontSize: 18, fontFamily: "Poppins_700Bold" },

  /* Payment chips */
  paymentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16, marginBottom: 4 },
  payChip: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: "#fff",
  },
  payChipText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },

  /* Bottom checkout bar */
  bottomBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  bottomFade: {
    position: "absolute", top: -32, left: 0, right: 0, height: 40,
  },
  checkoutBtn: { borderRadius: 18, overflow: "hidden" },
  checkoutGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  checkoutBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  checkoutPricePill: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  checkoutPriceText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#fff" },
});
