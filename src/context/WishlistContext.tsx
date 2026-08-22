"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncUserWishlistToSupabase, fetchUserWishlistFromSupabase } from "@/lib/supabaseUserFeatures";

interface WishlistContextType {
  wishlistIds: (number | string)[];
  toggleWishlist: (productId: number | string) => void;
  isWishlisted: (productId: number | string) => boolean;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "mini_shop_wishlist";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<(number | string)[]>([]);
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

    // Cross-tab Synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setWishlistIds(updated);
          }
        } catch (err) {
          console.error("Error syncing wishlist from storage:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
      } catch (e) {
        console.error("Error saving wishlist to localStorage:", e);
      }

      if (user?.username) {
        const numIds = wishlistIds.map((id) => Number(id)).filter((id) => !isNaN(id));
        syncUserWishlistToSupabase(user.username, numIds);
      }
    }
  }, [wishlistIds, isMounted, user]);

  const toggleWishlist = (productId: number | string) => {
    if (productId === undefined || productId === null) return;
    setWishlistIds((prev) => {
      const isAlreadyIn = prev.some((id) => String(id) === String(productId));
      if (isAlreadyIn) {
        return prev.filter((id) => String(id) !== String(productId));
      } else {
        const numVal = Number(productId);
        const targetVal = !isNaN(numVal) && String(numVal) === String(productId).trim() ? numVal : productId;
        return [...prev, targetVal];
      }
    });
  };

  const isWishlisted = (productId: number | string) => {
    if (productId === undefined || productId === null) return false;
    return wishlistIds.some((id) => String(id) === String(productId));
  };

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
