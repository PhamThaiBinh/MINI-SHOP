"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatVND, fixImagePath } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "780px",
          background: "#ffffff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "#f1f5f9",
            border: "none",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            fontSize: "18px",
            cursor: "pointer",
            zIndex: 10,
            color: "#64748b",
          }}
        >
          &times;
        </button>

        {/* Product Image */}
        <div style={{ background: "#f8fafc", padding: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src={fixImagePath(product.image)}
            alt={product.name}
            style={{ width: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "12px" }}
          />
        </div>

        {/* Product Details */}
        <div style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--primary-color)", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>
              {product.categoryName || product.category}
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              {product.name}
            </h2>

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary-color)" }}>
                {formatVND(product.price)}
              </span>
              {product.oldPrice && (
                <span style={{ fontSize: "14px", color: "#94a3b8", textDecoration: "line-through" }}>
                  {formatVND(product.oldPrice)}
                </span>
              )}
            </div>

            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, marginBottom: "20px" }}>
              {product.description || "Sản phẩm nội thất gỗ tự nhiên phong cách Nordic hiện đại, đường nét tinh tế, độ bền cao và an toàn cho gia đình."}
            </p>

            <div style={{ fontSize: "12px", color: "#166534", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", fontWeight: 700, marginBottom: "20px" }}>
              ✅ Tình trạng: Còn hàng ({product.stock !== undefined ? product.stock : 15} sản phẩm trong kho)
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>Số lượng:</span>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ padding: "6px 12px", border: "none", background: "none", cursor: "pointer", fontWeight: 800 }}
                >
                  -
                </button>
                <span style={{ padding: "0 12px", fontSize: "14px", fontWeight: 800 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{ padding: "6px 12px", border: "none", background: "none", cursor: "pointer", fontWeight: 800 }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                onClick={handleAddToCart}
                style={{
                  padding: "12px",
                  background: added ? "#16a34a" : "var(--primary-color)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
              >
                {added ? "✔ Đã thêm!" : "🛒 Thêm vào giỏ"}
              </button>
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  border: "1px solid var(--border-color)",
                  color: "#0f172a",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                Xem chi tiết &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
