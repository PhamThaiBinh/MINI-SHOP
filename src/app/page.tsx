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
              <div className="hero-badges">
                <div className="badge-item">
                  <div className="badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  </div>
                  <div className="badge-text">
                    <strong>Giao hàng nhanh</strong>
                    <span>Toàn quốc</span>
                  </div>
                </div>
                <div className="badge-item">
                  <div className="badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  </div>
                  <div className="badge-text">
                    <strong>Bảo hành chính hãng</strong>
                    <span>7 ngày đổi trả</span>
                  </div>
                </div>
                <div className="badge-item">
                  <div className="badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                    </svg>
                  </div>
                  <div className="badge-text">
                    <strong>Hỗ trợ 24/7</strong>
                    <span>Tư vấn tận tâm</span>
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
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontWeight: 600 }}>
              Đang tải sản phẩm từ Supabase...
            </div>
          ) : (
            <div className="products-grid" id="home-featured-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

