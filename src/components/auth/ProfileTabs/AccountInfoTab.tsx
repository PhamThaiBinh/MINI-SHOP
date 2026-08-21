"use client";

import React, { useState, useEffect } from "react";
import { UserProfile } from "@/context/AuthContext";
import { Save } from "lucide-react";

interface AccountInfoTabProps {
  user: UserProfile;
}

export const AccountInfoTab: React.FC<AccountInfoTabProps> = ({ user }) => {
  const [profileName, setProfileName] = useState(user.name || "");
  const [profilePhone, setProfilePhone] = useState(user.phone || "");

  useEffect(() => {
    setProfileName(user.name || "");
    setProfilePhone(user.phone || "");
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đã cập nhật thông tin cá nhân thành công!");
  };

  return (
    <div>
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "16px", margin: "0 0 16px 0" }}>
        Thông Tin Tài Khoản
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "560px" }}>
        <div>
          <label className="auth-label">Họ và tên *</label>
          <input
            type="text"
            className="form-control auth-input"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
            style={{ borderRadius: "10px", height: "44px" }}
          />
        </div>

        <div>
          <label className="auth-label">Tên đăng nhập (Username)</label>
          <input
            type="text"
            className="form-control auth-input"
            value={`@${user.username || "user"}`}
            disabled
            style={{ borderRadius: "10px", height: "44px", background: "#f8fafc", color: "#64748b" }}
          />
        </div>

        <div>
          <label className="auth-label">Địa chỉ Email</label>
          <input
            type="email"
            className="form-control auth-input"
            value={user.email}
            disabled
            style={{ borderRadius: "10px", height: "44px", background: "#f8fafc", color: "#64748b" }}
          />
        </div>

        <div>
          <label className="auth-label">Số điện thoại *</label>
          <input
            type="tel"
            className="form-control auth-input"
            value={profilePhone}
            onChange={(e) => setProfilePhone(e.target.value)}
            required
            style={{ borderRadius: "10px", height: "44px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: "10px",
            background: "var(--primary-color, #2e7d32)",
            color: "#ffffff",
            border: "none",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(46, 125, 50, 0.2)",
            marginTop: "8px",
          }}
        >
          <Save className="w-4 h-4" /> Lưu Thay Đổi
        </button>
      </form>
    </div>
  );
};
