import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const GOLD = "#D4AF37";

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.inner}>
          <View style={styles.lockRing}>
            <Feather name="lock" size={24} color={GOLD} />
          </View>

          <Text style={styles.title}>Members Only</Text>
          <Text style={styles.subtitle}>
            Sign in to explore artworks, events, and the full MULA experience.
          </Text>

          {/* Sign In button */}
          <Pressable
            style={({ pressed }) => [styles.signInBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push("/login")}
          >
            <LinearGradient
              colors={["#B8940D", "#D4AF37"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInGrad}
            >
              <Text style={styles.signInText}>Sign In</Text>
              <Feather name="arrow-right" size={17} color="#fff" />
            </LinearGradient>
          </Pressable>

          {/* Sign Up link */}
          <Pressable style={styles.signUpLink} onPress={() => router.push("/signup")}>
            <Text style={styles.signUpText}>
              New to MULA?{"  "}
              <Text style={styles.signUpAccent}>Create an account</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },

  lockRing: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D4AF3740",
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
    letterSpacing: -0.3,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
    marginTop: -4,
  },

  // Button
  signInBtn: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  signInGrad: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signInText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // Footer link
  signUpLink: { paddingVertical: 8 },
  signUpText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
  },
  signUpAccent: {
    fontFamily: "Poppins_700Bold",
    color: GOLD,
  },
});
