"use client";

import React from "react";
import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

export const ValuePropositionBar: React.FC = () => {
  const items = [
    {
      icon: <Truck className="w-6 h-6 text-emerald-700" />,
      title: "Giao Hàng & Lắp Đặt",
      desc: "Miễn phí toàn quốc cho đơn từ 1.5tr",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-700" />,
      title: "Bảo Hành 12 Tháng",
      desc: "Cam kết chất liệu tự nhiên 100%",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-700" />,
      title: "7 Ngày Đổi Trả",
      desc: "Đổi mới miễn phí khi gặp lỗi",
    },
    {
      icon: <Headphones className="w-6 h-6 text-emerald-700" />,
      title: "Tư Vấn Decor 24/7",
      desc: "Đội ngũ KTS hỗ trợ phối màu chu đáo",
    },
  ];

  return (
    <section style={{ marginBottom: "44px" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            background: "#ffffff",
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "1.25rem",
            padding: "20px 24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "8px 12px",
                borderRadius: "1rem",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#e8f5e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
