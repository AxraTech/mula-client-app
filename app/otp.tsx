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
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

type Mode = "signup" | "forgot";

export default function OtpScreen() {
  const params = useLocalSearchParams<{
    phone: string;
    otp_id: string;
    mode: Mode;
    fullname?: string;
    password?: string;
    dob?: string;
    gender?: string;
  }>();

  const { signup } = useAuth();
  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [otpId, setOtpId] = useState(params.otp_id ?? "");

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isForgot = params.mode === "forgot";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
    const timer = setInterval(() => {
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (!digit && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const getOtpCode = () => parseInt(otp.join(""), 10);

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the 6-digit OTP"); shake(); return; }
    setError("");
    setLoading(true);

    if (params.mode === "signup") {
      const result = await signup({
        phone: params.phone,
        password: params.password ?? "",
        fullname: params.fullname ?? "",
        otp: getOtpCode(),
        otp_id: otpId,
        dob: params.dob ?? "",
        gender: params.gender ?? "male",
      });
      setLoading(false);
      if (result.success) {
        router.replace("/");
      } else {
        setError(result.error ?? "Invalid OTP. Please try again.");
        shake();
      }
    } else if (params.mode === "forgot") {
      setLoading(false);
      router.push({
        pathname: "/reset-password",
        params: { phone: params.phone, otp_id: otpId, otp: String(getOtpCode()) },
      });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await api.auth.requestOtp(params.phone);
      const newOtpId = res?.otp_id ?? res?.data?.otp_id;
      if (newOtpId) setOtpId(newOtpId);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (e: any) {
      setError(e?.message ?? "Failed to resend OTP");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color="#1A1A2E" />
        </Pressable>
      </View>

      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Logo */}
        <View style={styles.logoRing}>
          <Image
            source={require("../assets/images/logos.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Icon badge */}
        <View style={styles.iconBadge}>
          <Feather name="message-square" size={28} color="#D4AF37" />
        </View>

        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{"\n"}
          <Text style={styles.phoneHighlight}>{params.phone}</Text>
        </Text>

        {/* OTP inputs */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
              ]}
              value={digit}
              onChangeText={(v) => handleOtpChange(v, i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {error !== "" && <Text style={styles.errorText}>{error}</Text>}

        {/* Verify button */}
        <Pressable
          style={({ pressed }) => [styles.verifyBtn, { opacity: loading ? 0.7 : pressed ? 0.9 : 1 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          <LinearGradient
            colors={["#B8940D", "#D4AF37"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifyGradient}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.verifyBtnText}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.verifyBtnText}>
                {isForgot ? "Verify & Reset Password" : "Verify & Create Account"}
              </Text>
            )}
          </LinearGradient>
        </Pressable>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Pressable onPress={handleResend} disabled={resendCooldown > 0}>
            <Text style={[styles.resendLink, resendCooldown > 0 && styles.resendDisabled]}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    paddingTop: 32,
    gap: 20,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#D4AF3740",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF7",
    ...Platform.select({
      ios: { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  logoImage: { width: 56, height: 56 },
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
  title: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    marginTop: -8,
  },
  phoneHighlight: {
    fontFamily: "Poppins_700Bold",
    color: "#D4AF37",
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  otpInput: {
    width: 48,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
    backgroundColor: "#FAFAFA",
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
  },
  otpInputFilled: {
    borderColor: "#D4AF37",
    backgroundColor: "#FFF8E7",
    color: "#1A1A2E",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },
  verifyBtn: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  verifyGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
  },
  resendLink: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: "#D4AF37",
  },
  resendDisabled: {
    color: "#C0C0C0",
  },
});
