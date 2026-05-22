import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Image, Animated, StyleSheet, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { DataStoreProvider } from "@/context/DataStoreContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="signup" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="artwork/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="artist/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="video/[id]" options={{ headerShown: false, presentation: "fullScreenModal" }} />
    </Stack>
  );
}

const { width: SW } = Dimensions.get("window");

function AppSplash({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(onDone);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[splashStyles.container, { opacity }]}>
      <Image
        source={require("../assets/images/logos.png")}
        style={splashStyles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logo: {
    width: SW * 0.65,
    height: SW * 0.65,
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [splashDone, setSplashDone] = React.useState(false);
  const appReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <DataStoreProvider>
              <QueryClientProvider client={queryClient}>
                <CartProvider>
                  <WishlistProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <KeyboardProvider>
                        {appReady && <RootLayoutNav />}
                        {!splashDone && <AppSplash onDone={() => setSplashDone(true)} />}
                      </KeyboardProvider>
                    </GestureHandlerRootView>
                  </WishlistProvider>
                </CartProvider>
              </QueryClientProvider>
            </DataStoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
