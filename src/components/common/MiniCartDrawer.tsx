"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatVND, fixImagePath } from "@/lib/utils";

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShipThreshold = 500000;
  const remainingForFreeship = Math.max(0, freeShipThreshold - subtotal);
  const freeshipProgress = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.15)",
          animation: "slideLeft 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            🛒 Giỏ Hàng Mua Sắm ({cart.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            &times;
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div style={{ padding: "12px 20px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#166534", marginBottom: "6px" }}>
            {remainingForFreeship > 0 ? (
              <>🚚 Mua thêm <strong>{formatVND(remainingForFreeship)}</strong> để nhận MIỄN PHÍ VẬN CHUYỂN!</>
            ) : (
              <>🎉 Chúc mừng! Đơn hàng của bạn đã đủ điều kiện <strong>MIỄN PHÍ VẬN CHUYỂN!</strong></>
            )}
          </div>
          <div style={{ background: "#dcfce7", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ background: "var(--primary-color)", height: "100%", width: `${freeshipProgress}%`, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {cart.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛒</div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 600 }}>
                Giỏ hàng của bạn đang trống!
              </p>
              <Link
                href="/products"
                onClick={onClose}
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  padding: "10px 20px",
                  background: "var(--primary-color)",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                Khám phá sản phẩm ngay &rarr;
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <img
                  src={fixImagePath(item.product.image)}
                  alt={item.product.name}
                  style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary-color)", marginBottom: "8px" }}>
                    {formatVND(item.product.price)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        style={{ border: "none", background: "none", padding: "2px 8px", cursor: "pointer", fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ padding: "0 8px", fontSize: "12px", fontWeight: 700 }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        style={{ border: "none", background: "none", padding: "2px 8px", cursor: "pointer", fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ border: "none", background: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "20px", borderTop: "1px solid var(--border-color)", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 800, marginBottom: "16px" }}>
              <span>Tạm tính:</span>
              <span style={{ color: "var(--primary-color)" }}>{formatVND(subtotal)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Link
                href="/cart"
                onClick={onClose}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  border: "1px solid var(--primary-color)",
                  color: "var(--primary-color)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                Xem giỏ hàng
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  background: "var(--primary-color)",
                  color: "#ffffff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                Thanh toán ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
