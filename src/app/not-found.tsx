"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home as HomeIcon, Package } from "lucide-react";

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
    <main className="container" style={{ padding: "80px 15px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ fontSize: "72px", fontWeight: 900, color: "var(--primary-color)", lineHeight: 1, marginBottom: "12px" }}>
        404
      </div>
      <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
        Không tìm thấy trang yêu cầu
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "30px", lineHeight: 1.6 }}>
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển. Hãy thử tìm kiếm sản phẩm bên dưới hoặc quay về trang chủ.
      </p>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "30px", maxWidth: "420px", margin: "0 auto 30px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Nhập tên sản phẩm bạn muốn tìm..."
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Search className="w-4 h-4" /> Tìm kiếm
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <HomeIcon className="w-4 h-4" /> Quay Về Trang Chủ
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Package className="w-4 h-4" /> Xem Tất Cả Sản Phẩm
        </Link>
      </div>
    </main>
  );
}
