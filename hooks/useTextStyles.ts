import { useTheme } from "@/context/ThemeContext";

export function useTextStyles() {
  const { theme } = useTheme();
  const { fonts } = theme;

  return {
    // Font families
    regular: { fontFamily: fonts.regular },
    medium: { fontFamily: fonts.medium },
    semiBold: { fontFamily: fonts.semiBold },
    bold: { fontFamily: fonts.bold },

    // Common text styles with fonts
    body: {
      fontFamily: fonts.regular,
      fontSize: 14,
      lineHeight: 20,
    },
    bodyMedium: {
      fontFamily: fonts.medium,
      fontSize: 14,
      lineHeight: 20,
    },
    title: {
      fontFamily: fonts.semiBold,
      fontSize: 18,
      lineHeight: 26,
    },
    subtitle: {
      fontFamily: fonts.medium,
      fontSize: 16,
      lineHeight: 22,
    },
    caption: {
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 16,
    },
    button: {
      fontFamily: fonts.medium,
      fontSize: 14,
      lineHeight: 20,
    },
    price: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      lineHeight: 18,
    },
  };
}
