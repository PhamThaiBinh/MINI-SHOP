"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = React.useState(false);

  return (
    <div className="product-card" style={{ position: "relative" }}>
      {product.badge && (
        <span
          className={`card-badge ${product.badgeType || ""}`}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 3,
            backgroundColor:
              product.badgeType === "badge-sale"
                ? "#dc2626"
                : product.badgeType === "badge-hot"
                ? "#ea580c"
                : "var(--primary-color)",
            color: "#ffffff",
            padding: "3px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 800,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          {product.badge}
        </span>
      )}
      <div className="product-img-wrapper" style={{ position: "relative" }}>
        <Link href={`/products/${product.id}`}>
          <img src={fixImagePath(product.image)} alt={product.name} loading="lazy" />
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowQuickView(true);
          }}
          title="Xem nhanh thông tin sản phẩm"
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "rgba(15, 23, 42, 0.75)",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "all 0.2s ease",
          }}
        >
          👁️ Xem nhanh
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-name">
          <Link
            href={`/products/${product.id}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {product.name}
          </Link>
        </h3>
        <div className="product-price">{formatVND(product.price)}</div>
        <p className="product-desc">{product.categoryName}</p>
        <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
          <button
            onClick={() => addToCart(product)}
            className="btn-card-action"
            style={{
              background: "var(--primary-color)",
              color: "#fff",
              border: "none",
              fontWeight: 700,
            }}
          >
            + Giỏ hàng
          </button>
          <Link href={`/products/${product.id}`} className="btn-card-action">
            Chi tiết &rarr;
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setShowQuickView(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowQuickView(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                border: "none",
                background: "#f1f5f9",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              ✕
            </button>
            <div style={{ display: "flex", gap: "16px" }}>
              <img
                src={fixImagePath(product.image)}
                alt={product.name}
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "var(--primary-color)",
                    background: "#e8f5e9",
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {product.categoryName}
                </span>
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "8px 0 4px", color: "#0f172a" }}>
                  {product.name}
                </h3>
                <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--primary-color)", marginBottom: "8px" }}>
                  {formatVND(product.price)}
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                  {product.description || "Sản phẩm chất lượng cao chuẩn Thương mại điện tử MINI-SHOP."}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  addToCart(product);
                  setShowQuickView(false);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "var(--primary-color)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                🛒 Thêm vào giỏ hàng
              </button>
              <Link
                href={`/products/${product.id}`}
                onClick={() => setShowQuickView(false)}
                style={{
                  padding: "10px 18px",
                  background: "#f8fafc",
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "13px",
                  textDecoration: "none",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                Xem chi tiết &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
