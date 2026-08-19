"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, CheckCircle2, ArrowRight } from "lucide-react";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";

interface InArticleProductCardProps {
  product: Product;
}

export const InArticleProductCard: React.FC<InArticleProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div
      style={{
        margin: "32px 0",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "1.5rem",
        padding: "20px 24px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <img
          src={fixImagePath(product.image)}
          alt={product.name}
          style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "1rem" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/assets/images/products/bo-binh-gom-minimal.webp";
          }}
        />
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
            Sản Phẩm Đề Xuất Trong Bài
          </span>
          <h4 style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>
            <Link href={`/products/${product.id}`} style={{ color: "inherit", textDecoration: "none" }}>
              {product.name}
            </Link>
          </h4>
          <div style={{ fontSize: "15px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
            {formatVND(product.price)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            padding: "10px 18px",
            borderRadius: "999px",
            background: added ? "#166534" : "var(--primary-color, #2e7d32)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
            whiteSpace: "nowrap",
          }}
        >
          {added ? <CheckCircle2 className="w-4 h-4 text-white" /> : <ShoppingCart className="w-4 h-4" />}
          {added ? "Đã Thêm!" : "+ Thêm Giỏ Hàng"}
        </button>

        <Link
          href={`/products/${product.id}`}
          style={{
            padding: "10px 16px",
            borderRadius: "999px",
            background: "#f1f5f9",
            color: "#0f172a",
            fontSize: "13px",
            fontWeight: 800,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
