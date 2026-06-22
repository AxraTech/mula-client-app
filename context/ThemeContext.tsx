import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

export type ArtMode = "manual" | "digital";

interface ThemeContextType {
  mode: ArtMode;
  setMode: (mode: ArtMode) => void;
  isDigital: boolean;
  theme: typeof manualTheme;
}

export const fonts = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export const manualTheme = {
  bg: "#F5F0E8",
  bgDark: "#EDE8DC",
  bgCard: "#FFFDF7",
  text: "#3D2E10",
  textLight: "#7A6540",
  textInverted: "#fff",
  gold: "#8B6914",
  goldLight: "#C4952A",
  border: "#E0D8C8",
  shadow: "rgba(139, 105, 20, 0.15)",
  accent: "#8B6914",
  accentGlow: "rgba(139, 105, 20, 0.4)",
  tabBar: "#F5F0E8",
  tabBarBorder: "#E0D8C8",
  headerBg: "#F5F0E8",
  red: "#C0392B",
  inputBg: "#FFFDF7",
  dark: "#1A1209",
  fonts,
};

export const digitalTheme = {
  bg: "#0A0A14",
  bgDark: "#070710",
  bgCard: "#12121E",
  text: "#E8E0FF",
  textLight: "#8880AA",
  textInverted: "#0A0A14",
  gold: "#BF00FF",
  goldLight: "#E040FF",
  border: "#2A2040",
  shadow: "rgba(191, 0, 255, 0.25)",
  accent: "#00FFCC",
  accentGlow: "rgba(0, 255, 204, 0.4)",
  tabBar: "#0D0D1A",
  tabBarBorder: "#2A2040",
  headerBg: "#0A0A14",
  red: "#FF3366",
  inputBg: "#12121E",
  dark: "#E8E0FF",
  fonts,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ArtMode>("manual");

  const setMode = useCallback((m: ArtMode) => setModeState(m), []);
  const isDigital = mode === "digital";
  const theme = isDigital ? digitalTheme : manualTheme;

  const value = useMemo<ThemeContextType>(
    () => ({ mode, setMode, isDigital, theme }),
    [mode, setMode, isDigital, theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
