"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface RedemptionHistory {
  id: string;
  date: string;
  giftName: string;
  pointsSpent: number;
  code: string;
}

export interface UserVoucher {
  code: string;
  label: string;
  discount: number;
  minOrder?: number;
  quantity: number;
}

export interface PlacedOrder {
  id: string;
  date: string;
  status: "completed" | "shipping" | "processing";
  statusText: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: string;
  items: {
    name: string;
    image: string;
    qty: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface UserProfile {
  id?: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  points: number;
  history: RedemptionHistory[];
  vouchers: UserVoucher[];
  usedSystemCoupons?: string[];
  placedOrders?: PlacedOrder[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginUser: (identifier: string) => UserProfile | null;
  logout: () => Promise<void>;
  redeemGift: (
    giftName: string,
    pointsRequired: number,
    discount: number,
    code: string
  ) => boolean;
  consumeVoucher: (code: string) => void;
  addPlacedOrder: (order: PlacedOrder) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "mini_shop_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync Supabase Auth session
  useEffect(() => {
    const supabase = createClient();

    const fetchSessionUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const sbUser = session.user;
        const metadata = sbUser.user_metadata || {};
        const isEmailAdmin = sbUser.email === "admin@minishop.vn";
        const role = metadata.role === "admin" || isEmailAdmin ? "admin" : "customer";

        // Load cached extra profile data (points, vouchers, history) from localStorage
        let extraData: Partial<UserProfile> = {};
        try {
          const cached = localStorage.getItem(`${AUTH_STORAGE_KEY}_${sbUser.id}`);
          if (cached) {
            extraData = JSON.parse(cached);
          }
        } catch (e) {
          console.error(e);
        }

        const profile: UserProfile = {
          id: sbUser.id,
          username: metadata.name ? metadata.name.toLowerCase().replace(/\s+/g, "_") : sbUser.email?.split("@")[0] || "user",
          name: metadata.name || sbUser.email?.split("@")[0] || "Khách hàng",
          email: sbUser.email || "",
          phone: metadata.phone || extraData.phone || "0988.123.456",
          role: role,
          points: extraData.points !== undefined ? extraData.points : 500,
          history: extraData.history || [],
          vouchers: extraData.vouchers || [],
          usedSystemCoupons: extraData.usedSystemCoupons || [],
          placedOrders: extraData.placedOrders || [],
        };
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchSessionUser();

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const metadata = sbUser.user_metadata || {};
        const isEmailAdmin = sbUser.email === "admin@minishop.vn";
        const role = metadata.role === "admin" || isEmailAdmin ? "admin" : "customer";

        let extraData: Partial<UserProfile> = {};
        try {
          const cached = localStorage.getItem(`${AUTH_STORAGE_KEY}_${sbUser.id}`);
          if (cached) {
            extraData = JSON.parse(cached);
          }
        } catch (e) {
          console.error(e);
        }

        const profile: UserProfile = {
          id: sbUser.id,
          username: metadata.name ? metadata.name.toLowerCase().replace(/\s+/g, "_") : sbUser.email?.split("@")[0] || "user",
          name: metadata.name || sbUser.email?.split("@")[0] || "Khách hàng",
          email: sbUser.email || "",
          phone: metadata.phone || extraData.phone || "0988.123.456",
          role: role,
          points: extraData.points !== undefined ? extraData.points : 500,
          history: extraData.history || [],
          vouchers: extraData.vouchers || [],
          usedSystemCoupons: extraData.usedSystemCoupons || [],
          placedOrders: extraData.placedOrders || [],
        };
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save extra user state to localStorage when updated
  useEffect(() => {
    if (user && user.id) {
      try {
        localStorage.setItem(`${AUTH_STORAGE_KEY}_${user.id}`, JSON.stringify(user));
      } catch (e) {
        console.error("Error caching user profile:", e);
      }
    }
  }, [user]);

  // Real Supabase Auth SignUp
  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createClient();
      const isEmailAdmin = email.trim().toLowerCase() === "admin@minishop.vn";
      const role = isEmailAdmin ? "admin" : "customer";

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            role: role,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          username: name.trim().toLowerCase().replace(/\s+/g, "_"),
          name: name.trim(),
          email: email.trim(),
          phone: "0988.123.456",
          role: role,
          points: 500,
          history: [],
          vouchers: [],
        };
        setUser(profile);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Đã xảy ra lỗi khi đăng ký" };
    }
  };

  // Real Supabase Auth SignIn
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Đã xảy ra lỗi khi đăng nhập" };
    }
  };

  // Legacy wrapper for backwards compatibility
  const loginUser = (identifier: string): UserProfile | null => {
    return user;
  };

  // Real Supabase Auth SignOut
  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  };

  const redeemGift = (
    giftName: string,
    pointsRequired: number,
    discount: number,
    code: string
  ): boolean => {
    if (!user) {
      return false;
    }
    if (user.points < pointsRequired) {
      return false;
    }

    const newRedemption: RedemptionHistory = {
      id: `RED-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString("vi-VN"),
      giftName,
      pointsSpent: pointsRequired,
      code,
    };

    const existingIndex = user.vouchers.findIndex((v) => v.code === code);
    let updatedVouchers: UserVoucher[] = [];

    if (existingIndex > -1) {
      updatedVouchers = user.vouchers.map((v, idx) =>
        idx === existingIndex
          ? { ...v, quantity: (v.quantity || 1) + 1 }
          : v
      );
    } else {
      updatedVouchers = [
        { code, label: giftName, discount, quantity: 1 },
        ...user.vouchers,
      ];
    }

    const updatedUser: UserProfile = {
      ...user,
      points: user.points - pointsRequired,
      history: [newRedemption, ...user.history],
      vouchers: updatedVouchers,
    };

    setUser(updatedUser);
    return true;
  };

  const consumeVoucher = (code: string) => {
    if (!user) return;

    const existingVoucher = user.vouchers.find((v) => v.code === code);
    let updatedVouchers = user.vouchers;
    let updatedUsedSystem = user.usedSystemCoupons || [];

    if (existingVoucher) {
      updatedVouchers = user.vouchers.filter((v) => v.code !== code);
    } else {
      if (!updatedUsedSystem.includes(code)) {
        updatedUsedSystem = [...updatedUsedSystem, code];
      }
    }

    const updatedUser: UserProfile = {
      ...user,
      vouchers: updatedVouchers,
      usedSystemCoupons: updatedUsedSystem,
    };
    setUser(updatedUser);
  };

  const addPlacedOrder = (order: PlacedOrder) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      placedOrders: [order, ...(user.placedOrders || [])],
    };
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        loginUser,
        logout,
        redeemGift,
        consumeVoucher,
        addPlacedOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
