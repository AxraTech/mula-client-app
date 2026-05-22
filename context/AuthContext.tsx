import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/services/api";
import { storage } from "@/services/storage";

// Decode JWT token to get payload (without verification)
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64Url decode using atob (works in React Native)
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padLength = 4 - (base64.length % 4);
    const padded = padLength !== 4 ? base64 + "=".repeat(padLength) : base64;
    const json = atob(padded);
    return JSON.parse(json);
  } catch (e) {
    console.error("JWT decode error:", e);
    return null;
  }
}

export interface MulaUser {
  id: string | number;
  fullname?: string;
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  profile_image_url?: string;
  gender?: string;
  dob?: string;
  address?: string;
}

interface AuthContextType {
  user: MulaUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (
    phone: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (input: {
    phone: string;
    password: string;
    fullname: string;
    otp: number;
    otp_id: string;
    dob: string;
    gender: string;
  }) => Promise<{ success: boolean; error?: string }>;
  requestOtp: (
    phone: string
  ) => Promise<{ success: boolean; otp_id?: string; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<MulaUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Well-known token field names (ordered by likelihood)
const TOKEN_KEYS = [
  "access_token",
  "accessToken",
  "token",
  "auth_token",
  "authToken",
  "jwt",
  "jwt_token",
  "jwtToken",
  "bearer",
  "id_token",
  "session_token",
  "sessionToken",
  "api_token",
  "apiToken",
  "Authorization",
  "authorization",
];

const USER_KEYS = [
  "user",
  "account",
  "profile",
  "member",
  "customer",
  "data",
  "userInfo",
  "user_info",
];

// Detect if a string looks like a real JWT (3 base64url segments separated by dots)
function isJWT(s: string): boolean {
  if (typeof s !== "string") return false;
  const parts = s.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0) && s.length > 30;
}

// Detect any plausible auth token: JWT, UUID, long opaque string
function isTokenLike(s: string): boolean {
  if (typeof s !== "string" || s.length < 16) return false;
  if (isJWT(s)) return true;
  // UUID format
  if (/^[0-9a-f-]{32,36}$/i.test(s)) return true;
  // Long opaque string (no spaces, alphanumeric + special chars)
  if (s.length >= 40 && !/\s/.test(s)) return true;
  return false;
}

// Search known token field names first, then brute-force search all string values
function deepFindToken(obj: any, depth = 0): string | null {
  if (depth > 6 || obj === null || typeof obj !== "object") return null;

  // 1. Try well-known field names at this level
  for (const key of TOKEN_KEYS) {
    const val = obj[key];
    if (typeof val === "string" && isTokenLike(val)) return val;
  }

  // 2. Recurse into nested objects using known field names
  for (const key of TOKEN_KEYS) {
    const val = obj[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const found = deepFindToken(val, depth + 1);
      if (found) return found;
    }
  }

  // 3. Brute-force: look at ALL string values that look token-like
  for (const [, val] of Object.entries(obj)) {
    if (typeof val === "string" && isTokenLike(val)) return val;
  }

  // 4. Recurse into ALL nested objects
  for (const [, val] of Object.entries(obj)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const found = deepFindToken(val, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function deepFindUser(obj: any, depth = 0): MulaUser | null {
  if (depth > 4 || obj === null || typeof obj !== "object") return null;
  for (const key of USER_KEYS) {
    const val = obj[key];
    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      (val.id || val.phone || val.fullname || val.name)
    ) {
      return val as MulaUser;
    }
  }
  for (const [, val] of Object.entries(obj)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const found = deepFindUser(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function isSuccessResponse(res: any): boolean {
  if (!res || typeof res !== "object") return false;
  const msg: string = (
    res?.message ??
    res?.msg ??
    res?.status ??
    ""
  ).toLowerCase();
  const successKeywords = [
    "success",
    "ok",
    "created",
    "accepted",
    "logged",
    "signin",
    "login",
    "welcome",
  ];
  if (successKeywords.some((k) => msg.includes(k))) return true;
  if (res?.success === true || res?.ok === true) return true;
  if (res?.error === 0 || res?.error === false) return true;
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MulaUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          storage.getToken(),
          storage.getUser<MulaUser>(),
        ]);
        if (savedToken) {
          setToken(savedToken);
          // If saved user has phone as ID, extract real ID from token
          let userData = savedUser;
          if (savedUser && String(savedUser.id).length > 9) {
            const tokenPayload = decodeJWT(savedToken);
            if (tokenPayload?.user_id) {
              userData = { ...savedUser, id: tokenPayload.user_id };
              await storage.setUser(userData);
              if (__DEV__) {
                console.log("[Auth] Restored user_id from JWT:", tokenPayload.user_id);
              }
            }
          }
          setUser(userData);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const signin = async (phone: string, password: string) => {
    try {
      const res = await api.auth.signin(phone, password);

      if (__DEV__) {
        console.log("[Auth] signin response:", JSON.stringify(res));
      }

      const accessToken = deepFindToken(res);
      // Try to find user data with proper ID
      let userData = deepFindUser(res);

      // If no valid ID found in response, try to extract from JWT token
      if (!userData || !userData.id || String(userData.id) === phone || String(userData.id).length > 9) {
        if (accessToken) {
          const tokenPayload = decodeJWT(accessToken);
          if (tokenPayload?.user_id) {
            userData = { id: tokenPayload.user_id, phone };
            if (__DEV__) {
              console.log("[Auth] Extracted user_id from JWT:", tokenPayload.user_id);
            }
          }
        }
      }

      // If still no valid user data, fallback to phone
      if (!userData) {
        userData = { id: phone, phone };
      }

      if (accessToken) {
        await storage.setToken(accessToken);
        await storage.setUser(userData);
        setToken(accessToken);
        setUser(userData);
        return { success: true };
      }

      // API responded with success but gave no usable token
      if (isSuccessResponse(res)) {
        if (__DEV__) {
          console.warn(
            "[Auth] Signin succeeded but no token found in response. Full response:",
            JSON.stringify(res)
          );
        }
        return {
          success: false,
          error:
            "Signed in but no token received. Please contact support.",
        };
      }

      const errMsg =
        (res as any)?.message ??
        (res as any)?.error ??
        (res as any)?.msg ??
        "Invalid phone or password";
      return { success: false, error: String(errMsg) };
    } catch (e: any) {
      return { success: false, error: e?.message ?? "Login failed" };
    }
  };

  const signup = async (input: {
    phone: string;
    password: string;
    fullname: string;
    otp: number;
    otp_id: string;
    dob: string;
    gender: string;
  }) => {
    try {
      const res = await api.auth.signup(input);

      if (__DEV__) {
        console.log("[Auth] signup response:", JSON.stringify(res));
      }

      const accessToken = deepFindToken(res);
      const userData = deepFindUser(res) ?? {
        id: input.phone,
        phone: input.phone,
        fullname: input.fullname,
      };

      if (accessToken) {
        await storage.setToken(accessToken);
        await storage.setUser(userData);
        setToken(accessToken);
        setUser(userData);
        return { success: true };
      }

      if (isSuccessResponse(res)) {
        if (__DEV__) {
          console.warn(
            "[Auth] Signup succeeded but no token found. Response:",
            JSON.stringify(res)
          );
        }
        return {
          success: false,
          error: "Account created but login failed. Please sign in manually.",
        };
      }

      return {
        success: false,
        error:
          (res as any)?.message ?? (res as any)?.error ?? "Signup failed",
      };
    } catch (e: any) {
      return { success: false, error: e?.message ?? "Signup failed" };
    }
  };

  const requestOtp = async (phone: string) => {
    try {
      const res = await api.auth.requestOtp(phone);
      if (__DEV__) {
        console.log("[Auth] requestOtp response:", JSON.stringify(res));
      }
      const otp_id =
        res?.otp_id ??
        res?.data?.otp_id ??
        deepFindToken(res) ??
        undefined;
      return { success: true, otp_id };
    } catch (e: any) {
      return { success: false, error: e?.message ?? "OTP request failed" };
    }
  };

  const logout = async () => {
    await storage.clear();
    setUser(null);
    setToken(null);
  };

  const updateUser = (data: Partial<MulaUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : (data as MulaUser)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        signin,
        signup,
        requestOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
