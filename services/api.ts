import AsyncStorage from "@react-native-async-storage/async-storage";
import { extractArray } from "./mappers";

const BASE_URL = (process.env.EXPO_PUBLIC_MULA_URL ?? "").replace(/\/$/, "");

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("@mula_token");
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!BASE_URL) {
    throw new Error("EXPO_PUBLIC_MULA_URL is not configured");
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    if (requireAuth && (res.status === 401 || res.status === 403)) {
      throw new Error("Authentication required");
    }
    const msg =
      (data as any)?.message ??
      (data as any)?.error ??
      (data as any)?.msg ??
      `Request failed (${res.status})`;
    const error: any = new Error(msg);
    error.details = (data as any)?.details ?? (data as any)?.errors ?? (data as any)?.validationErrors ?? data;
    error.status = res.status;
    throw error;
  }
  return data as T;
}

async function requestFormData<T>(
  path: string,
  fields: Record<string, string | number | undefined | null>,
  fileUri?: string | null,
  fileField = "payment_screenshot",
  requireAuth = true
): Promise<T> {
  const token = await getToken();

  const formData = new FormData();
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined && val !== null && val !== "") {
      formData.append(key, String(val));
    }
  }
  if (fileUri) {
    const filename = fileUri.split("/").pop() ?? "screenshot.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    formData.append(fileField, { uri: fileUri, name: filename, type: mimeMap[ext] ?? "image/jpeg" } as any);
  }

  if (!BASE_URL) throw new Error("EXPO_PUBLIC_MULA_URL is not configured");

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", body: formData, headers });

  let data: unknown;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const msg = (data as any)?.message ?? (data as any)?.error ?? (data as any)?.msg ?? `Request failed (${res.status})`;
    const error: any = new Error(msg);
    error.details = (data as any)?.details ?? (data as any)?.errors ?? data;
    error.status = res.status;
    throw error;
  }
  return data as T;
}

function getPaginationTotal(res: any): number | null {
  const v =
    res?.total ??
    res?.total_count ??
    res?.totalCount ??
    res?.count ??
    res?.data?.total ??
    res?.data?.total_count ??
    res?.meta?.total ??
    res?.pagination?.total ??
    null;
  return v !== null ? Number(v) : null;
}

function getPaginationPages(res: any): number | null {
  const v =
    res?.total_pages ??
    res?.totalPages ??
    res?.last_page ??
    res?.data?.total_pages ??
    res?.meta?.total_pages ??
    res?.pagination?.total_pages ??
    null;
  return v !== null ? Number(v) : null;
}

export async function fetchAllPages(path: string): Promise<any[]> {
  const allItems: any[] = [];
  let page = 1;
  let naturalPageSize = 0; // detected from page 1

  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await request<any>(`${path}${sep}page=${page}&limit=100&per_page=100`);

    const items = extractArray(res);

    if (__DEV__ && page === 1) {
      console.log(`[API] ${path} — top-level keys:`, Object.keys(res ?? {}));
      if (items[0]) {
        console.log(`[API] first item keys:`, Object.keys(items[0]));
        console.log(`[API] first item:`, JSON.stringify(items[0]).slice(0, 800));
      }
      console.log(`[API] ${path} — page 1 meta:`, {
        total: getPaginationTotal(res),
        totalPages: getPaginationPages(res),
        hasNext: res?.has_next ?? res?.data?.has_next ?? null,
        itemsThisPage: items.length,
      });
    }

    if (items.length === 0) break;

    if (page === 1) {
      naturalPageSize = items.length;
    }

    allItems.push(...items);

    const total = getPaginationTotal(res);
    const totalPages = getPaginationPages(res);
    const hasNext =
      res?.has_next ??
      res?.data?.has_next ??
      res?.meta?.has_next ??
      res?.pagination?.has_next ??
      null;

    if (total !== null && allItems.length >= total) break;
    if (totalPages !== null && page >= totalPages) break;
    if (hasNext === false) break;
    if (items.length < naturalPageSize) break; // fewer items than page 1 = last page

    page++;
    if (page > 50) break; // hard safety cap
  }

  return allItems;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  total: number | null;
  totalPages: number | null;
}

export async function fetchPage(
  path: string,
  page: number,
  limit: number = 20,
  extraParams: Record<string, string | number | undefined> = {}
): Promise<PaginatedResult<any>> {
  const sep = path.includes("?") ? "&" : "?";
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    per_page: String(limit),
    offset: String(offset),
    skip: String(offset),
  });
  for (const [k, v] of Object.entries(extraParams)) {
    if (v !== undefined && v !== null && v !== "") {
      params.set(k, String(v));
    }
  }
  const url = `${path}${sep}${params.toString()}`;

  const res = await request<any>(url);

  const items = extractArray(res);

  const total = getPaginationTotal(res);
  const totalPages = getPaginationPages(res);
  const hasNext =
    res?.has_next ??
    res?.data?.has_next ??
    res?.meta?.has_next ??
    res?.pagination?.has_next ??
    null;

  // Determine if there are more pages
  let hasMore = false;
  if (hasNext !== null) {
    hasMore = hasNext;
  } else if (totalPages !== null) {
    hasMore = page < totalPages;
  } else if (total !== null) {
    hasMore = items.length === limit && (page - 1) * limit + items.length < total;
  } else {
    hasMore = items.length === limit;
  }

  return {
    items,
    hasMore,
    total,
    totalPages,
  };
}

export interface MediumCategory {
  id: string;
  name: string;
}

// Fetches available medium/category filter options for the gallery.
// Endpoint shape can vary; we normalize to { id, name }.
export async function fetchTraditionalCategories(): Promise<MediumCategory[]> {
  const res = await request<any>("/artworks/traditional/mobile/categories");
  const arr = extractArray(res);

  const out: MediumCategory[] = [];
  for (const item of arr) {
    if (typeof item === "string" && item.trim()) {
      out.push({ id: item, name: item.trim() });
      continue;
    }
    if (item && typeof item === "object") {
      const name =
        item.medium_name ??
        item.name ??
        item.title ??
        item.label ??
        item.category_name ??
        item.medium ??
        "";
      const id = String(
        item.id ??
          item.medium_id ??
          item.fk_medium_type_id ??
          item.category_id ??
          name
      );
      if (typeof name === "string" && name.trim()) {
        out.push({ id, name: name.trim() });
      }
    }
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return out.filter((c) => {
    const k = c.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const api = {
  auth: {
    requestOtp: (phone: string) =>
      request<any>("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ input: { phone } }),
      }),

    checkOtp: (phone: string, otp_id: string, otp: number) =>
      request<any>("/auth/check-otp", {
        method: "POST",
        body: JSON.stringify({ input: { phone, otp_id, otp } }),
      }),

    signup: (input: {
      phone: string;
      password: string;
      fullname: string;
      otp: number;
      otp_id: string;
      dob: string;
      gender: string;
    }) =>
      request<any>("/user/signup", {
        method: "POST",
        body: JSON.stringify({ input }),
      }),

    signin: (phone: string, password: string) =>
      request<any>("/user/signin", {
        method: "POST",
        body: JSON.stringify({ input: { phone, password } }),
      }),

    forgetPassword: (phone: string) =>
      request<any>("/auth/forget-password", {
        method: "POST",
        body: JSON.stringify({ input: { phone } }),
      }),

    resetPassword: (
      phone: string,
      otp: number,
      otp_id: string,
      newPassword: string
    ) =>
      request<any>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ input: { phone, otp, otp_id, newPassword } }),
      }),
  },

  user: {
    getProfile: () => request<any>("/user/profile", {}, true),
    updateProfile: (input: Record<string, unknown>) =>
      request<any>(
        "/user/profile",
        { method: "PATCH", body: JSON.stringify({ input }) },
        true
      ),
    getAddress: (user_id: number | string) =>
      request<any>(`/address/?user_id=${user_id}`, {}, true),
  },

  products: {
    getAll: () => request<any>("/products"),
    getById: (id: number | string) => request<any>(`/products/${id}`),
  },

  artworks: {
    getTraditional: () => request<any>("/artworks/traditional"),
    getTraditionalById: (id: number | string) =>
      request<any>(`/artworks/traditional/${id}`),
    getDigital: () => request<any>("/artworks/digital"),
    getDigitalById: (id: number | string) =>
      request<any>(`/artworks/digital/${id}`),
    getSeries: () => request<any>("/series"),
    getById: (id: number | string) => request<any>(`/artworks/${id}`),
  },

  artists: {
    getAll: () => request<any>("/artists"),
    getById: (id: number | string) => request<any>(`/artists/${id}`),
  },

  cart: {
    get: (user_id: number | string) =>
      request<any>(`/cart?user_id=${user_id}`, {}, true),
    addItem: (
      product_id: number | string,
      quantity: number,
      user_id: number | string
    ) =>
      request<any>(
        "/cart/add-item",
        {
          method: "POST",
          body: JSON.stringify({ input: { product_id, quantity, user_id } }),
        },
        true
      ),
    deleteItem: (id: number | string) =>
      request<any>(`/cart/${id}`, { method: "DELETE" }, true),
  },

  payments: {
    getMethods: () => request<any>("/payment"),
  },

  orders: {
    create: (
      fields: Record<string, string | number | undefined | null>,
      screenshotUri?: string | null
    ) => requestFormData<any>("/order/user-order", fields, screenshotUri),
    buyNow: (input: Record<string, unknown>) =>
      request<any>(
        "/order/buy-now",
        { method: "POST", body: JSON.stringify({ input }) },
        true
      ),
    getById: (id: number | string) => request<any>(`/order/${id}`, {}, true),
    getHistory: (user_id: number | string) =>
      request<any>(`/order/history?user_id=${user_id}`, {}, true),
    getAll: (user_id: number | string) =>
      request<any>(`/order?user_id=${user_id}`, {}, true),
  },

  videos: {
    getAll: () => request<any>("/videos"),
    getById: (id: number | string) => request<any>(`/videos/${id}`),
    getCreators: () => request<any>("/videos/creators"),
    getCreatorById: (id: number | string) =>
      request<any>(`/videos/creators/${id}`),
  },

  articles: {
    getAll: () => request<any>("/articles"),
    getById: (id: number | string) => request<any>(`/articles/${id}`),
  },

  events: {
    getAll: () => request<any>("/events"),
    getById: (id: number | string) => request<any>(`/events/${id}`),
  },

  engagement: {
    follow: (
      fk_video_creator_id: number,
      fk_user_id: number,
      is_traditional: boolean
    ) =>
      request<any>(
        "/engagement/follow",
        {
          method: "POST",
          body: JSON.stringify({
            input: {
              fk_video_creator_id,
              fk_user_id,
              is_traditional: String(is_traditional),
            },
          }),
        },
        true
      ),
    addFavourite: (
      fk_user_id: number,
      artwork_id?: number,
      digital_artwork_id?: number
    ) =>
      request<any>(
        "/engagement/favourite",
        {
          method: "POST",
          body: JSON.stringify({
            fk_user_id,
            ...(artwork_id ? { fk_artwork_id: artwork_id } : {}),
            ...(digital_artwork_id
              ? { fk_digital_artwork_id: digital_artwork_id }
              : {}),
          }),
        },
        true
      ),
    getFavourites: (user_id: number | string) =>
      request<any>(`/engagement/favourites?user_id=${user_id}`, {}, true),
    deleteFavourite: (id: number | string) =>
      request<any>(`/engagement/favourite/${id}`, { method: "DELETE" }, true),
  },
};
