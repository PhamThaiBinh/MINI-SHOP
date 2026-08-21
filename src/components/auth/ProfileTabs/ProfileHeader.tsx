"use client";

import React from "react";
import { Crown, Sparkles, LogOut } from "lucide-react";
import { UserProfile } from "@/context/AuthContext";

interface ProfileHeaderProps {
  user: UserProfile;
  ordersCount: number;
  onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  ordersCount,
  onLogout,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        padding: "24px 28px",
        marginBottom: "20px",
        color: "#0f172a",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left: User Avatar & Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px", zIndex: 2 }}>
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2e7d32, #15803d)",
            color: "#ffffff",
            fontSize: "26px",
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(46, 125, 50, 0.25)",
            border: "3px solid #e8f5e9",
            flexShrink: 0,
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0, color: "#0f172a", letterSpacing: "-0.01em" }}>
              {user.name}
            </h2>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "999px",
                background: "#e8f5e9",
                border: "1px solid #bbf7d0",
                fontSize: "12px",
                fontWeight: 800,
                color: "var(--primary-color, #2e7d32)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Crown className="w-3.5 h-3.5 text-emerald-700" /> {(user as any).tier || (user.points >= 500 ? "Thành viên Vàng" : "Thành viên Bạc")}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
            @{user.username || "user"} • {user.email}
          </p>
        </div>
      </div>

      {/* Right: Metric Stats & Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", zIndex: 2, flexWrap: "wrap" }}>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "10px 18px", textAlign: "center", minWidth: "110px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Điểm Thưởng</div>
          <div style={{ fontSize: "19px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <Sparkles className="w-4 h-4 text-emerald-700" />
            {user.points.toLocaleString("vi-VN")}
          </div>
        </div>

        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "10px 18px", textAlign: "center", minWidth: "100px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Đơn Hàng</div>
          <div style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
            {ordersCount}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            padding: "10px 18px",
            borderRadius: "14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
        >
          <LogOut className="w-4 h-4" /> Đăng Xuất
        </button>
      </div>
    </div>
  );
};
