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
import { ShoppingCart, Heart, Flame, ArrowRight, ChevronRight, CheckCircle2, Check } from "lucide-react";

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState("");
  const [addedId, setAddedId] = useState<number | null>(null);

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
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="container" style={{ padding: "30px 16px 60px" }}>
        
        {/* Toast Notification */}
        {toastMsg && (
          <div
            style={{
              padding: "12px 18px",
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              borderRadius: "1rem",
              fontSize: "13.5px",
              fontWeight: 800,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 14px rgba(22, 101, 52, 0.1)",
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 1. Header Directory Banner (Flush Left Aligned) */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#0f172a",
                margin: "0 0 6px",
                letterSpacing: "-0.02em",
              }}
            >
              Sản Phẩm Yêu Thích ({wishlistProducts.length})
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0, maxWidth: "600px" }}>
              Danh sách những mẫu nội thất gỗ sồi Bắc Âu & đồ gia dụng thông minh bạn đã lưu trữ để tham khảo.
            </p>
          </div>

          {wishlistProducts.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              style={{
                padding: "12px 24px",
                background: "var(--primary-color, #2e7d32)",
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                fontWeight: 900,
                fontSize: "13.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
                transition: "all 0.2s ease",
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Chuyển Tất Cả Vào Giỏ Hàng</span>
            </button>
          )}
        </div>

        {/* 2. Empty State Doppelrand Container */}
        {wishlistProducts.length === 0 ? (
          <div className="doppelrand-outer" style={{ maxWidth: "640px", margin: "40px auto 0" }}>
            <div className="doppelrand-inner" style={{ padding: "56px 28px", textAlign: "center" }}>
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
                  border: "1px solid #fecaca",
                }}
              >
                <Heart className="w-10 h-10 text-red-500 fill-red-500" />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "8px" }}>
                Danh Sách Yêu Thích Đang Trống!
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.5 }}>
                Hãy thả tim trên các mẫu nội thất bạn ưng ý khi tham khảo cửa hàng để lưu lại danh sách mua sắm sau nhé.
              </p>
              <Link
                href="/products"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  padding: "14px 32px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 900,
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
                }}
              >
                <Flame className="w-4.5 h-4.5 text-amber-300" />
                <span>Khám Phá Sản Phẩm HOT Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* 3. Wishlist Product Doppelrand Grid Layout */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {wishlistProducts.map((product) => (
              <div key={product.id} className="doppelrand-outer" style={{ height: "100%" }}>
                <div
                  className="doppelrand-inner"
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Image Area */}
                    <div
                      style={{
                        position: "relative",
                        paddingTop: "90%",
                        borderRadius: "1.25rem",
                        overflow: "hidden",
                        background: "#f8fafc",
                        marginBottom: "14px",
                      }}
                    >
                      <img
                        src={fixImagePath(product.image)}
                        alt={product.name}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      
                      {/* Category Pill Tag */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(6px)",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#334155",
                          border: "1px solid rgba(226, 232, 240, 0.8)",
                        }}
                      >
                        Nội thất Bắc Âu
                      </div>

                      {/* Remove Wishlist Button */}
                      <button
                        onClick={() => handleRemoveWishlist(product.id)}
                        title="Bỏ khỏi yêu thích"
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "#fef2f2",
                          border: "1.5px solid #fecaca",
                          borderRadius: "50%",
                          width: "34px",
                          height: "34px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      >
                        <Heart
                          style={{
                            width: "18px",
                            height: "18px",
                            color: "#ef4444",
                            fill: "#ef4444",
                          }}
                        />
                      </button>
                    </div>

                    {/* Content Info */}
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "8px",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "42px",
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* Price Display */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "17px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                        {formatVND(product.price)}
                      </span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "line-through", fontWeight: 700 }}>
                          {formatVND(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        setAddedId(product.id);
                        setToastMsg(`Đã thêm sản phẩm "${product.name}" vào giỏ hàng thành công!`);
                        setTimeout(() => {
                          setAddedId(null);
                          setToastMsg("");
                        }, 2500);
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        background: addedId === product.id ? "#166534" : "var(--primary-color, #2e7d32)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "999px",
                        fontSize: "12.5px",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {addedId === product.id ? (
                        <><Check className="w-3.5 h-3.5" /> Đã Thêm Giỏ Hàng!</>
                      ) : (
                        <><ShoppingCart className="w-3.5 h-3.5" /> + Thêm Giỏ Hàng</>
                      )}
                    </button>

                    <Link
                      href={`/products/${product.id}`}
                      style={{
                        padding: "10px 14px",
                        background: "#f1f5f9",
                        color: "#0f172a",
                        borderRadius: "999px",
                        fontSize: "12.5px",
                        fontWeight: 800,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2px",
                      }}
                    >
                      <span>Chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
