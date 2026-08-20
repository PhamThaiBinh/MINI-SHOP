"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/contact.css";
import { sendContactMessageToSupabase } from "@/lib/supabaseContact";
import { getStoreSettings, StoreSettings } from "@/lib/storeSettings";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Headphones,
  ShieldCheck,
  MessageCircle,
  Award,
  Sparkles,
  ExternalLink,
  Sofa,
  Bed,
  Building,
  ShieldAlert,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    topic: "Tư vấn Sofa Bắc Âu",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreSettings>(getStoreSettings());

  const topics = [
    { id: "sofa", label: "Tư vấn Sofa Bắc Âu", icon: <Sofa className="w-4 h-4" /> },
    { id: "bedroom", label: "Thiết kế phòng ngủ", icon: <Bed className="w-4 h-4" /> },
    { id: "business", label: "Đặt sắm doanh nghiệp", icon: <Building className="w-4 h-4" /> },
    { id: "warranty", label: "Hỗ trợ bảo hành", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Vui lòng nhập địa chỉ Email đúng định dạng (Ví dụ: name@example.com)!");
      return;
    }

    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/\D/g, "");
      if (cleanPhone.length < 9 || cleanPhone.length > 11) {
        alert("Số điện thoại liên hệ phải chứa từ 9 đến 11 chữ số!");
        return;
      }
    }

    setSubmitting(true);
    const success = await sendContactMessageToSupabase({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: `[Chủ đề: ${formData.topic}] ${formData.message}`,
    });
    setSubmitting(false);

    if (success) {
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "", topic: "Tư vấn Sofa Bắc Âu" });
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      alert("Không thể gửi tin nhắn. Vui lòng thử lại sau!");
    }
  };

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="container" style={{ padding: "30px 16px 60px" }}>
        
        {/* 1. Canopy Banner Emerald Nordic Glass */}
        <div
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
            borderRadius: "2rem",
            padding: "36px 40px",
            marginBottom: "32px",
            color: "#ffffff",
            boxShadow: "0 20px 40px -15px rgba(6, 78, 59, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            {/* Real-time Status Indicator Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                padding: "6px 16px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#6ee7b7",
                marginBottom: "14px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }}></span>
              SHOWROOM ĐANG MỞ CỬA ({storeInfo.workingHours})
            </div>

            <h1
              style={{
                fontSize: "34px",
                fontWeight: 900,
                color: "#ffffff",
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Liên Hệ & Tư Vấn Nội Thất Bắc Âu
            </h1>
            <p style={{ fontSize: "14.5px", color: "#cbd5e1", margin: 0, maxWidth: "600px", lineHeight: 1.5 }}>
              Chúng tôi luôn sẵn sàng hỗ trợ quý khách. Hãy gửi tin nhắn hoặc kết nối trực tiếp với đội ngũ KTS tại Showroom 107 D5 Phú Hòa.
            </p>
          </div>

          {/* Quick Zalo Action Capsule */}
          <div>
            <a
              href={storeInfo.zaloUrl || "https://zalo.me"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "14px 28px",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#064e3b",
                fontSize: "14px",
                fontWeight: 900,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
              }}
            >
              <MessageCircle className="w-5 h-5 text-emerald-700" />
              <span>Chat Zalo Tư Vấn Hỏa Tốc ↗</span>
            </a>
          </div>
        </div>

        {/* 2. Main Doppelrand Split Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "32px", alignItems: "start", marginBottom: "36px" }}>
          
          {/* Left: Showroom Headquarters Info Doppelrand Container */}
          <div className="doppelrand-outer">
            <div className="doppelrand-inner" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color, #2e7d32)" }}>
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Thông Tin Trụ Sở & Showroom
                  </h2>
                </div>

                {/* Gold Slate CSKH Badge */}
                <span style={{ fontSize: "11px", fontWeight: 900, background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#ffffff", padding: "4px 10px", borderRadius: "999px", letterSpacing: "0.03em", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Award className="w-3.5 h-3.5" /> CSKH 2h
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Showroom Address */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Địa chỉ Trụ Sở Showroom
                    </div>
                    <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a", marginTop: "2px", lineHeight: 1.5 }}>
                      {storeInfo.address}
                    </div>
                  </div>
                </div>

                {/* Hotline */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Hotline hỗ trợ kỹ thuật
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", marginTop: "2px" }}>
                      {storeInfo.phone}
                    </div>
                  </div>
                </div>

                {/* Email Support */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Email hỗ trợ khách hàng
                    </div>
                    <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                      {storeInfo.email}
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clock className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Giờ làm việc trực tiếp
                    </div>
                    <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                      {storeInfo.workingHours}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Callout */}
              <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 800, color: "#166534", background: "#f0fdf4", padding: "12px 16px", borderRadius: "12px" }}>
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Cam kết hỗ trợ tư vấn trực tiếp 1-1 không phát sinh chi phí.</span>
              </div>
            </div>
          </div>

          {/* Right: Contact Form Doppelrand Container */}
          <div className="doppelrand-outer">
            <div className="doppelrand-inner" style={{ padding: "28px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color, #2e7d32)" }}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  Gửi Yêu Cầu Tư Vấn Mẫu Decor
                </h2>
              </div>

              {/* Consultation Topic Capsule Selector */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", display: "block" }}>
                  Chọn chủ đề tư vấn mong muốn:
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {topics.map((t) => {
                    const isActive = formData.topic === t.label;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`filter-chip-btn ${isActive ? "active" : ""}`}
                        onClick={() => setFormData({ ...formData, topic: t.label })}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitted && (
                <div style={{ padding: "14px 18px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", color: "#166534", fontSize: "14px", fontWeight: 800, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                  <span>Cảm ơn bạn! Yêu cầu tư vấn đã được gửi thành công. Đội ngũ KTS sẽ liên hệ trong 2 giờ.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "6px", display: "block" }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên của bạn..."
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "14px",
                      borderRadius: "0.75rem",
                      border: "1px solid #cbd5e1",
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#ffffff",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "6px", display: "block" }}>
                      Địa chỉ Email *
                    </label>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "14px",
                        borderRadius: "0.75rem",
                        border: "1px solid #cbd5e1",
                        outline: "none",
                        boxSizing: "border-box",
                        background: "#ffffff",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "6px", display: "block" }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "14px",
                        borderRadius: "0.75rem",
                        border: "1px solid #cbd5e1",
                        outline: "none",
                        boxSizing: "border-box",
                        background: "#ffffff",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "6px", display: "block" }}>
                    Nội dung tin nhắn tư vấn *
                  </label>
                  <textarea
                    placeholder="Nhập yêu cầu tư vấn chi tiết, kích thước phòng khách hoặc gợi ý màu sắc..."
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "14px",
                      borderRadius: "0.75rem",
                      border: "1px solid #cbd5e1",
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#ffffff",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "14px 28px",
                    borderRadius: "999px",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 900,
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Đang gửi tin nhắn..." : "Gửi Tin Nhắn Tư Vấn"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 3. Dual Showroom Gallery & Interactive Map Container (Doppelrand) */}
        <div className="doppelrand-outer">
          <div className="doppelrand-inner" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>
                  Ghé Thăm Showroom MINI-SHOP (107 D5 Phú Hòa)
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  {storeInfo.address}
                </p>
              </div>

              {/* Direct Google Maps Navigation Button */}
              <a
                href={storeInfo.googleMapsUrl || "https://maps.app.goo.gl/ymXNFFXsf6qXoHWS7"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "13.5px",
                  fontWeight: 900,
                  color: "#ffffff",
                  background: "var(--primary-color, #2e7d32)",
                  padding: "10px 22px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                }}
              >
                <MapPin className="w-4 h-4" /> Mở Bản Đồ Google Maps (107 D5 Phú Hòa) ↗
              </a>
            </div>

            {/* Split View: Left Gallery Photo + Right Embedded Map */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px", alignItems: "stretch" }}>
              {/* Left Photo Showcase Card */}
              <div style={{ borderRadius: "1.25rem", overflow: "hidden", position: "relative", minHeight: "360px", background: "#0f172a" }}>
                <img
                  src="/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp"
                  alt="Showroom 107 D5 Phú Hòa"
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#6ee7b7", background: "rgba(6,78,59,0.8)", padding: "4px 10px", borderRadius: "999px", width: "fit-content", marginBottom: "8px" }}>
                    SHOWROOM 500M² THỦ DẦU MỘT
                  </span>
                  <h4 style={{ fontSize: "18px", fontWeight: 900, color: "#ffffff", margin: "0 0 4px" }}>
                    Không Gian Trưng Bày Thực Tế
                  </h4>
                  <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0 }}>
                    Trải nghiệm trực tiếp chất liệu gỗ sồi tự nhiên, mây tre đan & hệ thống chiếu sáng Bắc Âu.
                  </p>
                </div>
              </div>

              {/* Right Embedded Google Map centered on 107 D5 Phú Hòa */}
              <div style={{ borderRadius: "1.25rem", overflow: "hidden", border: "1px solid #cbd5e1", minHeight: "360px", background: "#f1f5f9" }}>
                <iframe
                  title="Bản đồ Mini Shop 107 D5 Phú Hòa"
                  src="https://maps.google.com/maps?q=107+d%C6%B0%E1%BB%9Dng+D5,+KDC+Ph%C3%BA+H%C3%B2a+1,+ph%C6%B0%E1%BB%9Dng+Ph%C3%BA+L%E1%BB%A3i,+Th%E1%BB%A7+D%E1%BA%A7u+M%E1%BB%99t&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "360px" }}
                  allowFullScreen={true}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
