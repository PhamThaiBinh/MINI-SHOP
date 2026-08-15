"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncUserWishlistToSupabase, fetchUserWishlistFromSupabase } from "@/lib/supabaseUserFeatures";

interface WishlistContextType {
  wishlistIds: number[];
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "mini_shop_wishlist";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    async function loadWishlistData() {
      if (user?.username) {
        const sbIds = await fetchUserWishlistFromSupabase(user.username);
        if (sbIds.length > 0) {
          setWishlistIds(sbIds);
          return;
        }
      }

      try {
        const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (saved) {
          setWishlistIds(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Error reading wishlist from localStorage:", e);
      }
    }

    loadWishlistData();
  }, [user]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
      } catch (e) {
        console.error("Error saving wishlist to localStorage:", e);
      }

      if (user?.username) {
        syncUserWishlistToSupabase(user.username, wishlistIds);
      }
    }
  }, [wishlistIds, isMounted, user]);

  const toggleWishlist = (productId: number) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: number) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        totalWishlistItems: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
