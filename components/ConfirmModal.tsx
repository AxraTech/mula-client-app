import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type ConfirmVariant = "danger" | "warning" | "gold";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG = {
  danger: {
    iconBg: "#FEE2E2",
    iconColor: "#EF4444",
    gradColors: ["#EF4444", "#DC2626"] as const,
    borderColor: "#FCA5A5",
  },
  warning: {
    iconBg: "#FEF3C7",
    iconColor: "#F59E0B",
    gradColors: ["#F59E0B", "#D97706"] as const,
    borderColor: "#FCD34D",
  },
  gold: {
    iconBg: "#F5ECC8",
    iconColor: "#8B6914",
    gradColors: ["#C4952A", "#8B6914"] as const,
    borderColor: "#D4AF37",
  },
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onCancel} />

        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: config.iconBg, borderColor: config.borderColor }]}>
            <Feather
              name={(icon ?? (variant === "danger" ? "trash-2" : variant === "warning" ? "alert-triangle" : "star")) as any}
              size={28}
              color={config.iconColor}
            />
          </View>

          {/* Text */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.confirmBtnWrap, pressed && { opacity: 0.85 }]}
              onPress={onConfirm}
            >
              <LinearGradient
                colors={config.gradColors}
                style={styles.confirmBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10,8,5,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 8,
  },

  message: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 20,
  },

  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#6B7280",
  },

  confirmBtnWrap: { flex: 1, borderRadius: 14, overflow: "hidden" },
  confirmBtn: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
  },
});
