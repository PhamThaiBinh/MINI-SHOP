"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
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
    <div className="in-article-product-box">
      {/* Top Tag */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#15803d",
            background: "#dcfce7",
            padding: "4px 10px",
            borderRadius: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          Sản phẩm đề xuất trong bài viết
        </span>
      </div>

      {/* Main Content Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Image & Details */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 280px", minWidth: "240px" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "1rem",
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid #f1f5f9",
              background: "#f8fafc",
            }}
          >
            <img
              src={fixImagePath(product.image)}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/images/products/bo-binh-gom-minimal.webp";
              }}
            />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: 900,
                color: "#0f172a",
                margin: "0 0 6px 0",
                lineHeight: "1.35",
              }}
            >
              <Link
                href={`/products/${product.id}`}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                {product.name}
              </Link>
            </h4>
            <div
              style={{
                fontSize: "17px",
                fontWeight: 900,
                color: "var(--primary-color, #2e7d32)",
                letterSpacing: "-0.01em",
              }}
            >
              {formatVND(product.price)}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              background: added ? "#166534" : "var(--primary-color, #2e7d32)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {added ? <CheckCircle2 className="w-4 h-4 text-white" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? "Đã Thêm Vào Giỏ!" : "+ Thêm Giỏ Hàng"}
          </button>

          <Link
            href={`/products/${product.id}`}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              background: "#f1f5f9",
              color: "#1e293b",
              fontSize: "13px",
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            Xem chi tiết <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
