import React, { createContext, useContext, useState, ReactNode } from "react";
import { Artwork } from "@/constants/data";

interface WishlistContextType {
  liked: Set<string>;
  toggleLike: (artworkId: string) => void;
  isLiked: (artworkId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const toggleLike = (artworkId: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(artworkId)) {
        next.delete(artworkId);
      } else {
        next.add(artworkId);
      }
      return next;
    });
  };

  const isLiked = (artworkId: string) => liked.has(artworkId);

  return (
    <WishlistContext.Provider value={{ liked, toggleLike, isLiked }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
