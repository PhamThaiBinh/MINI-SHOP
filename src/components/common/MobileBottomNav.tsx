"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="mobile-bottom-nav">
      <Link href="/" className={`mobile-nav-item ${pathname === "/" ? "active" : ""}`}>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Trang chủ</span>
      </Link>

      <Link href="/products" className={`mobile-nav-item ${pathname === "/products" ? "active" : ""}`}>
        <span className="nav-icon">🛋️</span>
        <span className="nav-label">Sản phẩm</span>
      </Link>

      <Link href="/cart" className={`mobile-nav-item ${pathname === "/cart" ? "active" : ""}`}>
        <div style={{ position: "relative" }}>
          <span className="nav-icon">🛒</span>
          {totalCartQty > 0 && <span className="cart-badge-dot">{totalCartQty}</span>}
        </div>
        <span className="nav-label">Giỏ hàng</span>
      </Link>

      <Link href="/wishlist" className={`mobile-nav-item ${pathname === "/wishlist" ? "active" : ""}`}>
        <span className="nav-icon">❤️</span>
        <span className="nav-label">Yêu thích</span>
      </Link>

      <Link href="/auth" className={`mobile-nav-item ${pathname === "/auth" ? "active" : ""}`}>
        <span className="nav-icon">👤</span>
        <span className="nav-label">Tài khoản</span>
      </Link>
    </div>
  );
}
