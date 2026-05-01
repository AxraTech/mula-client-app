import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (userData, userToken) => {
                try {
                    const decoded = jwtDecode(userToken);
                    
                    const actualUser = {
                        ...userData,
                        id: decoded.user_id || decoded.id
                    };

                    set({
                        user: actualUser,
                        token: userToken,
                        isAuthenticated: true,
                    });
                } catch (e) {
                    console.error("Token decoding failed", e);
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: "mula-auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useAuthStore;