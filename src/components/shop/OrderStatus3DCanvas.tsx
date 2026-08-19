"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Truck,
  Check,
  Package,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  Box,
  QrCode,
  UserCheck,
  Navigation,
  FileCheck,
  Sparkles,
} from "lucide-react";

interface OrderStatus3DCanvasProps {
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled" | string;
  orderId: string;
}

export const OrderStatus3DCanvas: React.FC<OrderStatus3DCanvasProps> = ({
  status,
  orderId,
}) => {
  const [activeStage, setActiveStage] = useState<string>(status);
  const [gpsProgress, setGpsProgress] = useState<number>(65);

  useEffect(() => {
    setActiveStage(status);
  }, [status]);

  // Simulate real-life GPS movement for shipping stage
  useEffect(() => {
    if (activeStage === "shipping") {
      const interval = setInterval(() => {
        setGpsProgress((prev) => (prev >= 95 ? 40 : prev + 1.5));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [activeStage]);

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.03)",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: "1.75rem",
        padding: "8px",
        marginBottom: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "calc(1.75rem - 0.375rem)",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
        }}
      >
        {/* Top Eyebrow Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "#e0f2fe",
                color: "#0369a1",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>HỆ THỐNG ĐỊNH VỊ VẬN CHUYỂN THỰC TẾ (LIVE GPS TRACKER)</span>
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: 900,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Hành Trình Vận Chuyển Đơn Hàng {orderId}
            </h3>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)",
              }}
            />
            Tự động cập nhật GPS realtime
          </div>
        </div>

        {/* Dynamic Stage Canvas Content */}
        {activeStage === "pending" && (
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "1.25rem",
              padding: "24px",
              border: "1px solid #e2e8f0",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "1rem",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileCheck className="w-7 h-7" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                  Đơn hàng đã được xác nhận thành công
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Hệ thống MINI-SHOP đã nhận đơn hàng và đang chuyển thông tin tới trung tâm phân loại kho.
                </div>
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  background: "#ffffff",
                  borderRadius: "0.75rem",
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                <QrCode className="w-4 h-4 text-emerald-600" /> Tem xác nhận điện tử
              </div>
            </div>
          </div>
        )}

        {activeStage === "processing" && (
          <div
            style={{
              background: "linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%)",
              borderRadius: "1.25rem",
              padding: "24px",
              border: "1px solid #fde68a",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "1rem",
                  background: "#fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box className="w-7 h-7" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#78350f", marginBottom: "4px" }}>
                  Đang đóng gói và kiểm định chất lượng tại kho
                </div>
                <div style={{ fontSize: "13px", color: "#92400e" }}>
                  Nhân viên kho đang kiểm tra từng sản phẩm, bọc bọt khí niêm phong cẩn thận trước khi bàn giao cho đơn vị vận chuyển.
                </div>
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  background: "#ffffff",
                  borderRadius: "0.75rem",
                  border: "1px solid #fde68a",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#b45309",
                }}
              >
                ✓ Đã dán tem niêm phong chống giả
              </div>
            </div>
          </div>
        )}

        {activeStage === "shipping" && (
          <div style={{ marginBottom: "20px" }}>
            {/* Real-Life GPS Interactive Map Simulation Canvas */}
            <div
              style={{
                position: "relative",
                height: "260px",
                borderRadius: "1.25rem",
                overflow: "hidden",
                border: "1px solid #cbd5e1",
                background: "#0f172a",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
              }}
            >
              {/* Map Grid Pattern Graphic */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
                  backgroundSize: "24px 24px",
                  opacity: 0.6,
                }}
              />

              {/* Simulated Street Route Line */}
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              >
                <path
                  d="M 40 200 Q 150 80 300 160 T 550 80"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 40 200 Q 150 80 300 160 T 550 80"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="10 6"
                />
              </svg>

              {/* Warehouse Pin */}
              <div
                style={{
                  position: "absolute",
                  left: "30px",
                  top: "180px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(15, 23, 42, 0.85)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "1px solid #475569",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <Package className="w-3.5 h-3.5 text-amber-400" /> Kho MINI-SHOP
              </div>

              {/* Recipient House Pin */}
              <div
                style={{
                  position: "absolute",
                  right: "30px",
                  top: "65px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(15, 23, 42, 0.85)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "1px solid #475569",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Đã tới gần địa chỉ nhận
              </div>

              {/* Moving Driver GPS Icon */}
              <div
                style={{
                  position: "absolute",
                  left: `${gpsProgress}%`,
                  top: "42%",
                  transform: "translate(-50%, -50%)",
                  transition: "left 0.8s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)",
                    border: "2px solid #ffffff",
                  }}
                >
                  <Truck className="w-6 h-6 animate-pulse" />
                </div>
                <div
                  style={{
                    background: "#22c55e",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    marginTop: "4px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  Shipper đang di chuyển ({Math.round(gpsProgress)}%)
                </div>
              </div>
            </div>

            {/* Real-Life Driver Info Card */}
            <div
              style={{
                marginTop: "16px",
                background: "#f8fafc",
                borderRadius: "1rem",
                padding: "16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#dcfce7",
                    color: "#15803d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "18px",
                  }}
                >
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                    Tài xế: Nguyễn Văn Hùng (Chuyên trách MINI-SHOP)
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Biển số: <strong style={{ color: "#0f172a" }}>29-X1 888.88</strong> • Dự kiến giao trong <strong style={{ color: "#16a34a" }}>15-20 phút</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href="tel:0908123456"
                  style={{
                    padding: "8px 14px",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 800,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Phone className="w-3.5 h-3.5" /> Gọi Shipper
                </a>
                <button
                  onClick={() => alert("Đang kết nối tin nhắn với tài xế...")}
                  style={{
                    padding: "8px 14px",
                    background: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Nhắn tin
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStage === "completed" && (
          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              borderRadius: "1.25rem",
              padding: "24px",
              border: "1px solid #bbf7d0",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "1rem",
                  background: "#22c55e",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(34, 197, 94, 0.3)",
                }}
              >
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#14532d", marginBottom: "4px" }}>
                  Đơn hàng đã giao thành công và hoàn tất
                </div>
                <div style={{ fontSize: "13px", color: "#166534" }}>
                  Khách hàng đã nhận hàng và ký xác nhận điện tử. Cảm ơn bạn đã tin tưởng mua sắm tại MINI-SHOP!
                </div>
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  background: "#ffffff",
                  borderRadius: "0.75rem",
                  border: "1px solid #86efac",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#15803d",
                }}
              >
                ✓ Đã lưu biên bản giao nhận
              </div>
            </div>
          </div>
        )}

        {/* 4 Stage Selector Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
            paddingTop: "8px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {[
            { key: "pending", label: "1. Xác Nhận Đơn", icon: <Check className="w-3.5 h-3.5" /> },
            { key: "processing", label: "2. Kiểm Đóng Gói Kho", icon: <Box className="w-3.5 h-3.5" /> },
            { key: "shipping", label: "3. Định Vị GPS Shipper", icon: <Truck className="w-3.5 h-3.5" /> },
            { key: "completed", label: "4. Giao Thành Công", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          ].map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setActiveStage(st.key)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                background: activeStage === st.key ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                color: activeStage === st.key ? "#ffffff" : "#475569",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              {st.icon} {st.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
