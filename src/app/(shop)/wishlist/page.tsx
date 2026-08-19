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
import { ShoppingCart, Heart, Flame, ArrowRight } from "lucide-react";

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
    <>
      {/* 3. Main Wishlist Content */}
      <main className="main-content" style={{ paddingTop: "24px" }}>
        <div className="container">
          {toastMsg && (
            <div
              style={{
                padding: "10px 16px",
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {toastMsg}
            </div>
          )}
          <div className="cart-page-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h1 className="cart-title-heading" style={{ margin: 0 }}>
                Sản phẩm yêu thích của bạn ({wishlistProducts.length})
              </h1>
              {wishlistProducts.length > 0 && (
                <button
                  onClick={handleMoveAllToCart}
                  style={{
                    padding: "10px 20px",
                    background: "var(--primary-color)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ShoppingCart className="w-4 h-4" /> Chuyển tất cả vào Giỏ hàng
                </button>
              )}
            </div>

            {/* Empty State */}
            {wishlistProducts.length === 0 ? (
              <div className="cart-empty-box" id="wishlist-empty-state">
                <div className="cart-empty-icon">
                  <Heart className="w-12 h-12 text-red-500 fill-red-500" />
                </div>
                <h2 className="cart-empty-title">
                  Chưa có sản phẩm yêu thích nào!
                </h2>
                <p className="cart-empty-desc">
                  Hãy bấm nút thả tim trên các sản phẩm bạn thích để lưu trữ
                  tại đây nhé.
                </p>
                <Link
                  href="/products"
                  className="btn-checkout"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    width: "auto",
                    padding: "12px 28px",
                  }}
                >
                  <Flame className="w-4 h-4 text-amber-400" /> Khám phá sản phẩm HOT ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* Wishlist Grid Layout */
              <div id="wishlist-main-layout">
                <div
                  className="catalog-grid"
                  id="wishlist-products-grid"
                  style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                >
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="catalog-card">
                      {product.badge && (
                        <span
                          className={`card-badge ${product.badgeType || ""}`}
                        >
                          {product.badge}
                        </span>
                      )}
                      <button
                        className="btn-wishlist active"
                        onClick={() => handleRemoveWishlist(product.id)}
                        title="Bỏ yêu thích"
                        style={{ color: "#ef4444", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </button>
                      <div className="catalog-img-wrapper">
                        <img
                          src={fixImagePath(product.image)}
                          alt={product.name}
                        />
                      </div>
                      <div className="catalog-card-body">
                        <h3 className="catalog-title">{product.name}</h3>
                        <div className="price-box">
                          <span className="price-current">
                            {formatVND(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="price-old">
                              {formatVND(product.oldPrice)}
                            </span>
                          )}
                        </div>
                        <span className="status-badge">Còn hàng</span>
                        <div
                          className="catalog-card-footer"
                          style={{ display: "flex", gap: "6px" }}
                        >
                          <button
                            onClick={() => addToCart(product)}
                            className="btn-add-cart-sm"
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              background: "var(--primary-color)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            + Giỏ hàng
                          </button>
                          <Link
                            href={`/products/${product.id}`}
                            className="btn-detail-link"
                          >
                            Chi tiết &rsaquo;
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            left: "auto",
            maxWidth: "calc(100vw - 32px)",
            boxSizing: "border-box",
            backgroundColor: "#1e293b",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            zIndex: 9999,
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderLeft: "4px solid #ef4444",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}
