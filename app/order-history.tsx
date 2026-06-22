import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { LoadingScreen } from "@/components/LoadingScreen";

const GOLD = "#D4AF37";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

interface Order {
  id: string;
  product_name: string;
  total: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  payment_method: string;
  receiver_name: string;
  receiver_address: string;
  image_url?: string;
}

const STATUS_COLORS: Record<OrderStatus, { text: string; bg: string }> = {
  pending:    { text: "#92400E", bg: "#FEF3C7" },
  processing: { text: "#1E40AF", bg: "#DBEAFE" },
  completed:  { text: "#166534", bg: "#DCFCE7" },
  cancelled:  { text: "#991B1B", bg: "#FEE2E2" },
};

function mapOrder(item: any): Order {
  const rawStatus = String(item.status ?? item.order_status ?? "pending").toLowerCase();
  let status: OrderStatus = "pending";
  if (rawStatus.includes("complet") || rawStatus.includes("done") || rawStatus.includes("delivered")) status = "completed";
  else if (rawStatus.includes("process") || rawStatus.includes("confirm") || rawStatus.includes("shipping")) status = "processing";
  else if (rawStatus.includes("cancel") || rawStatus.includes("reject")) status = "cancelled";

  return {
    id: String(item.id ?? item.order_id ?? ""),
    product_name: item.product_name ?? item.artwork_name ?? item.title ?? item.name ?? "Artwork",
    total: Number(item.total ?? item.total_price ?? item.amount ?? item.price ?? 0),
    currency: item.currency ?? item.price_unit ?? "MMK",
    status,
    created_at: item.created_at ?? item.order_date ?? "",
    payment_method: item.payment_method ?? "",
    receiver_name: item.receiver_name ?? "",
    receiver_address: item.receiver_address ?? "",
    image_url: item.image_url ?? item.product_image_url ?? item.artwork_image_url ?? "",
  };
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso.slice(0, 10); }
}

export default function OrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.orders.getHistory(user.id);
      const arr = Array.isArray(res) ? res
        : Array.isArray(res?.orders) ? res.orders
        : Array.isArray(res?.data) ? res.data
        : [];
      setOrders(arr.map(mapOrder));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color="#1A1A2E" />
        </Pressable>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} tintColor={GOLD} />}
      >
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={52} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>Your order history will appear here</Text>
            <Pressable style={styles.shopBtn} onPress={() => router.push("/(tabs)/shop")}>
              <Text style={styles.shopBtnText}>Browse Shop</Text>
            </Pressable>
          </View>
        ) : (
          orders.map((order) => {
            const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.productName} numberOfLines={2}>{order.product_name}</Text>

                <View style={styles.cardFooter}>
                  <View>
                    {!!order.payment_method && (
                      <Text style={styles.payMethod}>{order.payment_method}</Text>
                    )}
                    {!!order.receiver_name && (
                      <Text style={styles.receiver} numberOfLines={1}>
                        <Feather name="map-pin" size={11} color="#9CA3AF" /> {order.receiver_name}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.total}>
                    {order.total > 0 ? `${order.total.toLocaleString()} ${order.currency}` : "—"}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 19, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },

  content: { paddingHorizontal: 20, paddingTop: 16 },

  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderId: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E" },
  orderDate: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#9CA3AF", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },

  productName: { fontSize: 15, fontFamily: "Poppins_500Medium", color: "#374151", marginBottom: 12 },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  payMethod: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#6B7280" },
  receiver: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#9CA3AF", marginTop: 2 },
  total: { fontSize: 17, fontFamily: "Poppins_700Bold", color: GOLD },

  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 19, fontFamily: "Poppins_600SemiBold", color: "#1A1A2E", marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },
  shopBtn: { marginTop: 16, backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  shopBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
