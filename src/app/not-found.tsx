"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <main className="container" style={{ padding: "60px 15px", textAlign: "center", maxWidth: "600px" }}>
      <div style={{ fontSize: "72px", fontWeight: 900, color: "var(--primary-color)", lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "16px 0 8px", color: "#0f172a" }}>
        Không Tìm Thấy Trang Bạn Yêu Cầu!
      </h1>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.6 }}>
        Trang web bạn đang cố cập nhật có thể đã bị đổi tên, tạm thời ẩn hoặc không còn tồn tại. Đừng lo lắng, hãy gõ từ khóa tìm sản phẩm bên dưới:
      </p>

      {/* Inline Product Search Bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Nhập tên sản phẩm cần tìm (VD: Sofa, Bàn làm việc...)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            background: "var(--primary-color)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          🔍 Tìm kiếm
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <Link
          href="/"
          style={{
            padding: "10px 20px",
            background: "#f1f5f9",
            color: "#0f172a",
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          🏠 Quay Về Trang Chủ
        </Link>
        <Link
          href="/products"
          style={{
            padding: "10px 20px",
            background: "#e8f5e9",
            color: "var(--primary-color)",
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          📦 Xem Tất Cả Sản Phẩm
        </Link>
      </div>
    </main>
  );
}
