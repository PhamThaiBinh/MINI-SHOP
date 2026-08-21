"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ShoppingBag, Gift, Truck, ShieldCheck, ChevronRight, ChevronLeft, X, Award, CheckCircle2 } from "lucide-react";

interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ forceOpen, onClose }) => {
  const { user, completeOnboarding } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }

    const checkAndShowOnboarding = () => {
      if (typeof window === "undefined") return;

      const isNewReg = localStorage.getItem("minishop_onboarding_new_registered");
      if (isNewReg === "true") {
        setIsOpen(true);
        setCurrentStep(0);
        return;
      }

      if (user && !user.hasCompletedOnboarding) {
        const isDone = localStorage.getItem(`minishop_onboarding_completed_${user.username}`);
        if (!isDone) {
          setIsOpen(true);
          setCurrentStep(0);
        }
      }
    };

    const timer = setTimeout(checkAndShowOnboarding, 500);

    // Listen to custom re-trigger event
    const handleTrigger = () => {
      setIsOpen(true);
      setCurrentStep(0);
    };
    window.addEventListener("minishop_trigger_onboarding", handleTrigger);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("minishop_trigger_onboarding", handleTrigger);
    };
  }, [user, forceOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Chào Mừng Đến Với MINI SHOP!",
      subtitle: "Hệ thống mua sắm đồ nội thất & trang trí cao cấp",
      icon: <Sparkles style={{ width: "36px", height: "36px", color: "#2e7d32" }} />,
      badge: "Tân Thủ",
      content: (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
            Cảm ơn bạn đã đăng ký tài khoản! MINI SHOP mang đến không gian mua sắm sắm nội thất hiện đại, tích lũy điểm thưởng và tra cứu vận chuyển tiện lợi.
          </p>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Award style={{ width: "28px", height: "28px", color: "#16a34a", flexShrink: 0 }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 800, color: "#15803d", fontSize: "13.5px" }}>🎁 Phần Quà Chào Mừng</div>
              <div style={{ color: "#166534", fontSize: "12.5px" }}>Nhận ngay **Voucher 50.000đ** + **500 Điểm Thưởng** sau khi hoàn thành hướng dẫn nhanh.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Khám Phá Flash Sale Giá Sập Sàn",
      subtitle: "Cập nhật ưu đãi mỗi ngày",
      icon: <ShoppingBag style={{ width: "36px", height: "36px", color: "#0284c7" }} />,
      badge: "Sản Phẩm",
      content: (
        <div>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "14px" }}>
            Truy cập mục **Flash Sale** để săn những món đồ nội thất (Sofa, Bàn ăn, Giường ngủ) với giá ưu đãi giảm đến 50%.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
              <CheckCircle2 style={{ width: "18px", height: "18px", color: "#0284c7" }} /> Lọc sản phẩm theo khoảng giá và danh mục dễ dàng.
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
              <CheckCircle2 style={{ width: "18px", height: "18px", color: "#0284c7" }} /> Kiểm tra số lượng tồn kho theo thời gian thực.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Tích Điểm Thưởng & Đổi Voucher",
      subtitle: "Quyền lợi thành viên thân thiết",
      icon: <Gift style={{ width: "36px", height: "36px", color: "#d97706" }} />,
      badge: "Ưu Đãi",
      content: (
        <div>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "14px" }}>
            Mỗi đơn hàng thành công sẽ tự động cộng điểm tích lũy vào tài khoản cá nhân của bạn.
          </p>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "14px", fontSize: "13px", color: "#92400e" }}>
            💡 Dùng điểm thưởng đổi các mã giảm giá hấp dẫn như **MINI10**, **MINI50**, **MINI100** trong trang Quản Lý Tài Khoản.
          </div>
        </div>
      ),
    },
    {
      title: "Tra Cứu Đơn Hàng & Vận Chuyển",
      subtitle: "Minh bạch hành trình giao hàng",
      icon: <Truck style={{ width: "36px", height: "36px", color: "#7c3aed" }} />,
      badge: "Giao Hàng",
      content: (
        <div>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "14px" }}>
            Bạn có thể dễ dàng kiểm tra tiến độ giao hàng và lịch trình đơn hàng thông qua mục **Tra Cứu Đơn Hàng** bằng Số Điện Thoại hoặc Mã Đơn.
          </p>
          <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "14px", padding: "14px", fontSize: "13px", color: "#5b21b6" }}>
            🚚 Hỗ trợ hủy đơn hàng tức thì khi đơn đang ở trạng thái *"Chờ xác nhận"*.
          </div>
        </div>
      ),
    },
    {
      title: "Sẵn Sàng Mua Sắm!",
      subtitle: "Đã hoàn thành chuyến tham quan hướng dẫn",
      icon: <ShieldCheck style={{ width: "38px", height: "38px", color: "#16a34a" }} />,
      badge: "Hoàn Thành",
      content: (
        <div style={{ textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #16a34a 0%, #2e7d32 100%)", color: "#ffffff", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.3)" }}>
            <Award style={{ width: "42px", height: "42px", margin: "0 auto 8px auto", display: "block" }} />
            <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>BẠN ĐÃ NHẬN ĐƯỢC:</div>
            <div style={{ fontSize: "22px", fontWeight: 900, margin: "6px 0", color: "#fef08a" }}>🎟️ Voucher WELCOME50 (Giảm 50.000đ)</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>+ 🏆 500 Điểm Thưởng Tân Thủ</div>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "14px" }}>
            Bấm **"Bắt Đầu Trải Nghiệm"** để bắt đầu khám phá MINI SHOP ngay bây giờ!
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    completeOnboarding();
    setIsOpen(false);
    if (onClose) onClose();
  };

  const current = steps[currentStep];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.65)",
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
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {/* Header Bar */}
        <div style={{ padding: "20px 24px 14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              {current.icon}
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "999px" }}>
                {current.badge} • Bước {currentStep + 1}/{steps.length}
              </span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>{current.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            style={{ border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
            title="Đóng / Bỏ qua"
          >
            <X style={{ width: "22px", height: "22px" }} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: "4px", background: "#f1f5f9" }}>
          <div
            style={{
              height: "100%",
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: "var(--primary-color, #2e7d32)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Body Content */}
        <div style={{ padding: "24px" }}>
          <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, marginBottom: "12px" }}>
            {current.subtitle}
          </div>
          {current.content}
        </div>

        {/* Footer Controls */}
        <div style={{ padding: "16px 24px 20px 24px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Bỏ qua
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <ChevronLeft style={{ width: "16px", height: "16px" }} /> Quay lại
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                border: "none",
                background: currentStep === steps.length - 1 ? "#16a34a" : "var(--primary-color, #2e7d32)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
              }}
            >
              {currentStep === steps.length - 1 ? "Bắt Đầu Trải Nghiệm 🚀" : "Tiếp theo"}
              {currentStep < steps.length - 1 && <ChevronRight style={{ width: "16px", height: "16px" }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
