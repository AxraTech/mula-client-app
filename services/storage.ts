import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@mula_token";
const USER_KEY = "@mula_user";
const WELCOME_SEEN_KEY = "@mula_welcome_seen";

export const storage = {
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  removeToken: () => AsyncStorage.removeItem(TOKEN_KEY),

  getUser: async <T = unknown>(): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: unknown) =>
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => AsyncStorage.removeItem(USER_KEY),

  getWelcomeSeen: async () => {
    const value = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
    return value === "true";
  },
  setWelcomeSeen: () => AsyncStorage.setItem(WELCOME_SEEN_KEY, "true"),
  removeWelcomeSeen: () => AsyncStorage.removeItem(WELCOME_SEEN_KEY),

  clear: () => AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]),
};
