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
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { DatePickerModal } from "@/components/DatePickerModal";

export default function SignupScreen() {
  const { requestOtp } = useAuth();
  const insets = useSafeAreaInsets();

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [showPw, setShowPw] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleRequestOtp = async () => {
    setError("");
    if (!fullname.trim()) { setError("Please enter your full name"); shake(); return; }
    if (!phone.trim()) { setError("Please enter your phone number"); shake(); return; }
    if (!password) { setError("Please enter a password"); shake(); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); shake(); return; }
    if (password !== confirm) { setError("Passwords do not match"); shake(); return; }
    if (!dob.trim()) { setError("Please enter your date of birth (DD-MM-YYYY)"); shake(); return; }
    if (!gender) { setError("Please select your gender"); shake(); return; }

    setLoading(true);
    const result = await requestOtp(phone.trim());
    setLoading(false);

    if (result.success) {
      router.push({
        pathname: "/otp",
        params: {
          phone: phone.trim(),
          otp_id: result.otp_id ?? "",
          mode: "signup",
          fullname: fullname.trim(),
          password,
          dob: dob.trim(),
          gender,
        },
      });
    } else {
      setError(result.error ?? "Could not send OTP. Please try again.");
      shake();
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

          <Animated.View
            style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoRing}>
                <Image source={require("../assets/images/logos.png")} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the Mula Art Gallery</Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={17} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#C0C0C0"
                  value={fullname}
                  onChangeText={setFullname}
                  autoCapitalize="words"
                />
              </View>
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
                  placeholder="Min 6 characters"
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

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={17} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#C0C0C0"
                  secureTextEntry={!showPw}
                  value={confirm}
                  onChangeText={setConfirm}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* DOB + Gender side by side */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1.3, marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <Pressable style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                  <Feather name="calendar" size={17} color="#D4AF37" style={styles.inputIcon} />
                  <Text style={[styles.input, { color: dob ? "#1A1A2E" : "#C0C0C0", paddingVertical: 14 }]}>
                    {dob || "DD-MM-YYYY"}
                  </Text>
                </Pressable>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {(["male", "female"] as const).map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    >
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                        {g === "male" ? "M" : "F"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {error !== "" && <Text style={styles.errorText}>{error}</Text>}

            <DatePickerModal
              visible={showDatePicker}
              value={dob}
              onConfirm={(d) => { setDob(d); setShowDatePicker(false); }}
              onClose={() => setShowDatePicker(false)}
            />

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [styles.submitBtn, { opacity: loading ? 0.7 : pressed ? 0.9 : 1 }]}
              onPress={handleRequestOtp}
              disabled={loading}
            >
              <LinearGradient
                colors={["#B8940D", "#D4AF37"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.submitBtnText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitBtnText}>Send OTP & Continue</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.replace("/login")}>
                <Text style={styles.footerLink}>Sign In</Text>
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
    marginBottom: 24,
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
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
  },

  // Inputs
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
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
    height: 50,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#1A1A2E",
  },
  eyeBtn: { padding: 4 },

  // DOB + Gender
  rowGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    alignItems: "flex-end",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
    height: 50,
  },
  genderBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
    backgroundColor: "#FAFAFA",
  },
  genderBtnActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  genderText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#D4AF37",
  },
  genderTextActive: {
    color: "#FFFFFF",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
    marginBottom: 8,
  },

  // Button
  submitBtn: {
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  submitGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
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

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
  },
  footerLink: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: "#D4AF37",
  },
});
