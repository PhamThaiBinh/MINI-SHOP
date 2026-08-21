"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Key } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface LoginFormProps {
  onLoginSubmit: (email: string, pass: string) => void;
  onQuickLoginAdmin: () => void;
  onQuickLoginCustomer: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSubmit,
  onQuickLoginAdmin,
  onQuickLoginCustomer,
}) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSubmit(loginEmail, loginPassword);
  };

  const handleForgotPassword = async () => {
    const emailPrompt = prompt(
      "Nhập Email đăng ký của bạn để nhận liên kết khôi phục mật khẩu:",
      loginEmail || ""
    );
    if (!emailPrompt) return;
    const email = emailPrompt.trim();
    if (!email.includes("@")) {
      alert("Vui lòng nhập địa chỉ Email hợp lệ!");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert(`Lỗi: ${error.message}`);
    } else {
      alert(`Hệ thống đã gửi hướng dẫn khôi phục mật khẩu tới Email "${email}". Vui lòng kiểm tra hộp thư!`);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ gap: "14px" }}>
      <div className="form-group" style={{ marginBottom: "0" }}>
        <label htmlFor="login-email" className="auth-label" style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
          Tên đăng nhập hoặc Email *
        </label>
        <input
          type="text"
          id="login-email"
          className="form-control auth-input"
          style={{ borderRadius: "12px", height: "46px" }}
          placeholder="Nhập tên đăng nhập hoặc email..."
          required
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "0" }}>
        <label htmlFor="login-password" className="auth-label" style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
          Mật khẩu *
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            id="login-password"
            className="form-control auth-input"
            style={{ paddingRight: "40px", borderRadius: "12px", height: "46px" }}
            placeholder="••••••••"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
        <div style={{ textAlign: "right", marginTop: "6px" }}>
          <button
            type="button"
            onClick={handleForgotPassword}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary-color, #2e7d32)",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Key className="w-3.5 h-3.5" /> Quên mật khẩu?
          </button>
        </div>
      </div>

      <button
        type="submit"
        style={{
          width: "100%",
          height: "48px",
          borderRadius: "12px",
          background: "var(--primary-color, #2e7d32)",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 800,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
          marginTop: "4px",
        }}
      >
        Đăng Nhập Ngay
      </button>

      {/* Quick Fill buttons */}
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button
          type="button"
          onClick={() => {
            setLoginEmail("admin@minishop.vn");
            setLoginPassword("12345678");
            onQuickLoginAdmin();
          }}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            fontSize: "12px",
            fontWeight: 700,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          👑 Test Admin
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginEmail("binh.pham@minishop.vn");
            setLoginPassword("12345678");
            onQuickLoginCustomer();
          }}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            fontSize: "12px",
            fontWeight: 700,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          🛍️ Test Khách hàng
        </button>
      </div>
    </form>
  );
};
