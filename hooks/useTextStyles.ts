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
      fontSize: 15,
      lineHeight: 21,
    },
    bodyMedium: {
      fontFamily: fonts.medium,
      fontSize: 15,
      lineHeight: 21,
    },
    title: {
      fontFamily: fonts.semiBold,
      fontSize: 19,
      lineHeight: 27,
    },
    subtitle: {
      fontFamily: fonts.medium,
      fontSize: 17,
      lineHeight: 23,
    },
    caption: {
      fontFamily: fonts.regular,
      fontSize: 13,
      lineHeight: 17,
    },
    button: {
      fontFamily: fonts.medium,
      fontSize: 15,
      lineHeight: 21,
    },
    price: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      lineHeight: 19,
    },
  };
}
