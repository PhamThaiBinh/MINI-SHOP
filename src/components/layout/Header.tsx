"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { PRODUCTS_DATA } from "@/data/products";
import { formatVND, fixImagePath } from "@/lib/utils";
import { Zap, Search, ShoppingCart, Heart, LogOut, Menu, X, ArrowRight, User } from "lucide-react";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const matchingProducts = PRODUCTS_DATA.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoryName || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Bài viết", href: "/blog" },
    { label: "⚡ Flash Sale", href: "/flash-sale", isSpecial: true },
    { label: "Tra cứu đơn", href: "/track-order" },
    { label: "Liên hệ", href: "/contact" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            zIndex: 998,
            cursor: "pointer",
          }}
        />
      )}

      {/* Floating Doppelrand Header Bar */}
      <header
        style={{
          position: "sticky",
          top: "16px",
          zIndex: 999,
          padding: "0 16px",
          marginBottom: "24px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "999px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(0, 0, 0, 0.05)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            transition: "all 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {/* 1. Brand Logo */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--primary-color, #2e7d32)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
              </svg>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
              MINI SHOP
            </span>
          </Link>

          {/* 2. Desktop Navigation Menu */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: "4px" }}>
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 900 : 700,
                    color: item.isSpecial
                      ? "#dc2626"
                      : isActive
                      ? "#0f172a"
                      : "#64748b",
                    background: isActive ? "#f1f5f9" : "transparent",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Header Right Actions & Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            
            {/* Search Input with Autocomplete */}
            <div style={{ position: "relative" }} className="hidden sm:block">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "999px",
                  padding: "4px 14px",
                  width: "220px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (matchingProducts.length > 0) {
                        setSelectedIndex((prev) => (prev < matchingProducts.length - 1 ? prev + 1 : 0));
                      }
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (matchingProducts.length > 0) {
                        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingProducts.length - 1));
                      }
                    } else if (e.key === "Enter") {
                      if (selectedIndex >= 0 && selectedIndex < matchingProducts.length) {
                        const selectedProd = matchingProducts[selectedIndex];
                        setShowSuggestions(false);
                        setSearchTerm("");
                        setSelectedIndex(-1);
                        router.push(`/products/${selectedProd.id}`);
                      } else {
                        const query = searchTerm.trim();
                        setShowSuggestions(false);
                        if (query) {
                          router.push(`/products?search=${encodeURIComponent(query)}`);
                        } else {
                          router.push("/products");
                        }
                      }
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                      setSelectedIndex(-1);
                    }
                  }}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    padding: "6px 8px",
                    fontSize: "13px",
                    width: "100%",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Suggestions Popup */}
              {showSuggestions && searchTerm.trim().length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "300px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "1.25rem",
                    boxShadow: "0 12px 36px rgba(15, 23, 42, 0.15)",
                    zIndex: 2000,
                    maxHeight: "320px",
                    overflowY: "auto",
                    padding: "8px",
                  }}
                >
                  {matchingProducts.length === 0 ? (
                    <div style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
                      Không tìm thấy sản phẩm phù hợp.
                    </div>
                  ) : (
                    matchingProducts.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchTerm("");
                          setSelectedIndex(-1);
                          router.push(`/products/${p.id}`);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          borderRadius: "0.75rem",
                          cursor: "pointer",
                          transition: "background 0.2s ease",
                          background: idx === selectedIndex ? "#f1f5f9" : "#ffffff",
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <img
                          src={fixImagePath(p.image)}
                          alt={p.name}
                          style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }}
                        />
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                            {formatVND(p.price)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Pill */}
            <Link
              href="/wishlist"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                textDecoration: "none",
                transition: "transform 0.2s ease",
              }}
              title="Danh sách Yêu thích"
            >
              <Heart className="w-4.5 h-4.5 text-rose-500" />
              {totalWishlistItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 900,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Pill */}
            <Link
              href="/cart"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--primary-color, #2e7d32)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                transition: "transform 0.2s ease",
              }}
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 900,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Pill Button */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link
                  href={user.role === "admin" ? "/admin" : "/auth"}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#0f172a",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>{user.role === "admin" ? "Admin" : user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <LogOut className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 900,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Đăng Nhập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: "16px",
              right: "16px",
              background: "#ffffff",
              borderRadius: "1.5rem",
              border: "1px solid #cbd5e1",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "0.75rem",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: item.isSpecial ? "#ef4444" : "#0f172a",
                    background: "#f8fafc",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
