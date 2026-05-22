import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Artwork } from "@/constants/data";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  id?: number | string;
  artwork: Artwork;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (artwork: Artwork) => Promise<void>;
  removeFromCart: (artworkId: string, cartItemId?: number | string) => Promise<void>;
  clearCart: () => void;
  itemCount: number;
  total: number;
  syncing: boolean;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

function mapApiCartItemToLocal(apiItem: any, artworkFallback?: Artwork): CartItem {
  return {
    id: apiItem.id ?? apiItem.cart_id,
    quantity: apiItem.quantity ?? 1,
    artwork: artworkFallback ?? {
      id: String(apiItem.product_id ?? apiItem.fk_product_id ?? ""),
      title: apiItem.product?.title ?? apiItem.title ?? "Artwork",
      artist: apiItem.product?.artist?.fullname ?? apiItem.artist ?? "Unknown",
      artistId: String(apiItem.product?.fk_artist_id ?? ""),
      type: "manual",
      medium: "Oil Painting",
      year: new Date().getFullYear(),
      dimensions: "",
      price: Number(apiItem.product?.price ?? apiItem.price ?? 0),
      currency: "MMK",
      image: apiItem.product?.product_image_url
        ? { uri: apiItem.product.product_image_url }
        : null,
      description: "",
      isSoldOut: false,
      isLiked: false,
      category: "",
    },
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const syncCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      setSyncing(true);
      const res = await api.cart.get(user.id);
      const cartItems: any[] = Array.isArray(res)
        ? res
        : res?.data ?? res?.cart ?? [];
      setItems(cartItems.map((item) => mapApiCartItemToLocal(item)));
    } catch {
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      syncCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, user?.id]);

  const addToCart = async (artwork: Artwork) => {
    const existing = items.find((i) => i.artwork.id === artwork.id);

    // Update local state immediately
    setItems((prev) => {
      if (existing) {
        return prev.map((i) =>
          i.artwork.id === artwork.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { artwork, quantity: 1 }];
    });

    // Sync to backend cart
    if (user?.id) {
      try {
        await api.cart.addItem(artwork.id, 1, user.id);
      } catch (e) {
        console.warn("Backend cart sync failed:", e);
      }
    }
  };

  const removeFromCart = async (artworkId: string) => {
    const item = items.find((i) => i.artwork.id === artworkId);
    setItems((prev) => prev.filter((i) => i.artwork.id !== artworkId));
    // Sync to backend
    if (item?.id) {
      try {
        await api.cart.deleteItem(item.id);
      } catch (e) {
        console.warn("Backend cart delete failed:", e);
      }
    }
  };

  const clearCart = async () => {
    const snapshot = items;
    setItems([]);
    await Promise.all(
      snapshot
        .filter((item) => item?.id)
        .map((item) =>
          api.cart.deleteItem(item.id!).catch((e) => {
            console.warn("Backend cart clear failed for item:", item.id, e);
          })
        )
    );
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce(
    (sum, i) => sum + i.artwork.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        itemCount,
        total,
        syncing,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
