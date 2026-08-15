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

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <Link href={`/products/${product.id}`}>
          <img src={fixImagePath(product.image)} alt={product.name} />
        </Link>
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
    </div>
  );
};
