import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Check,
  CreditCard,
  Smartphone,
  Shield,
  Truck,
  Phone,
  MapPin,
  AlertCircle,
  Copy,
} from "lucide-react-native";
import { Clipboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

type Step = "shipping" | "payment" | "confirm";

const STEPS: Step[] = ["shipping", "payment", "confirm"];

// InputField component defined outside to prevent re-render issues
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "numeric";
  maxLength?: number;
  theme: any;
}

const InputField = React.memo(({ label, value, onChangeText, placeholder, keyboardType, maxLength, theme }: InputFieldProps) => (
  <View style={styles.fieldWrapper}>
    <Text style={[styles.fieldLabel, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text, fontFamily: theme.fonts.regular }]}
      placeholder={placeholder}
      placeholderTextColor={theme.textLight}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCorrect={false}
      spellCheck={false}
    />
  </View>
));

export default function CheckoutScreen() {
  const { items, total, clearCart } = useCart();
  const { theme, isDigital } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shipping fields
  const [name, setName] = useState(user?.fullname || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  // Payment fields
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

  useEffect(() => {
    api.payments.getMethods().then((res) => {
      const arr = Array.isArray(res) ? res
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.payment_methods) ? res.payment_methods
        : Array.isArray(res?.methods) ? res.methods
        : Array.isArray(res?.results) ? res.results
        : typeof res === "object" && res !== null
          ? Object.values(res).find((v) => Array.isArray(v)) ?? []
          : [];
      setPaymentMethods(arr as any[]);
      if ((arr as any[]).length > 0) setSelectedPaymentId(String((arr as any[])[0].id));
    }).catch((err) => {
      console.error("Payment methods fetch error:", err);
    });
  }, []);

  const pickScreenshot = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo access to upload payment screenshot.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  // Clear error when step changes
  useEffect(() => {
    setError(null);
  }, [step]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.3)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const stepIndex = STEPS.indexOf(step);

  const animateStepTransition = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 30, duration: 0, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (step === "shipping") {
      if (!name || !phone || !address) {
        setError("Please fill in all required fields (Name, Phone, Address)");
        return;
      }
      setError(null);
      animateStepTransition();
      setStep("payment");
    } else if (step === "payment") {
      if (!user?.id) {
        Alert.alert("Authentication Required", "Please login to place an order.");
        return;
      }
      setLoading(true);
      try {
        // Use user ID - send as string to prevent integer overflow
        const userId = String(user?.id || user?.phone || "");

        if (!selectedPaymentId) {
          setError("Please select a payment method.");
          setLoading(false);
          return;
        }

        if (items.length === 0) {
          throw new Error("Your cart is empty. Please add items before ordering.");
        }

        // Single call — backend reads cart items from /cart?user_id= server-side
        const res = await api.orders.create(
          {
            user_id: userId,
            payment_method_id: selectedPaymentId,
            receiver_name: name,
            receiver_phone: phone,
            receiver_address: `${address}${city ? ", " + city : ""}`,
            note: note || undefined,
          },
          screenshotUri
        );
        if (res?.id || res?.order_id) {
          setOrderId(String(res.id ?? res.order_id));
        }

        animateStepTransition();
        setStep("confirm");
        setDone(true);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.sequence([
          Animated.parallel([
            Animated.spring(successScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
            Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          ]),
          Animated.timing(checkAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        ]).start();
        clearCart();
      } catch (err: any) {
        console.error("Order creation error:", err);
        const errorMsg = err?.message || "Failed to create order. Please try again.";
        const details = err?.details || err?.errors || "";
        const statusCode = err?.status ? `(${err.status})` : "";
        const fullMessage = details ? `${errorMsg} ${statusCode}\n${JSON.stringify(details, null, 2)}` : `${errorMsg} ${statusCode}`;
        setError(errorMsg);
        Alert.alert("Order Error", fullMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const accent = isDigital ? "#BF00FF" : theme.gold;
  const accentGrad = isDigital
    ? (["#BF00FF", "#7B00CC"] as const)
    : (["#C4952A", "#8B6914"] as const);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={24} color={theme.text} strokeWidth={1.5} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>
          Checkout
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step indicator */}
      <View style={[styles.stepRow, { backgroundColor: theme.bg }]}>
        {STEPS.map((s, idx) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepDot,
                { backgroundColor: idx <= stepIndex ? accent : theme.border },
              ]}>
                {idx < stepIndex ? (
                  <Check size={12} color="#fff" strokeWidth={2} />
                ) : (
                  <Text style={[styles.stepNum, { color: idx <= stepIndex ? "#fff" : theme.textLight, fontFamily: theme.fonts.semiBold }]}>
                    {idx + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: idx <= stepIndex ? accent : theme.textLight, fontFamily: theme.fonts.medium }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </View>
            {idx < STEPS.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: idx < stepIndex ? accent : theme.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Error display */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: `${theme.red}22`, borderColor: theme.red }]}>
          <AlertCircle size={16} color={theme.red} strokeWidth={1.5} />
          <Text style={[styles.errorText, { color: theme.red, fontFamily: theme.fonts.medium }]}>{error}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>

          {/* SHIPPING STEP */}
          {step === "shipping" && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>Shipping Information</Text>
              <InputField label="Full Name" value={name} onChangeText={setName} placeholder="Min Min Htun" theme={theme} />
              <InputField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+95 9 xxxxxxxx" keyboardType="phone-pad" theme={theme} />
              <InputField label="Address" value={address} onChangeText={setAddress} placeholder="No. 123, Street Name" theme={theme} />
              <InputField label="City" value={city} onChangeText={setCity} placeholder="Yangon" theme={theme} />
              <InputField label="Note (Optional)" value={note} onChangeText={setNote} placeholder="Special delivery instructions..." theme={theme} />

              {/* Order summary */}
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24, fontFamily: theme.fonts.semiBold }]}>Order Summary</Text>
              {items.map((item) => (
                <View key={item.artwork.id} style={[styles.orderItem, { borderBottomColor: theme.border }]}>
                  <Image source={item.artwork.image} style={styles.orderThumb} resizeMode="cover" />
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderTitle, { color: theme.text, fontFamily: theme.fonts.medium }]} numberOfLines={1}>{item.artwork.title}</Text>
                    <Text style={[styles.orderArtist, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>{item.artwork.artist}</Text>
                  </View>
                  <Text style={[styles.orderPrice, { color: accent, fontFamily: theme.fonts.semiBold }]}>
                    {item.artwork.price.toLocaleString()} MMK
                  </Text>
                </View>
              ))}
              <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.totalLabel, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>Total</Text>
                <Text style={[styles.totalValue, { color: accent, fontFamily: theme.fonts.semiBold }]}>{total.toLocaleString()} MMK</Text>
              </View>
            </View>
          )}

          {/* PAYMENT STEP */}
          {step === "payment" && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>Payment Method</Text>

              {/* Payment method selector from API */}
              {paymentMethods.length === 0 ? (
                <View style={[styles.pmLoadingBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                  <Text style={[styles.qrSubtext, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Loading payment methods…</Text>
                </View>
              ) : (
                <View style={styles.pmList}>
                  {paymentMethods.map((pm) => {
                    const isSelected = selectedPaymentId === String(pm.id);
                    const serviceName = pm.payment_service_name ?? pm.service ?? pm.name ?? `Method ${pm.id}`;
                    const logoUrl = pm.payment_logo_url ?? pm.logo ?? pm.logo_url ?? null;
                    const qrUrl = pm.qr_image_url ?? pm.qr_code ?? pm.qr ?? null;
                    const receiver = pm.receiver_name ?? pm.receiver ?? null;
                    return (
                      <Pressable
                        key={pm.id}
                        style={[
                          styles.pmCard,
                          {
                            borderColor: isSelected ? accent : theme.border,
                            backgroundColor: isSelected ? `${accent}08` : "#FFFFFF",
                          },
                        ]}
                        onPress={() => setSelectedPaymentId(String(pm.id))}
                      >
                        {/* Top row: logo + name + radio */}
                        <View style={styles.pmTopRow}>
                          {logoUrl ? (
                            <Image source={{ uri: logoUrl }} style={styles.pmLogo} resizeMode="contain" />
                          ) : (
                            <View style={[styles.pmLogoFallback, { backgroundColor: `${accent}20` }]}>
                              <Smartphone size={18} color={accent} strokeWidth={1.5} />
                            </View>
                          )}
                          <View style={styles.pmInfo}>
                            <Text style={[styles.pmServiceName, { color: isSelected ? accent : theme.text, fontFamily: theme.fonts.semiBold }]}>
                              {serviceName}
                            </Text>
                            {receiver && (
                              <Text style={[styles.pmReceiver, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                                {receiver}
                              </Text>
                            )}
                          </View>
                          <View style={[styles.pmRadio, { borderColor: isSelected ? accent : theme.border }]}>
                            {isSelected && <View style={[styles.pmRadioDot, { backgroundColor: accent }]} />}
                          </View>
                        </View>

                        {/* Account number row with copy */}
                        {pm.account_number && (
                          <View style={[styles.pmAccountRow, { backgroundColor: `${accent}0A`, borderColor: `${accent}25` }]}>
                            <Text style={[styles.pmAccount, { color: accent, fontFamily: theme.fonts.semiBold }]}>
                              {pm.account_number}
                            </Text>
                            <Pressable
                              style={styles.pmCopyBtn}
                              onPress={async (e) => {
                                e.stopPropagation();
                                Clipboard.setString(pm.account_number);
                                if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              }}
                              hitSlop={8}
                            >
                              <Copy size={13} color={accent} strokeWidth={2} />
                              <Text style={[styles.pmCopyText, { color: accent, fontFamily: theme.fonts.medium }]}>Copy</Text>
                            </Pressable>
                          </View>
                        )}

                        {/* QR + screenshot upload (only when selected) */}
                        {isSelected && (
                          <View style={styles.pmExpandSection}>
                            {qrUrl && (
                              <View style={styles.pmQrWrap}>
                                <Image source={{ uri: qrUrl }} style={styles.pmQr} resizeMode="contain" />
                                <Text style={[styles.pmQrLabel, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Scan to pay</Text>
                              </View>
                            )}

                            {/* Screenshot upload */}
                            <View style={[styles.pmScreenshotWrap, { borderTopColor: `${accent}20` }]}>
                              <Text style={[styles.pmScreenshotLabel, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>
                                Upload Payment Screenshot
                              </Text>
                              <Pressable
                                style={[styles.screenshotBtn, { borderColor: screenshotUri ? accent : theme.border, backgroundColor: screenshotUri ? `${accent}11` : "#FAFAF8" }]}
                                onPress={pickScreenshot}
                              >
                                {screenshotUri ? (
                                  <Image source={{ uri: screenshotUri }} style={styles.screenshotPreview} resizeMode="cover" />
                                ) : (
                                  <View style={styles.screenshotPlaceholder}>
                                    <Smartphone size={24} color={theme.textLight} strokeWidth={1.5} />
                                    <Text style={[styles.screenshotHint, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>Tap to upload screenshot</Text>
                                  </View>
                                )}
                              </Pressable>
                            </View>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}


              {/* Secure badge */}
              <View style={styles.secureBadge}>
                <Shield size={14} color={accent} strokeWidth={1.5} />
                <Text style={[styles.secureText, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                  Secure & Encrypted Payment
                </Text>
              </View>
            </View>
          )}

          {/* CONFIRMATION STEP */}
          {step === "confirm" && (
            <Animated.View style={[styles.confirmSection, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
              <LinearGradient
                colors={isDigital ? ["rgba(191,0,255,0.15)", "rgba(0,255,204,0.1)"] : ["rgba(196,149,42,0.15)", "rgba(139,105,20,0.1)"]}
                style={[styles.successCard, { borderColor: accent }]}
              >
                <Animated.View
                  style={[
                    styles.checkCircle,
                    { backgroundColor: accent, transform: [{ scale: successScale }] },
                  ]}
                >
                  <Check size={40} color="#fff" strokeWidth={2} />
                </Animated.View>
                <Text style={[styles.successTitle, { color: theme.text, fontFamily: theme.fonts.semiBold }]}>Order Confirmed!</Text>
                <Text style={[styles.successMsg, { color: theme.textLight, fontFamily: theme.fonts.regular }]}>
                  Thank you for your purchase. Our team will contact you within 24 hours to arrange delivery.
                </Text>
                <View style={[styles.orderNumberBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                  <Text style={[styles.orderNumLabel, { color: theme.textLight, fontFamily: theme.fonts.medium }]}>Order Number</Text>
                  <Text style={[styles.orderNumValue, { color: accent, fontFamily: theme.fonts.semiBold }]}>
                    {orderId ? `#${orderId}` : "—"}
                  </Text>
                </View>
                <View style={[styles.deliveryInfo, { borderTopColor: theme.border }]}>
                  <View style={styles.deliveryRow}>
                    <Truck size={16} color={accent} strokeWidth={1.5} />
                    <Text style={[styles.deliveryText, { color: theme.text, fontFamily: theme.fonts.regular }]}>Delivery within 3-5 business days</Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <Phone size={16} color={accent} strokeWidth={1.5} />
                    <Text style={[styles.deliveryText, { color: theme.text, fontFamily: theme.fonts.regular }]}>
                      {name || "Your"} · {phone || "—"}
                    </Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <MapPin size={16} color={accent} strokeWidth={1.5} />
                    <Text style={[styles.deliveryText, { color: theme.text, fontFamily: theme.fonts.regular }]}>
                      {address || "—"}{city ? `, ${city}` : ""}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        {step === "confirm" ? (
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.replace("/")}
          >
            <LinearGradient colors={accentGrad} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={[styles.actionBtnText, { fontFamily: theme.fonts.semiBold }]}>Back to Gallery</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable style={styles.actionBtn} onPress={handleNext} disabled={loading}>
            <LinearGradient colors={accentGrad} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.actionBtnText, { fontFamily: theme.fonts.semiBold }]}>
                  {step === "shipping" ? "Continue to Payment →" : "Confirm Order →"}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 12, fontWeight: "700" },
  stepLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 0.3 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 6, marginBottom: 20 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, flex: 1 },
  content: { padding: 20, gap: 16 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  fieldWrapper: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  orderThumb: { width: 56, height: 56, borderRadius: 8 },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 14, fontWeight: "600" },
  orderArtist: { fontSize: 12, marginTop: 2 },
  orderPrice: { fontSize: 13, fontWeight: "700" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "700" },
  pmLoadingBox: { borderWidth: 1, borderRadius: 12, padding: 20, alignItems: "center" },
  pmList: { gap: 10 },
  pmCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  pmTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pmLogo: { width: 44, height: 44, borderRadius: 10 },
  pmLogoFallback: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pmInfo: { flex: 1, gap: 2 },
  pmServiceName: { fontSize: 14 },
  pmReceiver: { fontSize: 12 },
  pmAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pmAccount: { fontSize: 13 },
  pmCopyBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  pmCopyText: { fontSize: 12 },
  pmExpandSection: { gap: 12, paddingTop: 4 },
  pmQrWrap: { alignItems: "center", gap: 6 },
  pmQr: { width: 140, height: 140, borderRadius: 10 },
  pmQrLabel: { fontSize: 12 },
  pmScreenshotWrap: { gap: 8, borderTopWidth: 1, paddingTop: 12 },
  pmScreenshotLabel: { fontSize: 12 },
  pmRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  pmRadioDot: { width: 10, height: 10, borderRadius: 5 },
  pmCardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  pmCardRight: { alignItems: "center", gap: 8 },
  cardForm: { gap: 12 },
  cardRow: { flexDirection: "row", gap: 12 },
  qrContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  qrText: { fontSize: 16, fontWeight: "700" },
  qrSubtext: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  phoneBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "100%",
  },
  phoneNum: { fontSize: 18, fontWeight: "700" },
  phoneName: { fontSize: 12, marginTop: 2 },
  amountText: { fontSize: 14 },
  secureBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", marginTop: 8 },
  secureText: { fontSize: 12 },
  confirmSection: { alignItems: "center" },
  successCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 14,
    width: "100%",
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 24, fontWeight: "700" },
  successMsg: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  orderNumberBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "100%",
  },
  orderNumLabel: { fontSize: 11, letterSpacing: 1 },
  orderNumValue: { fontSize: 22, fontWeight: "700", marginTop: 2 },
  deliveryInfo: { borderTopWidth: 1, width: "100%", paddingTop: 14, gap: 10 },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  deliveryText: { fontSize: 13, flex: 1 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  actionBtn: { width: "100%", borderRadius: 14, overflow: "hidden" },
  actionGradient: { paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  actionBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  screenshotSection: { marginTop: 16 },
  screenshotBtn: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
  },
  screenshotPreview: { width: "100%", height: "100%" },
  screenshotPlaceholder: { alignItems: "center", gap: 8 },
  screenshotHint: { fontSize: 13 },
});
