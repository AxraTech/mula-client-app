import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const GOLD = "#D4AF37";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 15 - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface Props {
  visible: boolean;
  value: string; // DD-MM-YYYY
  onConfirm: (date: string) => void;
  onClose: () => void;
}

export function DatePickerModal({ visible, value, onConfirm, onClose }: Props) {
  const parsed = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  const initDay = parsed ? parseInt(parsed[1]) : 1;
  const initMonth = parsed ? parseInt(parsed[2]) : 1;
  const initYear = parsed ? parseInt(parsed[3]) : currentYear - 20;

  const [day, setDay] = useState(initDay);
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);

  const maxDay = daysInMonth(month, year);
  const safeDay = Math.min(day, maxDay);

  const handleConfirm = () => {
    const d = String(safeDay).padStart(2, "0");
    const m = String(month).padStart(2, "0");
    onConfirm(`${d}-${m}-${year}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Date of Birth</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Columns */}
          <View style={styles.columnsRow}>
            {/* Day */}
            <View style={styles.col}>
              <Text style={styles.colLabel}>Day</Text>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                  <Pressable
                    key={d}
                    style={[styles.item, safeDay === d && styles.itemActive]}
                    onPress={() => setDay(d)}
                  >
                    <Text style={[styles.itemText, safeDay === d && styles.itemTextActive]}>
                      {String(d).padStart(2, "0")}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Month */}
            <View style={[styles.col, { flex: 2 }]}>
              <Text style={styles.colLabel}>Month</Text>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {MONTHS.map((m, i) => (
                  <Pressable
                    key={m}
                    style={[styles.item, month === i + 1 && styles.itemActive]}
                    onPress={() => setMonth(i + 1)}
                  >
                    <Text style={[styles.itemText, month === i + 1 && styles.itemTextActive]}>
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Year */}
            <View style={styles.col}>
              <Text style={styles.colLabel}>Year</Text>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {YEARS.map((y) => (
                  <Pressable
                    key={y}
                    style={[styles.item, year === y && styles.itemActive]}
                    onPress={() => setYear(y)}
                  >
                    <Text style={[styles.itemText, year === y && styles.itemTextActive]}>
                      {y}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Preview */}
          <Text style={styles.preview}>
            {String(safeDay).padStart(2, "0")} {MONTHS[month - 1]} {year}
          </Text>

          {/* Confirm */}
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <LinearGradient
              colors={["#B8940D", "#D4AF37"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGrad}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2E",
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  columnsRow: {
    flexDirection: "row",
    gap: 8,
    height: 200,
  },
  col: {
    flex: 1,
  },
  colLabel: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: "#9CA3AF",
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  scroll: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
  },
  item: {
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  itemActive: {
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#D4AF3760",
  },
  itemText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
  },
  itemTextActive: {
    fontFamily: "Poppins_700Bold",
    color: GOLD,
  },
  preview: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#1A1A2E",
    marginVertical: 14,
  },
  confirmBtn: {
    height: 50,
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#C9A227", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  confirmGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.3,
  },
});
