import React from "react";
import { Pressable, StyleProp, Text, TextStyle } from "react-native";
import { router } from "expo-router";

interface ArtistNameLinkProps {
  name: string;
  artistId?: string | null;
  prefix?: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function ArtistNameLink({
  name,
  artistId,
  prefix = "",
  style,
  linkStyle,
  numberOfLines,
}: ArtistNameLinkProps) {
  const label = `${prefix}${name}`.trim();

  if (!name || !artistId) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {label || name}
      </Text>
    );
  }

  return (
    <Pressable
      onPress={() => router.push(`/artist/${artistId}`)}
      hitSlop={6}
      accessibilityRole="link"
      accessibilityLabel={`View ${name} profile`}
    >
      <Text style={[style, linkStyle]} numberOfLines={numberOfLines}>
        {label}
      </Text>
    </Pressable>
  );
}
