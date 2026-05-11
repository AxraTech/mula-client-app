import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

const useAuthStore = create((
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
        setAuth: (user, token) => {
            // If the user object doesn't have an ID, try to get it from the token
            let finalUser = user;
            if (token && (!user || user.id === 'authenticated_user')) {
                try {
                    const decoded = jwtDecode(token);
                    finalUser = { ...user, id: decoded.user_id }; // Map user_id from your specific JWT payload
                } catch (e) {
                    console.error("Token decoding failed", e);
                }
            }
            set({ user: finalUser, token, isAuthenticated: true });
        },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'mula-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
));

export default useAuthStore;