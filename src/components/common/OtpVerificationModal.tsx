"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, ShieldCheck, RefreshCw, X, AlertCircle } from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  fallbackOtp?: string;
  onVerify: (otp: string) => Promise<{ success: boolean; error?: string }>;
  onResendOtp: () => Promise<void>;
  onClose: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  email,
  fallbackOtp,
  onVerify,
  onResendOtp,
  onClose,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showQuickHint, setShowQuickHint] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setErrorMsg("");
      setCountdown(60);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMsg("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split("");
      setDigits(newDigits);
      setErrorMsg("");
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifySubmit = async () => {
    const enteredCode = digits.join("");
    if (enteredCode.length < 6) {
      setErrorMsg("Vui lòng nhập đầy đủ 6 chữ số mã xác thực!");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");
    try {
      const res = await onVerify(enteredCode);
      if (!res.success) {
        setErrorMsg(res.error || "Mã xác thực 6 chữ số không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại Gmail!");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Mã xác thực không đúng. Vui lòng thử lại!");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg("");
    try {
      await onResendOtp();
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
    } catch (err: any) {
      setErrorMsg("Không thể gửi lại mã. Vui lòng thử lại sau!");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                background: "#ecfdf5",
                padding: "10px",
                borderRadius: "14px",
                color: "var(--primary-color, #2e7d32)",
              }}
            >
              <Mail style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background: "#f0fdf4",
                  color: "#166534",
                  padding: "2px 8px",
                  borderRadius: "999px",
                }}
              >
                Xác Thực Gmail
              </span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                Nhập Mã Xác Nhận 6 Chữ Số
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer" }}
          >
            <X style={{ width: "22px", height: "22px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.6", margin: "0 0 14px 0" }}>
            Mã xác thực gồm 6 chữ số đã được gửi trực tiếp đến địa chỉ Gmail: <strong style={{ color: "#0f172a" }}>{email}</strong>. Vui lòng mở <strong>Hộp thư đến (Inbox)</strong> để lấy mã.
          </p>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", fontSize: "12px", color: "#64748b", marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: "1.5" }}>
            <span style={{ fontSize: "14px", flexShrink: 0 }}>💡</span>
            <span>Nếu chưa thấy thư sau vài giây, vui lòng làm mới hộp thư hoặc kiểm tra thêm mục <strong>Thư rác (Spam) / Quảng cáo</strong>.</span>
          </div>

          {/* 6 Digit Input Boxes */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                style={{
                  width: "48px",
                  height: "56px",
                  fontSize: "22px",
                  fontWeight: 900,
                  textAlign: "center",
                  borderRadius: "12px",
                  border: digit ? "2px solid var(--primary-color, #2e7d32)" : "1.5px solid #cbd5e1",
                  background: digit ? "#f0fdf4" : "#ffffff",
                  color: "#0f172a",
                  outline: "none",
                  boxShadow: digit ? "0 4px 10px rgba(46, 125, 50, 0.15)" : "none",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resend OTP Section */}
          <div style={{ textAlign: "center", fontSize: "13px", color: "#64748b" }}>
            Chưa nhận được thư?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              style={{
                border: "none",
                background: "transparent",
                color: countdown > 0 || isResending ? "#94a3b8" : "var(--primary-color, #2e7d32)",
                fontWeight: 800,
                cursor: countdown > 0 || isResending ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <RefreshCw style={{ width: "13px", height: "13px" }} />
              {isResending ? "Đang gửi..." : `Gửi lại mã ${countdown > 0 ? `(${countdown}s)` : ""}`}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleVerifySubmit}
            disabled={isVerifying}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: "var(--primary-color, #2e7d32)",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
              opacity: isVerifying ? 0.7 : 1,
            }}
          >
            {isVerifying ? (
              "Đang đối chiếu..."
            ) : (
              <>
                Xác Nhận & Đăng Ký <i className="fa-solid fa-circle-check"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
