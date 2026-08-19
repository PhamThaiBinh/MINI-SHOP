"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home as HomeIcon, Package, AlertCircle } from "lucide-react";

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
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        padding: "60px 16px 80px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "640px", width: "100%", margin: "0 auto" }}>
        
        {/* Double-Bezel Architecture Shell */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.03)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: "2rem",
            padding: "8px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "calc(2rem - 0.5rem)",
              padding: "48px 32px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: 900,
                color: "var(--primary-color, #2e7d32)",
                lineHeight: 1,
                marginBottom: "12px",
                letterSpacing: "-0.04em",
              }}
            >
              404
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", marginBottom: "10px" }}>
              Trang bạn tìm kiếm không tồn tại
            </h1>

            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
              Đường dẫn này có thể đã bị di chuyển hoặc thay đổi. Bạn có thể tìm kiếm sản phẩm bên dưới hoặc quay về trang chủ.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "28px",
                maxWidth: "440px",
                margin: "0 auto 28px",
              }}
            >
              <input
                type="text"
                placeholder="Nhập tên sản phẩm cần tìm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "999px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                }}
              >
                <Search className="w-4 h-4" /> Tìm kiếm
              </button>
            </form>

            {/* Island CTAs */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href="/"
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  color: "#0f172a",
                  borderRadius: "999px",
                  fontWeight: 800,
                  textDecoration: "none",
                  fontSize: "13px",
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
                  color: "var(--primary-color, #2e7d32)",
                  borderRadius: "999px",
                  fontWeight: 800,
                  textDecoration: "none",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Package className="w-4 h-4" /> Xem Sản Phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
