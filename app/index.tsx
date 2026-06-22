import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { storage } from "@/services/storage";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    storage.getWelcomeSeen().then(setHasSeenWelcome).catch(() => setHasSeenWelcome(false));
  }, []);

  useEffect(() => {
    if (isLoading || hasSeenWelcome === null) return;

    if (isAuthenticated) {
      router.replace("/(tabs)");
      return;
    }

    router.replace(hasSeenWelcome ? "/login?direct=1" : "/welcome");
  }, [hasSeenWelcome, isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#A5650E" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F1EA",
  },
});
