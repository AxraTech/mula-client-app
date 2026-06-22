import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";


export default function LoginScreen() {
  const { direct } = useLocalSearchParams<{ direct?: string }>();
  const { signin, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError("");
    if (!phone.trim()) { setError("Please enter your phone number"); shake(); return; }
    if (!password) { setError("Please enter your password"); shake(); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); shake(); return; }

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, "");
    const result = await signin(cleanPhone, password);
    setLoading(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "Invalid phone or password");
      shake();
    }
  };

  const handleForgotPassword = async () => {
    if (!phone.trim()) { setError("Enter your phone number first"); shake(); return; }
    const cleanPhone = phone.replace(/\D/g, "");
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.forgetPassword(cleanPhone);
      const otp_id = res?.otp_id ?? res?.data?.otp_id ?? "";
      router.push({ pathname: "/otp", params: { phone: cleanPhone, otp_id, mode: "forgot" } });
    } catch (e: any) {
      setError(e?.message ?? "Failed to send OTP");
      shake();
    } finally {
      setLoading(false);
    }
  };

  const showBack = direct !== "1" && router.canGoBack();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.headerBar, { paddingTop: 8 }]}>
            {showBack ? (
              <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={8}>
                <Feather name="arrow-left" size={22} color="#1A1A2E" />
              </Pressable>
            ) : (
              <View style={styles.headerSpacer} />
            )}
            <Text style={styles.headerTitle}>Sign In</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Animated.View
            style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }]}
          >
            {/* Brand */}
            <View style={styles.header}>
              <View style={styles.logoRing}>
                <Image source={require("../assets/images/logos.png")} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Feather name="smartphone" size={17} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="09-XXX-XXX-XXX"
                  placeholderTextColor="#C0C0C0"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={17} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#C0C0C0"
                  secureTextEntry={!showPw}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={17} color="#BDBDBD" />
                </Pressable>
              </View>
            </View>

            {/* Forgot */}
            <Pressable onPress={handleForgotPassword} style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            {error !== "" && <Text style={styles.errorText}>{error}</Text>}

            {/* Sign In Button */}
            <Pressable
              style={({ pressed }) => [styles.loginBtn, { opacity: loading ? 0.7 : pressed ? 0.9 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#B8940D", "#D4AF37"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtnGradient}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.loginBtnText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginBtnText}>Sign In</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Pressable onPress={() => router.replace("/signup")}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: "Poppins_600SemiBold",
    color: "#1A1A2E",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  inner: {
    paddingHorizontal: 26,
    paddingTop: 8,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "#D4AF3740",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF7",
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  logoImage: { width: 60, height: 60 },
  title: {
    fontSize: 27,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
  },

  // Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#374151",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#1A1A2E",
  },
  eyeBtn: { padding: 4 },

  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 8,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#D4AF37",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
    marginBottom: 8,
  },

  // Button
  loginBtn: {
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  loginBtnGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#D4AF37",
  },
});
