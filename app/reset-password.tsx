import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/services/api";

const GOLD = "#D4AF37";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ phone: string; otp_id: string; otp: string }>();
  const insets = useSafeAreaInsets();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      shake();
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      shake();
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.auth.resetPassword(
        params.phone,
        parseInt(params.otp, 10),
        params.otp_id,
        newPassword
      );
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to reset password");
      shake();
    } finally {
      setLoading(false);
    }
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
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="chevron-left" size={22} color="#1A1A2E" />
            </Pressable>
          </View>

          <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
            {/* Logo */}
            <View style={styles.header}>
              <View style={styles.logoRing}>
                <Image source={require("../assets/images/logos.png")} style={styles.logoImage} resizeMode="contain" />
              </View>

              {done ? (
                <>
                  <View >
                    {/* <Feather name="check-circle" size={40} color={GOLD} /> */}
                  </View>
                  <Text style={styles.title}>Password Updated!</Text>
                  <Text style={styles.subtitle}>Your password has been reset{"\n"}successfully.</Text>
                </>
              ) : (
                <>
                  <View >
                    {/* <Feather name="lock" size={28} color={GOLD} /> */}
                  </View>
                  <Text style={styles.title}>New Password</Text>
                  <Text style={styles.subtitle}>Create a strong password{"\n"}for your account</Text>
                </>
              )}
            </View>

            {done ? (
              <Pressable style={styles.primaryBtn} onPress={() => router.replace("/login")}>
                <LinearGradient
                  colors={["#B8940D", GOLD]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradient}
                >
                  <Text style={styles.primaryBtnText}>Sign In Now</Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <>
                {/* New password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={17} color={GOLD} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#C0C0C0"
                      secureTextEntry={!showPw}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                      <Feather name={showPw ? "eye-off" : "eye"} size={17} color="#BDBDBD" />
                    </Pressable>
                  </View>
                </View>

                {/* Confirm password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={17} color={GOLD} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#C0C0C0"
                      secureTextEntry={!showConfirm}
                      value={confirm}
                      onChangeText={setConfirm}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                      <Feather name={showConfirm ? "eye-off" : "eye"} size={17} color="#BDBDBD" />
                    </Pressable>
                  </View>
                </View>

                {error !== "" && <Text style={styles.errorText}>{error}</Text>}

                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, { opacity: loading ? 0.7 : pressed ? 0.9 : 1 }]}
                  onPress={handleReset}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#B8940D", GOLD]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.primaryBtnText}>Resetting...</Text>
                      </View>
                    ) : (
                      <Text style={styles.primaryBtnText}>Reset Password</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            )}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  inner: {
    paddingHorizontal: 26,
    paddingTop: 8,
    gap: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
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
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  logoImage: { width: 60, height: 60 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D4AF3740",
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#D4AF3750",
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 25,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 21,
    marginTop: -4,
  },
  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#374151",
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
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  primaryGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
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
});
