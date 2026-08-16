"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

import { PRODUCTS_DATA } from "@/data/products";
import { formatVND, fixImagePath } from "@/lib/utils";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const matchingProducts = PRODUCTS_DATA.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoryName || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          {/* Brand Logo */}
          <Link href="/" className="brand-logo" id="header-logo">
            <svg viewBox="0 0 24 24">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
            </svg>
            <span>Mini Shop</span>
          </Link>

          {/* Nav Menu */}
          <nav>
            <ul className="nav-menu">
              <li>
                <Link
                  href="/"
                  className={`nav-link ${pathname === "/" ? "active" : ""}`}
                >
                  <span className="nav-two-lines">
                    <span>Trang</span>
                    <span>chủ</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className={`nav-link ${
                    pathname.startsWith("/products") ? "active" : ""
                  }`}
                >
                  <span className="nav-two-lines">
                    <span>Sản</span>
                    <span>phẩm</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className={`nav-link ${
                    pathname.startsWith("/blog") ? "active" : ""
                  }`}
                >
                  <span className="nav-two-lines">
                    <span>Bài</span>
                    <span>viết</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/flash-sale"
                  className={`nav-link ${
                    pathname === "/flash-sale" ? "active" : ""
                  }`}
                  style={{ color: "#ef4444", fontWeight: 800 }}
                >
                  <span className="nav-two-lines">
                    <span>⚡ Flash</span>
                    <span>Sale</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className={`nav-link ${
                    pathname === "/track-order" ? "active" : ""
                  }`}
                >
                  <span className="nav-two-lines">
                    <span>🔍 Tra cứu</span>
                    <span>đơn</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`nav-link ${
                    pathname === "/contact" ? "active" : ""
                  }`}
                >
                  <span className="nav-two-lines">
                    <span>Liên</span>
                    <span>hệ</span>
                  </span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Search Input with Autocomplete Dropdown */}
          <div className="header-search" style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              id="header-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = searchTerm.trim();
                  setShowSuggestions(false);
                  if (query) {
                    router.push(`/products?search=${encodeURIComponent(query)}`);
                  } else {
                    router.push("/products");
                  }
                }
              }}
            />
            <svg viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>

            {/* Suggestions Dropdown Popup */}
            {showSuggestions && searchTerm.trim().length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  background: "#ffffff",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  zIndex: 2000,
                  maxHeight: "320px",
                  overflowY: "auto",
                  padding: "8px 0",
                }}
              >
                {matchingProducts.length === 0 ? (
                  <div style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                    Không tìm thấy sản phẩm phù hợp.
                  </div>
                ) : (
                  matchingProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchTerm("");
                        router.push(`/products/${p.id}`);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 14px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      <img
                        src={fixImagePath(p.image)}
                        alt={p.name}
                        style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px" }}
                      />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--primary-color)" }}>
                          {formatVND(p.price)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            <Link
              href="/wishlist"
              className="btn-stacked btn-stacked-red"
              title="Danh sách Yêu thích"
            >
              <div className="btn-stacked-icon">
                <span className="icon-symbol">♥</span>
                <sup className="badge-superscript count-red">
                  {totalWishlistItems}
                </sup>
              </div>
            </Link>

            <Link
              href="/cart"
              className="btn-stacked btn-stacked-green"
              title="Giỏ hàng"
            >
              <div className="btn-stacked-icon">
                <span className="icon-symbol">🛒</span>
                <sup className="badge-superscript count-green">
                  {totalItems}
                </sup>
              </div>
            </Link>

            {/* User Auth Section */}
            {user ? (
              user.role === "admin" ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Link
                    href="/admin"
                    className="btn-stacked"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "#ffffff",
                      borderColor: "var(--primary-color)",
                      fontWeight: 700,
                      padding: "4px 10px",
                    }}
                  >
                    <span className="nav-two-lines">
                      <span>Chào,</span>
                      <span>Admin</span>
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Đăng xuất Admin"
                    style={{
                      background: "none",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "4px 6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      height: "36px",
                    }}
                  >
                    🚪
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Link
                    href="/auth"
                    className="btn-stacked"
                    style={{
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary-color)",
                      borderColor: "var(--primary-color)",
                      fontWeight: 700,
                      padding: "4px 10px",
                    }}
                  >
                    <span className="nav-two-lines">
                      <span>Chào,</span>
                      <span>{user.name}</span>
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    style={{
                      background: "none",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "4px 6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      height: "36px",
                    }}
                  >
                    🚪
                  </button>
                </div>
              )
            ) : (
              <>
                <Link
                  href="/auth"
                  className="btn-stacked"
                  style={{ color: "var(--text-main)", padding: "4px 8px" }}
                >
                  <span className="nav-two-lines">
                    <span>Đăng</span>
                    <span>nhập</span>
                  </span>
                </Link>

                <Link
                  href="/auth"
                  className="btn-stacked"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "#ffffff",
                    borderColor: "var(--primary-color)",
                    padding: "4px 10px",
                  }}
                >
                  <span className="nav-two-lines">
                    <span>Đăng</span>
                    <span>ký</span>
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
