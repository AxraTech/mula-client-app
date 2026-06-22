import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/colors";

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: Colors.gold,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gold,
  },
  chipTextSelected: {
    color: "#fff",
  },
});
