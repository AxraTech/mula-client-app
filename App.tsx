import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BottomTabNavigation from "./src/navigation/BottomTabNavigator";
import AuthStackNavigation from "./src/navigation/Stack/AuthStackNavigation";
import useAuthStore from "./src/store/useAuthStore";

const App = () => {
   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <BottomTabNavigation /> : <AuthStackNavigation />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;