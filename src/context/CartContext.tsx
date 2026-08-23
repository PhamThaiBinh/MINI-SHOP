"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import { useAuth } from "@/context/AuthContext";
import { syncUserCartToSupabase, fetchUserCartFromSupabase } from "@/lib/supabaseUserFeatures";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { formatVND } from "@/lib/utils";

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
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
          }
        }
      } catch (e) {
        console.error("Error reading cart from localStorage:", e);
      }
    }

    loadCartData();

    // Cross-tab Synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setCart(updated);
          }
        } catch (err) {
          console.error("Error syncing cart from storage:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
    const maxStock = product.stock !== undefined ? product.stock : 99;
    if (maxStock <= 0) {
      showToast(`Sản phẩm "${product.name}" hiện đã hết hàng trong kho!`);
      return;
    }

    let isExceeded = false;
    let comboResetToast: string | null = null;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentItem = prev[existingIndex];
        const newQty = currentItem.quantity + quantity;
        const targetQty = Math.min(newQty, maxStock);
        if (newQty > maxStock) isExceeded = true;

        let updatedProduct = { ...currentItem.product };

        // NẾU TĂNG SỐ LƯỢNG SẢN PHẨM COMBO LÊN > 1:
        // TỰ ĐỘNG QUAY TRỞ VỀ GIÁ GỐC MẶC ĐỊNH CỦA SẢN PHẨM
        if (targetQty > 1 && (currentItem.product.isCombo || currentItem.product.originalPrice)) {
          const defaultPrice = currentItem.product.originalPrice || currentItem.product.price;
          const defaultName = currentItem.product.originalName || currentItem.product.name.replace(/\s*\(Ưu Đãi Combo\)/g, "");
          updatedProduct = {
            ...updatedProduct,
            price: defaultPrice,
            name: defaultName,
            isCombo: false,
          };
          comboResetToast = `Sản phẩm "${defaultName}" đã quay trở về giá mặc định (${formatVND(defaultPrice)}) khi tăng số lượng!`;
        }

        return prev.map((item, idx) =>
          idx === existingIndex ? { product: updatedProduct, quantity: targetQty } : item
        );
      }

      const initialQty = Math.min(quantity, maxStock);
      if (quantity > maxStock) isExceeded = true;
      return [...prev, { product, quantity: initialQty }];
    });

    if (comboResetToast) {
      showToast(comboResetToast);
    } else if (isExceeded) {
      showToast(`Kho chỉ còn tối đa ${maxStock} món cho sản phẩm "${product.name}"!`);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    let comboResetToast: string | null = null;

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock !== undefined ? item.product.stock : 99;
          const targetQty = Math.min(quantity, maxStock);
          let updatedProduct = { ...item.product };

          // NẾU TĂNG SỐ LƯỢNG (> 1) VÀ SẢN PHẨM NÀY ĐANG ĐƯỢC ÁP DỤNG GIÁ COMBO:
          // SẼ QUAY TRỞ VỀ GIÁ GỐC MẶC ĐỊNH CỦA SẢN PHẨM!
          if (targetQty > 1 && (item.product.isCombo || item.product.originalPrice)) {
            const defaultPrice = item.product.originalPrice || item.product.price;
            const defaultName = item.product.originalName || item.product.name.replace(/\s*\(Ưu Đãi Combo\)/g, "");
            updatedProduct = {
              ...updatedProduct,
              price: defaultPrice,
              name: defaultName,
              isCombo: false,
            };
            comboResetToast = `Sản phẩm "${defaultName}" đã quay trở về giá mặc định (${formatVND(defaultPrice)}) khi tăng số lượng!`;
          }

          if (quantity > maxStock) {
            showToast(`Kho chỉ còn tối đa ${maxStock} món!`);
          }

          return { product: updatedProduct, quantity: targetQty };
        }
        return item;
      })
    );

    if (comboResetToast) {
      showToast(comboResetToast);
    }
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
            left: "auto",
            maxWidth: "calc(100vw - 32px)",
            boxSizing: "border-box",
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
