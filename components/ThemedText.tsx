import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type TextVariant = "body" | "title" | "subtitle" | "caption" | "button" | "price";

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  bold?: boolean;
  semiBold?: boolean;
  medium?: boolean;
}

export function ThemedText({
  style,
  variant = "body",
  bold,
  semiBold,
  medium,
  children,
  ...props
}: ThemedTextProps) {
  const { theme } = useTheme();
  const { fonts } = theme;

  // Determine font family based on weight props
  let fontFamily = fonts.regular;
  if (bold) fontFamily = fonts.bold;
  else if (semiBold) fontFamily = fonts.semiBold;
  else if (medium) fontFamily = fonts.medium;

  // Variant-specific styles
  const variantStyles = StyleSheet.create({
    body: {
      fontSize: 15,
      lineHeight: 21,
    },
    title: {
      fontSize: 19,
      lineHeight: 27,
      fontFamily: fonts.semiBold,
    },
    subtitle: {
      fontSize: 17,
      lineHeight: 23,
      fontFamily: fonts.medium,
    },
    caption: {
      fontSize: 13,
      lineHeight: 17,
    },
    button: {
      fontSize: 15,
      lineHeight: 21,
      fontFamily: fonts.medium,
    },
    price: {
      fontSize: 14,
      lineHeight: 19,
      fontFamily: fonts.semiBold,
    },
  });

  const variantStyle = variantStyles[variant];
  const variantFontFamily = variant === "title" || variant === "subtitle" || variant === "button" || variant === "price"
    ? undefined
    : fontFamily;

  return (
    <Text
      style={[
        { fontFamily: variantFontFamily || fontFamily, color: theme.text },
        variantStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
