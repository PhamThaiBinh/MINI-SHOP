"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronUp } from "@/components/common/Icons";
import { getStoreSettings, StoreSettings } from "@/lib/storeSettings";
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, ArrowRight } from "lucide-react";

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
    <footer
      style={{
        background: "var(--bg-main, #fcfbf9)",
        padding: "40px 16px 40px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="container" style={{ padding: 0 }}>
        {/* Doppelrand Hardware Outer Shell */}
        <div
          style={{
            background: "#0f172a",
            borderRadius: "2.5rem",
            padding: "8px",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
          }}
        >
          {/* Doppelrand Hardware Inner Core */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "2rem",
              padding: "40px 36px",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* 4-Column Bento Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "40px",
                marginBottom: "40px",
              }}
            >
              {/* Col 1: Brand Info & Social Capsules */}
              <div>
                <Link
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    textDecoration: "none",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--primary-color, #2e7d32)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                    MINI SHOP
                  </span>
                </Link>

                <p style={{ fontSize: "13.5px", color: "#94a3b8", lineHeight: 1.6, marginBottom: "20px" }}>
                  {storeInfo.description}
                </p>

                {/* Social Capsules */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {["Facebook", "Instagram", "YouTube", "TikTok"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      style={{
                        padding: "8px 14px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#cbd5e1",
                        fontSize: "12px",
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>

              {/* Col 2: Info & Policies */}
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 900, color: "#ffffff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Thông Tin & Chính Sách
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Chính sách bảo hành 12 tháng", href: "/policy?tab=returns" },
                    { label: "Chính sách giao hàng toàn quốc", href: "/policy?tab=shipping" },
                    { label: "Chính sách bảo mật thông tin", href: "/policy?tab=privacy" },
                    { label: "Điều khoản sử dụng dịch vụ", href: "/policy?tab=terms" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        style={{
                          fontSize: "13.5px",
                          color: "#cbd5e1",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "color 0.2s ease",
                        }}
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Customer Support */}
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 900, color: "#ffffff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Hỗ Trợ Khách Hàng
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Tra cứu tiến độ đơn hàng", href: "/track-order" },
                    { label: "Săn Deal Flash Sale hôm nay", href: "/flash-sale" },
                    { label: "Câu hỏi thường gặp (FAQ)", href: "/policy?tab=faq" },
                    { label: "Trung tâm hỗ trợ liên hệ", href: "/contact" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        style={{
                          fontSize: "13.5px",
                          color: "#cbd5e1",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "color 0.2s ease",
                        }}
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Store Contact & Newsletter Button-in-Button */}
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 900, color: "#ffffff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Trụ Sở & Đăng Ký Nhận Tin
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px", color: "#cbd5e1", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 style-icon" />
                    <span>{storeInfo.address}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span style={{ fontWeight: 800, color: "#ffffff" }}>{storeInfo.phone}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{storeInfo.email}</span>
                  </div>
                </div>

                {/* Button-in-Button Newsletter Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = emailInput.trim();
                    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                      setSubscribeMsg("Vui lòng nhập Email hợp lệ!");
                      return;
                    }
                    setSubscribeMsg("Đã đăng ký nhận bản tin thành công!");
                    setEmailInput("");
                    setTimeout(() => setSubscribeMsg(""), 4000);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "999px",
                    padding: "4px 6px 4px 16px",
                  }}
                >
                  <input
                    type="email"
                    placeholder="Nhập email của bạn..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "#ffffff",
                      fontSize: "13px",
                      width: "100%",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "999px",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 900,
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      flexShrink: 0,
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Đăng Ký</span>
                  </button>
                </form>
                {subscribeMsg && (
                  <div style={{ fontSize: "12px", color: "#4ade80", fontWeight: 800, marginTop: "8px" }}>
                    {subscribeMsg}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Bar */}
            <div
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                paddingTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              <div>&copy; {new Date().getFullYear()} Mini Shop. Tất cả quyền được bảo lưu.</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ade80", fontWeight: 800 }}>
                <ShieldCheck className="w-4 h-4" />
                <span>Bảo mật SSL 256-bit chuẩn Châu Âu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll-To-Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        title="Cuộn lên đầu trang"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "var(--primary-color, #2e7d32)",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 8px 24px rgba(46, 125, 50, 0.35)",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
