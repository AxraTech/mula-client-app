import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@mula_token";
const USER_KEY = "@mula_user";

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

  clear: () => AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]),
};
