"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

export const MOCK_USERS: UserProfile[] = [
  {
    username: "admin",
    name: "Quản Trị Viên (Admin)",
    email: "admin@minishop.vn",
    phone: "0900.000.000",
    role: "admin",
    points: 9999,
    history: [],
    vouchers: [],
  },
  {
    username: "binh",
    name: "Bình Nguyễn",
    email: "binh.nguyen@minishop.vn",
    phone: "0988.123.456",
    role: "customer",
    points: 500,
    history: [],
    vouchers: [],
  },
  {
    username: "an",
    name: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    phone: "0901.234.567",
    role: "customer",
    points: 1200,
    history: [
      {
        id: "RED-102",
        date: "10/08/2026",
        giftName: "Voucher Giảm 100.000đ",
        pointsSpent: 200,
        code: "MINISHOP100",
      },
    ],
    vouchers: [
      {
        code: "MINISHOP100",
        label: "Voucher Giảm 100.000đ",
        discount: 100000,
        minOrder: 300000,
        quantity: 1,
      },
    ],
  },
  {
    username: "mai",
    name: "Trần Thị Mai",
    email: "mai.tran@gmail.com",
    phone: "0912.345.678",
    role: "customer",
    points: 350,
    history: [],
    vouchers: [
      {
        code: "FREESHIP30",
        label: "Miễn Phí Vận Chuyển 30.000đ",
        discount: 30000,
        minOrder: 0,
        quantity: 1,
      },
    ],
  },
];

interface AuthContextType {
  user: UserProfile | null;
  loginUser: (identifier: string) => UserProfile;
  logout: () => void;
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
  const [user, setUser] = useState<UserProfile | null>(MOCK_USERS[1]); // Default to Bình
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_USERS[1]));
      }
    } catch (e) {
      console.error("Error loading user from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    if (isMounted && user) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error("Error saving user to localStorage:", e);
      }
    }
  }, [user, isMounted]);

  const loginUser = (identifier: string): UserProfile => {
    const query = (identifier || "").toLowerCase().trim();

    let targetUser = MOCK_USERS.find(
      (u) =>
        u.username.toLowerCase() === query ||
        u.email.toLowerCase() === query ||
        u.name.toLowerCase().includes(query)
    );

    if (!targetUser) {
      if (query.includes("admin")) {
        targetUser = MOCK_USERS[0];
      } else if (query.includes("an")) {
        targetUser = MOCK_USERS[2];
      } else if (query.includes("mai")) {
        targetUser = MOCK_USERS[3];
      } else {
        targetUser = MOCK_USERS[1];
      }
    }

    setUser(targetUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
    return targetUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    return true;
  };

  const consumeVoucher = (code: string) => {
    if (!user) return;

    const existingVoucher = user.vouchers.find((v) => v.code === code);
    let updatedVouchers = user.vouchers;
    let updatedUsedSystem = user.usedSystemCoupons || [];

    if (existingVoucher) {
      // Consume all stacked instances of this redeemed voucher upon order completion
      updatedVouchers = user.vouchers.filter((v) => v.code !== code);
    } else {
      // Consume 1-time system coupon
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
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const addPlacedOrder = (order: PlacedOrder) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      placedOrders: [order, ...(user.placedOrders || [])],
    };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
