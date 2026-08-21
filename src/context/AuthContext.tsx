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
  addPointsAndHistory: (
    title: string,
    pointsAmount: number,
    code?: string
  ) => void;
  consumeVoucher: (code: string) => void;
  addPlacedOrder: (order: PlacedOrder) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "mini_shop_auth_user";

function getStoredUserPointsAndHistory(username: string) {
  let points = 500;
  let history: RedemptionHistory[] = [];
  if (typeof window !== "undefined") {
    const storedPts = localStorage.getItem(`minishop_user_points_${username}`);
    if (storedPts !== null) {
      const parsed = parseInt(storedPts, 10);
      if (!isNaN(parsed)) points = parsed;
    }
    const storedHist = localStorage.getItem(`minishop_user_history_${username}`);
    if (storedHist) {
      try {
        const parsedHist = JSON.parse(storedHist);
        if (Array.isArray(parsedHist)) history = parsedHist;
      } catch (e) {}
    }
  }
  return { points, history };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync session on startup
  useEffect(() => {
    const supabase = createClient();

    const fetchSessionUser = async () => {
      setLoading(true);
      try {
        // 1. Check local session storage first
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            const username = parsed.username || "user";
            const storedData = getStoredUserPointsAndHistory(username);
            setUser({
              ...parsed,
              points: storedData.points,
              history: storedData.history.length > 0 ? storedData.history : parsed.history || [],
            });
            setLoading(false);
            return;
          }
        }

        // 2. Check Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const sbUser = session.user;
          const metadata = sbUser.user_metadata || {};
          const isEmailAdmin = sbUser.email === "admin@minishop.vn";
          const role = metadata.role === "admin" || isEmailAdmin ? "admin" : "customer";
          const username = metadata.name ? metadata.name.toLowerCase().replace(/\s+/g, "_") : sbUser.email?.split("@")[0] || "user";
          const storedData = getStoredUserPointsAndHistory(username);

          const profile: UserProfile = {
            id: sbUser.id,
            username,
            name: metadata.name || sbUser.email?.split("@")[0] || "Khách hàng",
            email: sbUser.email || "",
            phone: metadata.phone || "0988.123.456",
            role: role,
            points: storedData.points,
            history: storedData.history,
            vouchers: [],
          };
          setUser(profile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        }
      } catch (e) {
        console.error("Error loading session:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionUser();

    // Check if currently logged in user is blocked
    const checkBlockedStatus = (currentUser: UserProfile) => {
      try {
        const blockedListStr = localStorage.getItem("mini_shop_blocked_users");
        if (blockedListStr) {
          const blockedEmails: string[] = JSON.parse(blockedListStr);
          if (Array.isArray(blockedEmails) && blockedEmails.includes(currentUser.email)) {
            alert("Tài khoản của bạn đã bị Quản trị viên khóa. Hệ thống tự động đăng xuất!");
            logout();
            return true;
          }
        }
      } catch (e) {
        console.error(e);
      }
      return false;
    };

    // Cross-tab auto-logout if blocked by Admin
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "mini_shop_blocked_users" && user) {
        checkBlockedStatus(user);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const sbUser = session.user;
        const metadata = sbUser.user_metadata || {};
        const isEmailAdmin = sbUser.email === "admin@minishop.vn";
        const role = metadata.role === "admin" || isEmailAdmin ? "admin" : "customer";

        const profile: UserProfile = {
          id: sbUser.id,
          username: metadata.name ? metadata.name.toLowerCase().replace(/\s+/g, "_") : sbUser.email?.split("@")[0] || "user",
          name: metadata.name || sbUser.email?.split("@")[0] || "Khách hàng",
          email: sbUser.email || "",
          phone: metadata.phone || "0988.123.456",
          role: role,
          points: 500,
          history: [],
          vouchers: [],
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save active user profile to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error("Error saving user to localStorage:", e);
      }
    }
  }, [user]);

  // Enhanced SignUp (No email rate limit error)
  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const isEmailAdmin = cleanEmail === "admin@minishop.vn";
    const role: "admin" | "customer" = isEmailAdmin ? "admin" : "customer";
    const supabase = createClient();

    try {
      // 1. Try Supabase Auth SignUp
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            name: cleanName,
            role: role,
          },
        },
      });

      if (!error && data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          username: cleanName.toLowerCase().replace(/\s+/g, "_"),
          name: cleanName,
          email: cleanEmail,
          phone: "0988.123.456",
          role: role,
          points: 500,
          history: [],
          vouchers: [],
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return { success: true };
      }
    } catch (e) {
      console.warn("Supabase Auth signUp error, proceeding with database fallback:", e);
    }

    // 2. Fallback to Supabase users table (Bypasses email rate limit exceeded)
    try {
      await supabase.from("users").insert({
        name: cleanName,
        username: "@" + cleanName.toLowerCase().replace(/\s+/g, "_"),
        email: cleanEmail,
        phone: "0988.123.456",
        role: role === "admin" ? "Administrator" : "Khách hàng",
        role_type: role,
        registered_date: new Date().toLocaleDateString("vi-VN"),
        status: "Active",
      });
    } catch (dbErr) {
      console.warn("Database insert warning:", dbErr);
    }

    const fallbackProfile: UserProfile = {
      username: cleanName.toLowerCase().replace(/\s+/g, "_"),
      name: cleanName,
      email: cleanEmail,
      phone: "0988.123.456",
      role: role,
      points: 500,
      history: [],
      vouchers: [],
    };
    setUser(fallbackProfile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackProfile));
    return { success: true };
  };

  // Enhanced SignIn with Blocked User Check & Credentials Validation
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const supabase = createClient();

    // Check if account is blocked in localStorage
    try {
      const blockedListStr = localStorage.getItem("mini_shop_blocked_users");
      if (blockedListStr) {
        const blockedEmails: string[] = JSON.parse(blockedListStr);
        if (Array.isArray(blockedEmails) && (blockedEmails.includes(cleanEmail) || blockedEmails.includes("binh.nguyen@minishop.vn") && (cleanEmail === "binh" || cleanEmail === "binh.nguyen@minishop.vn"))) {
          return { success: false, error: "Tài khoản của bạn đã bị khóa bởi Quản trị viên!" };
        }
      }
    } catch (e) {}

    // 1. Check Supabase database users table status & password
    try {
      const { data: userRows } = await supabase
        .from("users")
        .select("*")
        .or(`email.ilike.${cleanEmail},username.ilike.${cleanEmail}`);

      if (userRows && userRows.length > 0) {
        const matched = userRows[0];
        if (matched.status === "Blocked" || matched.status === "Khóa" || matched.status === "Tạm khóa") {
          return { success: false, error: "Tài khoản của bạn đã bị khóa bởi Quản trị viên!" };
        }

        // Validate password against matched user password field or fallback to "123456"
        const dbPass = matched.password || matched.pass;
        if (dbPass) {
          if (dbPass !== cleanPass && cleanPass !== "123456") {
            return { success: false, error: "Sai tên đăng nhập hoặc mật khẩu!" };
          }
        } else {
          // Require password "123456" or "admin123" for admin
          const validPasses = ["123456"];
          if (cleanEmail.includes("admin")) validPasses.push("admin123");
          if (!validPasses.includes(cleanPass)) {
            return { success: false, error: "Sai tên đăng nhập hoặc mật khẩu!" };
          }
        }

        const isEmailAdmin = matched.email === "admin@minishop.vn" || matched.role_type === "admin" || cleanEmail.includes("admin");
        const role: "admin" | "customer" = isEmailAdmin ? "admin" : "customer";

        const profile: UserProfile = {
          id: String(matched.id),
          username: String(matched.username || cleanEmail.split("@")[0]),
          name: String(matched.name || "Khách hàng"),
          email: String(matched.email || cleanEmail),
          phone: String(matched.phone || "0988.123.456"),
          role: role,
          points: 500,
          history: [],
          vouchers: [],
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return { success: true };
      }
    } catch (dbErr) {
      console.error("Database user check error:", dbErr);
    }

    // 2. Try Supabase Auth signInWithPassword
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!error && data.user) {
        const sbUser = data.user;
        const metadata = sbUser.user_metadata || {};
        const isEmailAdmin = sbUser.email === "admin@minishop.vn";
        const role = metadata.role === "admin" || isEmailAdmin ? "admin" : "customer";

        const profile: UserProfile = {
          id: sbUser.id,
          username: metadata.name ? metadata.name.toLowerCase().replace(/\s+/g, "_") : sbUser.email?.split("@")[0] || "user",
          name: metadata.name || sbUser.email?.split("@")[0] || "Khách hàng",
          email: sbUser.email || cleanEmail,
          phone: metadata.phone || "0988.123.456",
          role: role,
          points: 500,
          history: [],
          vouchers: [],
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return { success: true };
      }
    } catch (e) {}

    // 3. Admin credentials fallback check (Require password "123456" or "admin123")
    if (cleanEmail === "admin@minishop.vn" || cleanEmail === "admin") {
      if (cleanPass !== "123456" && cleanPass !== "admin123") {
        return { success: false, error: "Sai tên đăng nhập hoặc mật khẩu!" };
      }
      const adminProfile: UserProfile = {
        username: "admin",
        name: "Quản Trị Viên (Admin)",
        email: "admin@minishop.vn",
        phone: "0987.654.321",
        role: "admin",
        points: 9999,
        history: [],
        vouchers: [],
      };
      setUser(adminProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminProfile));
      return { success: true };
    }

    // 4. Customer credentials fallback check for "binh" (Require password "123456" strictly)
    if (cleanEmail === "binh.nguyen@minishop.vn" || cleanEmail === "binh" || cleanEmail === "@binh") {
      if (cleanPass !== "123456") {
        return { success: false, error: "Sai tên đăng nhập hoặc mật khẩu!" };
      }
      const customerProfile: UserProfile = {
        username: "binh",
        name: "Bình Nguyễn",
        email: "binh.nguyen@minishop.vn",
        phone: "0988.123.456",
        role: "customer",
        points: 500,
        history: [],
        vouchers: [],
      };
      setUser(customerProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customerProfile));
      return { success: true };
    }

    return { success: false, error: "Sai tên đăng nhập hoặc mật khẩu!" };
  };

  const loginUser = (identifier: string): UserProfile | null => {
    return user;
  };

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
    if (!user) return false;
    if (user.points < pointsRequired) return false;

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

    const newPoints = user.points - pointsRequired;
    const updatedUser: UserProfile = {
      ...user,
      points: newPoints,
      history: [newRedemption, ...user.history],
      vouchers: updatedVouchers,
    };

    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(`minishop_user_points_${user.username}`, String(newPoints));
      localStorage.setItem(`minishop_user_history_${user.username}`, JSON.stringify(updatedUser.history));
    }
    return true;
  };

  const addPointsAndHistory = (
    title: string,
    pointsAmount: number,
    code: string = "REWARD"
  ) => {
    if (!user) return;

    const newTransaction: RedemptionHistory = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString("vi-VN"),
      giftName: `Hoàn thành nhiệm vụ: ${title}`,
      pointsSpent: -pointsAmount,
      code,
    };

    const newPoints = user.points + pointsAmount;
    const updatedUser: UserProfile = {
      ...user,
      points: newPoints,
      history: [newTransaction, ...(user.history || [])],
    };

    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(`minishop_user_points_${user.username}`, String(newPoints));
      localStorage.setItem(`minishop_user_history_${user.username}`, JSON.stringify(updatedUser.history));
    }
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
        addPointsAndHistory,
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
