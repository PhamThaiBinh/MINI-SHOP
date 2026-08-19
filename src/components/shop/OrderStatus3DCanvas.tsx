"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  FileText,
  RefreshCw,
  Box,
  Truck,
  ClipboardCheck,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  ShieldCheck,
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

  useEffect(() => {
    setActiveStage(status);
  }, [status]);

  // Stage Index Mapping (0 to 4)
  const getStageIndex = (st: string) => {
    switch (st) {
      case "pending":
        return 0; // Đặt hàng
      case "processing":
        return 1; // Đang xử lý
      case "ready":
        return 2; // Sẵn sàng giao
      case "shipping":
        return 3; // Đang giao
      case "completed":
        return 4; // Giao thành công
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(activeStage);

  // 5 Horizontal Stepper Nodes Config (Exact Reference Image 2)
  const stepperSteps = [
    { key: "pending", title: "Đặt hàng", time: "18:09 12/12/2025", icon: <FileText className="w-5 h-5" /> },
    { key: "processing", title: "Đang xử lý", time: "15:07 15/12/2025", icon: <RefreshCw className="w-5 h-5" /> },
    { key: "ready", title: "Sẵn sàng giao", time: "16:36 15/12/2025", icon: <Box className="w-5 h-5" /> },
    { key: "shipping", title: "Đang giao", time: "17:00 15/12/2025", icon: <Truck className="w-5 h-5" /> },
    { key: "completed", title: "Giao thành công", time: "08:57 20/12/2025", icon: <ClipboardCheck className="w-5 h-5" /> },
  ];

  // Vertical Detailed Log History Timeline Data (Exact Reference Image 1)
  const logEntries = [
    {
      id: 1,
      date: "5 Thg 8",
      time: "10:41",
      title: "Giao hàng thành công",
      desc: "Đơn hàng đã được giao thành công tới người nhận. Cảm ơn bạn đã mua sắm tại MINI-SHOP!",
      stageIdx: 4,
      isLatest: currentIndex === 4,
    },
    {
      id: 2,
      date: "5 Thg 8",
      time: "08:04",
      title: "Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại",
      desc: "Tài xế Nguyễn Văn Hùng (29-X1 888.88) đang trên đường giao hàng tới địa chỉ của bạn.",
      stageIdx: 3,
      isLatest: currentIndex === 3,
    },
    {
      id: 3,
      date: "5 Thg 8",
      time: "06:43",
      title: "Đơn hàng đã đến trạm giao hàng tại khu vực của bạn",
      desc: "Bưu cục chia chọn khu vực đã tiếp nhận đơn hàng và xếp lịch giao trong ngày.",
      stageIdx: 3,
      isLatest: false,
    },
    {
      id: 4,
      date: "4 Thg 8",
      time: "22:47",
      title: "Đơn hàng đã đến kho trung chuyển chính",
      desc: "Kiện hàng đã cập bến kho phân loại tổng MINI-SHOP.",
      stageIdx: 2,
      isLatest: currentIndex === 2,
    },
    {
      id: 5,
      date: "4 Thg 8",
      time: "18:38",
      title: "Đơn hàng đã bàn giao cho đơn vị vận chuyển",
      desc: "Nhân viên kho đã dán tem niêm phong và bàn giao cho tài xế thu gom.",
      stageIdx: 2,
      isLatest: false,
    },
    {
      id: 6,
      date: "3 Thg 8",
      time: "21:00",
      title: "Người bán đang chuẩn bị hàng",
      desc: "Sản phẩm đang được kiểm định chất lượng, đóng bọt khí chống va đập.",
      stageIdx: 1,
      isLatest: currentIndex === 1,
    },
    {
      id: 7,
      date: "31 Thg 7",
      time: "23:57",
      title: "Đơn hàng đã được đặt thành công",
      desc: "Hệ thống ghi nhận đơn hàng #MS-9824 và xác nhận thanh toán.",
      stageIdx: 0,
      isLatest: currentIndex === 0,
    },
  ];

  // Filter logs according to active stage depth
  const visibleLogs = logEntries.filter((log) => log.stageIdx <= currentIndex);

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
          padding: "28px 24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
        }}
      >
        {/* Header Title Badge */}
        <div style={{ marginBottom: "24px" }}>
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
            <Truck className="w-3.5 h-3.5" />
            <span>HÀNH TRÌNH VẬN CHUYỂN CHUẨN THƯƠNG MẠI ĐIỆN TỬ</span>
          </div>

          <h3
            style={{
              fontSize: "20px",
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Trạng Thái Đơn Hàng {orderId}
          </h3>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 1: HORIZONTAL 5-STAGE STEPPER BAR (EXACT REFERENCE IMAGE 2) */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "1.25rem",
            padding: "24px 16px",
            border: "1px solid #e2e8f0",
            marginBottom: "32px",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              position: "relative",
              minWidth: "600px",
            }}
          >
            {/* Horizontal Connecting Line Behind Circles */}
            <div
              style={{
                position: "absolute",
                top: "26px",
                left: "40px",
                right: "40px",
                height: "4px",
                background: "#e2e8f0",
                zIndex: 0,
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--primary-color, #2e7d32)",
                  width: `${(currentIndex / 4) * 100}%`,
                  transition: "width 0.4s ease-in-out",
                }}
              />
            </div>

            {/* Stepper Nodes */}
            {stepperSteps.map((step, idx) => {
              const isActive = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={step.key}
                  onClick={() => setActiveStage(step.key)}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  {/* Circle Node Icon */}
                  <div
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius: "50%",
                      background: isActive ? "#ffffff" : "#ffffff",
                      border: isActive
                        ? "3px solid var(--primary-color, #2e7d32)"
                        : "3px solid #cbd5e1",
                      color: isActive ? "var(--primary-color, #2e7d32)" : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "10px",
                      boxShadow: isCurrent
                        ? "0 0 0 4px rgba(46, 125, 50, 0.15), 0 4px 12px rgba(46, 125, 50, 0.2)"
                        : "0 2px 6px rgba(0,0,0,0.04)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {step.icon}
                  </div>

                  {/* Title & Time */}
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: isActive ? 900 : 700,
                      color: isActive ? "var(--primary-color, #2e7d32)" : "#64748b",
                      marginBottom: "3px",
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    {step.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 2: VERTICAL DETAILED LOG HISTORY TIMELINE (EXACT REFERENCE IMAGE 1) */}
        {/* ------------------------------------------------------------------ */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "8px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>
              Lịch Sử Chi Tiết Diễn Tiến Đơn Hàng
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Hiển thị ({visibleLogs.length} cập nhật mới nhất)
            </div>
          </div>

          <div style={{ position: "relative", paddingLeft: "10px" }}>
            {visibleLogs.map((log, index) => {
              const isTop = index === 0;

              return (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "20px",
                    position: "relative",
                  }}
                >
                  {/* Left Column: Date & Time */}
                  <div
                    style={{
                      width: "80px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: isTop ? 900 : 700,
                        color: isTop ? "var(--primary-color, #2e7d32)" : "#94a3b8",
                      }}
                    >
                      {log.date}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#cbd5e1",
                        fontWeight: 600,
                      }}
                    >
                      {log.time}
                    </div>
                  </div>

                  {/* Center Vertical Stem Line & Circular Bullet Node */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {/* Circle Bullet Node */}
                    <div
                      style={{
                        width: isTop ? "12px" : "8px",
                        height: isTop ? "12px" : "8px",
                        borderRadius: "50%",
                        background: isTop ? "var(--primary-color, #2e7d32)" : "#cbd5e1",
                        boxShadow: isTop ? "0 0 0 3px rgba(46, 125, 50, 0.2)" : "none",
                        marginTop: "4px",
                        zIndex: 1,
                      }}
                    />

                    {/* Vertical Line Connector */}
                    {index < visibleLogs.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "14px",
                          bottom: "-24px",
                          width: "2px",
                          background: "#e2e8f0",
                          zIndex: 0,
                        }}
                      />
                    )}
                  </div>

                  {/* Right Column: Log Content */}
                  <div style={{ flex: 1, paddingTop: "0px" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: isTop ? 900 : 700,
                        color: isTop ? "var(--primary-color, #2e7d32)" : "#475569",
                        marginBottom: "3px",
                        lineHeight: 1.4,
                      }}
                    >
                      {log.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        lineHeight: 1.5,
                      }}
                    >
                      {log.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
