"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatVND, fixImagePath } from "@/lib/utils";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";

interface InstantSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstantSearchModal({ isOpen, onClose }: InstantSearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProductsFromSupabase().then(setProducts);
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.categoryName?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
    } else if (e.key === "Enter" && filteredProducts[selectedIndex]) {
      e.preventDefault();
      window.location.href = `/products/${filteredProducts[selectedIndex].id}`;
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "80px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid var(--border-color)",
          margin: "0 16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px" }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm sofa, bàn ăn, đèn trang trí... (Dùng phím ↑ ↓ Enter)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#0f172a",
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "12px" }}>
          {query.trim() === "" ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              💡 Nhập tên sản phẩm hoặc loại hàng để tìm kiếm nhanh sản phẩm tại MINI-SHOP
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
              ❌ Không tìm thấy sản phẩm phù hợp với <strong>"{query}"</strong>
            </div>
          ) : (
            filteredProducts.map((p, idx) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  backgroundColor: idx === selectedIndex ? "#f0fdf4" : "transparent",
                  border: idx === selectedIndex ? "1px solid #bbf7d0" : "1px solid transparent",
                  transition: "all 0.15s ease",
                  marginBottom: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={fixImagePath(p.image)}
                    alt={p.name}
                    style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.categoryName}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary-color)" }}>
                    {formatVND(p.price)}
                  </div>
                  {p.oldPrice && (
                    <div style={{ fontSize: "11px", color: "#94a3b8", textDecoration: "line-through" }}>
                      {formatVND(p.oldPrice)}
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
