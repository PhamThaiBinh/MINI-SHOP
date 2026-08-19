"use client";

import React from "react";
import Link from "next/link";
import { fixImagePath } from "@/lib/utils";
import { ArrowRight, Compass } from "lucide-react";

export const BentoLookbook: React.FC = () => {
  return (
    <section style={{ marginBottom: "48px" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: "20px" }}>
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
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>EDITORIAL LOOKBOOK 2026</span>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Bộ Sưu Tập Không Gian Sống
          </h2>
        </div>

        {/* Bento Grid Container */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "20px",
          }}
        >
          {/* Main Hero Card (7 Cols) */}
          <div
            style={{
              gridColumn: "span 7",
              position: "relative",
              borderRadius: "1.75rem",
              overflow: "hidden",
              minHeight: "380px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
            className="bento-card"
          >
            <img
              src={fixImagePath("assets/images/banner/banner-trang-chu-mini-shop.webp")}
              alt="Bộ Sưu Tập Mây Tre Thủ Công"
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.1) 60%)",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                color: "#ffffff",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                THỦ CÔNG TRUYỀN THỐNG
              </span>
              <h3 style={{ fontSize: "24px", fontWeight: 900, margin: "6px 0 10px", lineHeight: 1.25 }}>
                Bộ Sưu Tập Mây Tre & Sơn Mài Tự Nhiên
              </h3>
              <p style={{ fontSize: "14px", opacity: 0.9, maxWidth: "440px", marginBottom: "20px", lineHeight: 1.5 }}>
                Tôn vinh vẻ đẹp bình dị của chất liệu tre đan Việt Nam kết hợp phong cách Bắc Âu Nordic đương đại.
              </p>
              <div>
                <Link
                  href="/products?category=Nhà%20bếp"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ffffff",
                    color: "#0f172a",
                    padding: "10px 22px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 800,
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  }}
                >
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sub-Cards Container (5 Cols) */}
          <div
            style={{
              gridColumn: "span 5",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Top Right Card */}
            <div
              style={{
                flex: 1,
                position: "relative",
                borderRadius: "1.5rem",
                overflow: "hidden",
                minHeight: "180px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src={fixImagePath("assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp")}
                alt="Sofa Nordic Hiện Đại"
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.05) 70%)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  color: "#ffffff",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 900, margin: 0 }}>
                  Sofa Nordic Ấm Cúng
                </h4>
                <Link
                  href="/products?category=Phòng%20khách"
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#67e8f9",
                    textDecoration: "none",
                    marginTop: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Xem bộ sưu tập &rsaquo;
                </Link>
              </div>
            </div>

            {/* Bottom Right Card */}
            <div
              style={{
                flex: 1,
                position: "relative",
                borderRadius: "1.5rem",
                overflow: "hidden",
                minHeight: "180px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src={fixImagePath("assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp")}
                alt="Chậu Cây Trồng Trong Nhà"
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.05) 70%)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  color: "#ffffff",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 900, margin: 0 }}>
                  Góc Xanh Decor Tổ Ấm
                </h4>
                <Link
                  href="/products?category=Trang%20trí"
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#86efac",
                    textDecoration: "none",
                    marginTop: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Xem cây & chậu decor &rsaquo;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
