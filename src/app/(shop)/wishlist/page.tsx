"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/product-list.css";
import "@/styles/cart.css";
import { PRODUCTS_DATA } from "@/data/products";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { ShoppingCart, Heart, Flame, ArrowRight, ChevronRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProductsFromSupabase();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const sourceProducts = products.length > 0 ? products : PRODUCTS_DATA;
  const wishlistProducts = sourceProducts.filter((p) =>
    wishlistIds.includes(p.id)
  );

  const handleRemoveWishlist = (id: number) => {
    toggleWishlist(id);
  };

  const handleMoveAllToCart = () => {
    if (wishlistProducts.length === 0) return;
    wishlistProducts.forEach((p) => {
      addToCart(p, 1);
    });
    setToastMsg(`Đã chuyển toàn bộ ${wishlistProducts.length} sản phẩm yêu thích vào giỏ hàng thành công!`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        padding: "40px 16px 80px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {toastMsg && (
          <div
            style={{
              padding: "12px 18px",
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              borderRadius: "1rem",
              fontSize: "13px",
              fontWeight: 800,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(22, 101, 52, 0.08)",
            }}
          >
            {toastMsg}
          </div>
        )}

        {/* Header Title Section */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              <Heart className="w-3.5 h-3.5 fill-red-600" />
              <span>BỘ SƯU TẬP YÊU THÍCH</span>
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Sản phẩm yêu thích ({wishlistProducts.length})
            </h1>
          </div>

          {wishlistProducts.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              style={{
                padding: "10px 22px",
                background: "var(--primary-color, #2e7d32)",
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(46, 125, 50, 0.2)",
              }}
            >
              <ShoppingCart className="w-4 h-4" /> Chuyển tất cả vào giỏ hàng
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-color, #e2e8f0)",
              borderRadius: "1.75rem",
              padding: "64px 20px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Heart className="w-10 h-10 text-red-500 fill-red-500" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              Chưa có sản phẩm yêu thích nào!
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "480px", margin: "0 auto 24px" }}>
              Hãy bấm nút thả tim trên các sản phẩm bạn thích để lưu trữ tại đây nhé.
            </p>
            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary-color, #2e7d32)",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
              }}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Khám phá sản phẩm HOT ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Wishlist Grid Layout */
          <div
            className="catalog-grid"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}
          >
            {wishlistProducts.map((product) => (
              <div key={product.id} className="catalog-card" style={{ background: "#ffffff", borderRadius: "1.25rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ position: "relative", paddingTop: "100%", background: "#f8fafc" }}>
                  <img
                    src={fixImagePath(product.image)}
                    alt={product.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    className="btn-wishlist active"
                    onClick={() => handleRemoveWishlist(product.id)}
                    title="Bỏ yêu thích"
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                    }}
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </button>
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "6px", lineHeight: 1.4 }}>
                    {product.name}
                  </h3>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", marginBottom: "12px" }}>
                    {formatVND(product.price)}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "var(--primary-color, #2e7d32)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Thêm giỏ
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      style={{
                        padding: "8px 12px",
                        background: "#f1f5f9",
                        color: "#0f172a",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 800,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
