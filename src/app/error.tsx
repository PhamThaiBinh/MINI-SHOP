"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "32px 16px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "16px",
          padding: "36px 28px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <AlertTriangle className="w-12 h-12 text-amber-500" />
        </div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#991b1b",
            marginBottom: "12px",
          }}
        >
          Đã Xảy Ra Lỗi Hệ Thống
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#7f1d1d",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          Hệ thống vừa gặp phải sự cố không mong muốn. Bạn vui lòng bấm nút thử lại hoặc quay về Trang Chủ.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              backgroundColor: "var(--primary-color, #2e7d32)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RotateCcw className="w-4 h-4" /> Thử Lại
          </button>

          <Link
            href="/"
            style={{
              padding: "10px 20px",
              backgroundColor: "#ffffff",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Home className="w-4 h-4" /> Về Trang Chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
