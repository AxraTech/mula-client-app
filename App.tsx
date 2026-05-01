import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthStackNavigation from "./src/navigation/Stack/AuthStackNavigation";
import useAuthStore from "./src/store/useAuthStore";
import MainNavigator from "./src/navigation/MainNavigator";

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout(); 
  }, []);
    
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainNavigator /> : <AuthStackNavigation />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;