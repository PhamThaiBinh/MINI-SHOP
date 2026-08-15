"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import { useAuth } from "@/context/AuthContext";
import { syncUserCartToSupabase, fetchUserCartFromSupabase } from "@/lib/supabaseUserFeatures";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  showToast?: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "mini_shop_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3000);
  };

  useEffect(() => {
    setIsMounted(true);
    async function loadCartData() {
      const allProducts = await fetchProductsFromSupabase();

      if (user?.username) {
        const sbCartItems = await fetchUserCartFromSupabase(user.username);
        if (sbCartItems.length > 0) {
          const mappedCart: CartItem[] = [];
          for (const item of sbCartItems) {
            const prod = allProducts.find((p) => p.id === item.productId);
            if (prod) {
              mappedCart.push({ product: prod, quantity: item.quantity });
            }
          }
          setCart(mappedCart);
          return;
        }
      }

      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsedCart: CartItem[] = JSON.parse(saved);
          const validCart = parsedCart.filter((item) =>
            allProducts.some((p) => p.id === item.product.id)
          );
          setCart(validCart);
        }
      } catch (e) {
        console.error("Error reading cart from localStorage:", e);
      }
    }

    loadCartData();
  }, [user]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error("Error saving cart to localStorage:", e);
      }

      if (user?.username) {
        const supabaseCartItems = cart.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        }));
        syncUserCartToSupabase(user.username, supabaseCartItems);
      }
    }
  }, [cart, isMounted, user]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`🛒 Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        showToast,
      }}
    >
      {children}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#1e293b",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            zIndex: 9999,
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderLeft: "4px solid var(--primary-color, #2e7d32)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toastMsg}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
