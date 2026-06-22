import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { storage } from "@/services/storage";

const GOLD = "#D4AF37";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [editing, setEditing] = useState(false);
  const [fullname, setFullname] = useState(user?.fullname ?? user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setProfileLoading(true);
    api.user.getProfile()
      .then((res: any) => {
        const data = res?.data ?? res?.user ?? res?.profile ?? res;
        if (data && typeof data === "object") {
          const fresh = {
            fullname: data.fullname ?? data.full_name ?? data.name ?? "",
            email: data.email ?? "",
            address: data.address ?? "",
            phone: data.phone ?? user?.phone ?? "",
            gender: data.gender ?? user?.gender ?? "",
            dob: data.dob ?? data.date_of_birth ?? user?.dob ?? "",
            profile_image_url: data.profile_image_url ?? data.avatar ?? user?.profile_image_url ?? "",
          };
          updateUser(fresh);
          setFullname(fresh.fullname);
          setEmail(fresh.email);
          setAddress(fresh.address);
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [isAuthenticated]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const displayName = user?.fullname ?? user?.name ?? "Guest";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.user.updateProfile({ fullname, email, address });
      updateUser({ fullname, email, address });
      await storage.setUser({ ...user, fullname, email, address });
      setEditing(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Feather name="chevron-left" size={22} color="#1A1A2E" />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.guestState}>
          <View style={styles.avatarRing}>
            <Feather name="user" size={40} color={GOLD} />
          </View>
          <Text style={styles.guestTitle}>Not Signed In</Text>
          <Text style={styles.guestSubtitle}>Sign in to manage your profile and orders</Text>
          <Pressable style={styles.signInBtn} onPress={() => router.push("/login")}>
            <LinearGradient colors={["#B8940D", "#D4AF37"]} style={styles.signInGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.signInText}>Sign In</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color="#1A1A2E" />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Pressable
          style={styles.iconBtn}
          onPress={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={GOLD} />
          ) : (
            <Text style={styles.editBtnText}>{editing ? "Save" : "Edit"}</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 60 : insets.bottom + 60 }]}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarRingLarge}>
            {user?.profile_image_url ? (
              <Image source={{ uri: user.profile_image_url }} style={styles.avatarImg} />
            ) : (
              <LinearGradient colors={["#B8940D", "#D4AF37"]} style={styles.avatarGrad}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {user?.phone && <Text style={styles.phoneText}>{user.phone}</Text>}
          {profileLoading && <ActivityIndicator size="small" color={GOLD} style={{ marginTop: 6 }} />}
        </View>

        {/* Gold divider */}
        <View style={styles.goldDivider} />

        {/* Editable fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          {[
            { label: "Full Name", value: fullname, setter: setFullname, icon: "user" },
            { label: "Email", value: email, setter: setEmail, icon: "mail" },
            { label: "Address", value: address, setter: setAddress, icon: "map-pin" },
          ].map(({ label, value, setter, icon }, idx, arr) => (
            <View key={label} style={[styles.field, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.fieldLabelRow}>
                <Feather name={icon as any} size={14} color={GOLD} />
                <Text style={styles.fieldLabel}>{label}</Text>
              </View>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={value}
                  onChangeText={setter}
                  placeholderTextColor="#C0C0C0"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              ) : (
                <Text style={styles.fieldValue}>{value || "—"}</Text>
              )}
            </View>
          ))}

          {/* Read-only */}
          {user?.phone && (
            <View style={styles.field}>
              <View style={styles.fieldLabelRow}>
                <Feather name="phone" size={14} color={GOLD} />
                <Text style={styles.fieldLabel}>Phone</Text>
              </View>
              <Text style={styles.fieldValue}>{user.phone}</Text>
            </View>
          )}
          {user?.gender && (
            <View style={styles.field}>
              <View style={styles.fieldLabelRow}>
                <Feather name="users" size={14} color={GOLD} />
                <Text style={styles.fieldLabel}>Gender</Text>
              </View>
              <Text style={styles.fieldValue}>{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</Text>
            </View>
          )}
          {user?.dob && (
            <View style={[styles.field, { borderBottomWidth: 0 }]}>
              <View style={styles.fieldLabelRow}>
                <Feather name="calendar" size={14} color={GOLD} />
                <Text style={styles.fieldLabel}>Date of Birth</Text>
              </View>
              <Text style={styles.fieldValue}>{user.dob}</Text>
            </View>
          )}
        </View>

        {error !== "" && <Text style={styles.errorText}>{error}</Text>}
        {editing && (
          <Pressable style={styles.cancelBtn} onPress={() => setEditing(false)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {[
            { icon: "shopping-bag", label: "Order History", onPress: () => router.push("/order-history") },
            { icon: "heart", label: "Favourites", onPress: () => router.push("/favourites") },
            { icon: "bell", label: "Notifications", onPress: () => {} },
            { icon: "lock", label: "Change Password", onPress: () => router.push({ pathname: "/otp", params: { phone: user?.phone ?? "", mode: "forgot" } }) },
          ].map(({ icon, label, onPress }, idx, arr) => (
            <Pressable
              key={label}
              style={[styles.menuItem, idx === arr.length - 1 && { borderBottomWidth: 0 }]}
              onPress={onPress}
            >
              <View style={styles.menuIcon}>
                <Feather name={icon as any} size={16} color={GOLD} />
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              <Feather name="chevron-right" size={16} color="#C0C0C0" />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={17} color="#FF3366" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  iconBtn: { width: 44, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    letterSpacing: 0.3,
  },
  editBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: GOLD,
  },

  content: { gap: 16, paddingHorizontal: 16, paddingTop: 0 },

  // Hero
  heroSection: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 6,
    backgroundColor: "#FFFDF7",
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  avatarRingLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#D4AF3760",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarGrad: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontSize: 35, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  displayName: { fontSize: 21, fontFamily: "Poppins_700Bold", color: "#1A1A2E", marginTop: 4 },
  phoneText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },

  goldDivider: { height: 2, backgroundColor: "#D4AF3725", borderRadius: 1 },

  // Section card
  section: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#9CA3AF",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Fields
  field: {
    paddingBottom: 14,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
    gap: 4,
  },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  fieldLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#9CA3AF" },
  fieldValue: { fontSize: 16, fontFamily: "Poppins_500Medium", color: "#1A1A2E", paddingLeft: 21 },
  fieldInput: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#1A1A2E",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D4AF3740",
    backgroundColor: "#FFF8E7",
    marginTop: 4,
  },

  errorText: { color: "#FF3366", fontSize: 14, fontFamily: "Poppins_400Regular", textAlign: "center" },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { fontSize: 15, fontFamily: "Poppins_400Regular", color: "#9CA3AF" },

  // Menu
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#D4AF3730",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: "Poppins_400Regular", color: "#1A1A2E" },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FF336640",
    paddingVertical: 14,
    marginBottom: 8,
  },
  logoutText: { color: "#FF3366", fontSize: 16, fontFamily: "Poppins_700Bold" },

  // Guest
  guestState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "#D4AF3740",
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  guestTitle: { fontSize: 21, fontFamily: "Poppins_700Bold", color: "#1A1A2E" },
  guestSubtitle: { fontSize: 15, fontFamily: "Poppins_400Regular", color: "#9CA3AF", textAlign: "center", lineHeight: 23 },
  signInBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginTop: 8 },
  signInGradient: { paddingVertical: 16, alignItems: "center" },
  signInText: { fontSize: 17, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
});
