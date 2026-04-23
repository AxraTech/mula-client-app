import { create } from "zustand";

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

//---------------------------------------------successfully log in----------------------------------------------
    setAuth: (userData, userToken) => set({
            user: userData,
            token: userToken,
            isAuthenticated: true,
        }),

//---------------------------------------------log out----------------------------------------------
    logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
    }),
}));

export default useAuthStore;