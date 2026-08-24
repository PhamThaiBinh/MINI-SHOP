"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface RegisterFormProps {
  onRegisterSubmit: (name: string, email: string, pass: string, confirmPass: string) => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSubmit, isLoading = false }) => {
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onRegisterSubmit(regName, regEmail, regPassword, regConfirmPassword);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ gap: "12px" }}>
      <div className="form-group" style={{ marginBottom: "0" }}>
        <label htmlFor="reg-name" className="auth-label" style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
          Họ và tên *
        </label>
        <input
          type="text"
          id="reg-name"
          className="form-control auth-input"
          style={{ borderRadius: "12px", height: "42px" }}
          placeholder="Nhập họ và tên..."
          required
          disabled={isLoading}
          value={regName}
          onChange={(e) => setRegName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(e);
          }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "0" }}>
        <label htmlFor="reg-email" className="auth-label" style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
          Email *
        </label>
        <input
          type="email"
          id="reg-email"
          className="form-control auth-input"
          style={{ borderRadius: "12px", height: "42px" }}
          placeholder="email@example.com"
          required
          disabled={isLoading}
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(e);
          }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "0" }}>
        <label htmlFor="reg-password" className="auth-label" style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
          Mật khẩu *
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showRegPassword ? "text" : "password"}
            id="reg-password"
            className="form-control auth-input"
            style={{ paddingRight: "40px", borderRadius: "12px", height: "42px" }}
            placeholder="••••••••"
            required
            disabled={isLoading}
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit(e);
            }}
          />
          <button
            type="button"
            onClick={() => setShowRegPassword(!showRegPassword)}
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
            title={showRegPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showRegPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: "0" }}>
        <label htmlFor="reg-confirm-password" className="auth-label" style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
          Xác nhận mật khẩu *
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showRegConfirmPassword ? "text" : "password"}
            id="reg-confirm-password"
            className="form-control auth-input"
            style={{ paddingRight: "40px", borderRadius: "12px", height: "42px" }}
            placeholder="••••••••"
            required
            disabled={isLoading}
            value={regConfirmPassword}
            onChange={(e) => setRegConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit(e);
            }}
          />
          <button
            type="button"
            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
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
            title={showRegConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showRegConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: "100%",
          height: "46px",
          borderRadius: "12px",
          background: isLoading ? "#166534" : "var(--primary-color, #2e7d32)",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 800,
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
          marginTop: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: isLoading ? 0.8 : 1,
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang kiểm tra & gửi mã OTP...</span>
          </>
        ) : (
          "Đăng Ký Tài Khoản"
        )}
      </button>
    </form>
  );
};
