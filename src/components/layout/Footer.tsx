"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronUp } from "@/components/common/Icons";
import { getStoreSettings, StoreSettings } from "@/lib/storeSettings";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const [emailInput, setEmailInput] = useState("");
  const [subscribeMsg, setSubscribeMsg] = useState("");
  const [storeInfo, setStoreInfo] = useState<StoreSettings>(getStoreSettings());

  useEffect(() => {
    setStoreInfo(getStoreSettings());
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setStoreInfo(e.detail);
      } else {
        setStoreInfo(getStoreSettings());
      }
    };
    window.addEventListener("minishop_store_settings_updated", handleUpdate);
    return () => window.removeEventListener("minishop_store_settings_updated", handleUpdate);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info & Social Icons */}
          <div className="footer-brand">
            <Link href="/" className="brand-logo">
              <svg viewBox="0 0 24 24">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
              </svg>
              <span>{storeInfo.storeName}</span>
            </Link>
            <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
              {storeInfo.description}
            </p>

            {/* 4 Official Social Brand Icons (FB, IG, YT, TT) */}
            <ul className="footer-social-list">
              <li>
                <a href="#" className="social-icon-link" title="Facebook" aria-label="Facebook">
                  <svg viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" className="social-icon-link" title="Instagram" aria-label="Instagram">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" className="social-icon-link" title="YouTube" aria-label="YouTube">
                  <svg viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" className="social-icon-link" title="TikTok" aria-label="TikTok">
                  <svg viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.31 2.56 0 .68.25 1.37.72 1.86.67.7 1.69.99 2.62.83.99-.15 1.86-.88 2.22-1.81.16-.43.23-.9.22-1.36.03-4.8.01-9.6.02-14.4z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Info */}
          <div className="footer-col">
            <h4>Thông tin & Chính sách</h4>
            <ul className="footer-links">
              <li>
                <Link href="/policy?tab=returns">Chính sách đổi trả & bảo hành 7 ngày</Link>
              </li>
              <li>
                <Link href="/policy?tab=shipping">Chính sách giao hàng & kiểm hàng</Link>
              </li>
              <li>
                <Link href="/policy?tab=privacy">Chính sách bảo mật thông tin</Link>
              </li>
              <li>
                <Link href="/policy?tab=terms">Điều khoản sử dụng dịch vụ</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="footer-col">
            <h4>Hỗ trợ khách hàng</h4>
            <ul className="footer-links">
              <li>
                <Link href="/track-order">Tra cứu đơn hàng nhanh</Link>
              </li>
              <li>
                <Link href="/flash-sale">⚡ Săn Deal Flash Sale</Link>
              </li>
              <li>
                <Link href="/policy?tab=faq">Câu hỏi thường gặp (FAQ)</Link>
              </li>
              <li>
                <Link href="/contact">Trung tâm hỗ trợ liên hệ</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div className="footer-col">
            <h4>Thông Tin Liên Hệ</h4>
            <ul className="contact-info">
              <li>📍 {storeInfo.address}</li>
              <li>📞 {storeInfo.phone} - Hotline hỗ trợ</li>
              <li>✉️ {storeInfo.email}</li>
              <li>⏰ {storeInfo.workingHours}</li>
            </ul>
            <div style={{ marginTop: "16px" }}>
              <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>📩 Đăng ký nhận bản tin ưu đãi</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = emailInput.trim();
                  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                    setSubscribeMsg("⚠️ Vui lòng nhập email đúng định dạng (VD: name@domain.com)!");
                    return;
                  }
                  setSubscribeMsg("✅ Đăng ký nhận tin ưu đãi thành công!");
                  setEmailInput("");
                  setTimeout(() => setSubscribeMsg(""), 4000);
                }}
                style={{ display: "flex", gap: "6px" }}
              >
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  style={{
                    padding: "6px 10px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    border: "1px solid var(--border-color)",
                    width: "100%",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    backgroundColor: "var(--primary-color)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Đăng ký
                </button>
              </form>
              {subscribeMsg && (
                <div style={{ fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "6px" }}>
                  {subscribeMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer-bottom">&copy; {new Date().getFullYear()} Mini Shop. All rights reserved.</div>
      </div>

      {/* Floating Scroll-To-Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        title="Cuộn lên đầu trang"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "var(--primary-color)",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 900,
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
      >
        <IconChevronUp size={20} color="#ffffff" />
      </button>
    </footer>
  );
};
