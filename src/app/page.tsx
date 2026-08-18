"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/home.css";
import { ProductCard } from "@/components/shop/ProductCard";
import { fixImagePath } from "@/lib/utils";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProductsFromSupabase();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const categories = [
    {
      id: "All",
      label: "Tất cả",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
        </svg>
      ),
    },
    {
      id: "Living Room",
      label: "Phòng khách",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M20 10V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5h1.33L4 19h1l.67-2h12.67l.67 2h1l.67-2H22v-5c0-1.1-.9-2-2-2zm-9 0H6V7h5v3zm7 0h-5V7h5v3z" />
        </svg>
      ),
    },
    {
      id: "Bedroom",
      label: "Phòng ngủ",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ),
    },
    {
      id: "Kitchen",
      label: "Nhà bếp",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.55 3.89 3.54 4.24V22h2.92v-8.76C11.45 12.89 13 11.12 13 9V2h-2v7zm5-3v6h2.5v10H21V2c-2.76 0-5 2.24-5 4z" />
        </svg>
      ),
    },
    {
      id: "Lighting",
      label: "Đèn",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
        </svg>
      ),
    },
    {
      id: "Decor",
      label: "Trang trí",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        </svg>
      ),
    },
    {
      id: "Storage",
      label: "Lưu trữ",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
      ),
    },
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      {/* 2. Hero Banner Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-banner">
            <div className="hero-content">
              <h1 className="hero-title">Sống đẹp mỗi ngày cùng Mini Shop</h1>
              <p className="hero-subtitle">Sản phẩm chất lượng cho tổ ấm của bạn.</p>
              <Link href="/products" className="btn-hero-cta" id="hero-cta-btn">
                Mua sắm ngay
              </Link>

              {/* Trust Badges */}
              <div className="hero-badges" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
                <div className="badge-item" style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="badge-icon" style={{ fontSize: "20px" }}>🪵</div>
                  <div className="badge-text" style={{ fontSize: "12px" }}>
                    <strong style={{ display: "block", color: "#0f172a" }}>100% Gỗ Tự Nhiên</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Cam kết chất lượng</span>
                  </div>
                </div>
                <div className="badge-item" style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="badge-icon" style={{ fontSize: "20px" }}>🚚</div>
                  <div className="badge-text" style={{ fontSize: "12px" }}>
                    <strong style={{ display: "block", color: "#0f172a" }}>Freeship Đơn 500K</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Giao hàng toàn quốc</span>
                  </div>
                </div>
                <div className="badge-item" style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="badge-icon" style={{ fontSize: "20px" }}>🛡️</div>
                  <div className="badge-text" style={{ fontSize: "12px" }}>
                    <strong style={{ display: "block", color: "#0f172a" }}>Bảo Hành 2 Năm</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Bảo trì trọn đời</span>
                  </div>
                </div>
                <div className="badge-item" style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="badge-icon" style={{ fontSize: "20px" }}>🔄</div>
                  <div className="badge-text" style={{ fontSize: "12px" }}>
                    <strong style={{ display: "block", color: "#0f172a" }}>Đổi Trả 30 Ngày</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Thủ tục nhanh gọn</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-image-wrapper">
              <img
                src={fixImagePath("assets/images/banner/banner-trang-chu-mini-shop.webp")}
                alt="Sống đẹp mỗi ngày cùng Mini Shop"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Pill Bar / Filter */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Products Grid Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
            <Link href="/products" className="view-all-link">
              Xem tất cả &rarr;
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontSize: "14px", color: "var(--text-muted)", fontWeight: 700 }}>
              Đang tải danh sách sản phẩm...
            </div>
          ) : (
            <div className="products-grid" id="home-featured-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} hideQuickView={true} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

