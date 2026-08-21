"use client";

import React from "react";
import { User, Package, MapPin, Gift, Key } from "lucide-react";

export type AuthProfileTab = "profile" | "orders" | "addresses" | "rewards" | "security";

interface ProfileNavTabsProps {
  activeTab: AuthProfileTab;
  onChangeTab: (tab: AuthProfileTab) => void;
}

export const ProfileNavTabs: React.FC<ProfileNavTabsProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: "profile", label: "Thông Tin Tài Khoản", icon: User },
    { id: "orders", label: "Đơn Hàng Của Tôi", icon: Package },
    { id: "addresses", label: "Sổ Địa Chỉ Nhận Hàng", icon: MapPin },
    { id: "rewards", label: "Điểm Thưởng & Đổi Quà", icon: Gift },
    { id: "security", label: "Đổi Mật Khẩu", icon: Key },
  ] as const;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChangeTab(t.id as AuthProfileTab)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "none",
              background: isActive ? "#e8f5e9" : "transparent",
              color: isActive ? "var(--primary-color, #2e7d32)" : "#475569",
              fontSize: "14px",
              fontWeight: isActive ? 800 : 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
