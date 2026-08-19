"use client";

import React from "react";
import { Sparkles, Leaf, ShieldCheck, Truck } from "lucide-react";
import { fixImagePath } from "@/lib/utils";

export const CatalogHeroBanner: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "1.75rem",
        overflow: "hidden",
        marginBottom: "28px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.08)",
        color: "#ffffff",
      }}
    >
      {/* Background Image with Ambient Gradient Layer */}
      <img
        src={fixImagePath("/assets/images/banner/banner-trang-chu-mini-shop.webp")}
        alt="Nội thất Bắc Âu MINI-SHOP"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.7) 60%, rgba(15, 23, 42, 0.4) 100%)",
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Top Tag Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#fef08a",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> NORDIC INTERIOR CATALOGUE 2026
          </span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 900,
            margin: 0,
            lineHeight: 1.3,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            maxWidth: "720px",
          }}
        >
          Khám Phá 50+ Tuyệt Tác Nội Thất & Decor Tối Giản
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            fontSize: "14.5px",
            color: "#cbd5e1",
            margin: 0,
            lineHeight: 1.6,
            maxWidth: "680px",
          }}
        >
          Kiến tạo không gian sống Bắc Âu ấm cúng, tinh tế với dòng sản phẩm chọn lọc từ chất liệu gỗ sồi tự nhiên, mây tre thủ công & gốm sứ men mờ cao cấp.
        </p>

        {/* 3 Trust Badges Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "12px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>100% Gỗ Tự Nhiên & Tre Đan</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Chất liệu xanh an toàn</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>Bảo Hành Chính Hãng 12 Tháng</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Đổi trả 1-1 trong 30 ngày</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.2)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                color: "#fbbf24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>Freeship & Lắp Đặt Tận Nhà</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Đơn hàng từ 500k toàn quốc</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
