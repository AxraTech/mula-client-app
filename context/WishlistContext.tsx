import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

interface WishlistContextType {
  liked: Set<string>;
  toggleLike: (artworkId: string) => void;
  isLiked: (artworkId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const toggleLike = useCallback((artworkId: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(artworkId)) {
        next.delete(artworkId);
      } else {
        next.add(artworkId);
      }
      return next;
    });
  }, []);

  const isLiked = useCallback((artworkId: string) => liked.has(artworkId), [liked]);

  const value = useMemo(() => ({ liked, toggleLike, isLiked }), [liked, toggleLike, isLiked]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
