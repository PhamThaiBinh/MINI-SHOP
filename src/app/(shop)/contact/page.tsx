"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/contact.css";
import { sendContactMessageToSupabase } from "@/lib/supabaseContact";
import { getStoreSettings, StoreSettings } from "@/lib/storeSettings";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, Headphones, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    const success = await sendContactMessageToSupabase(formData);
    setSubmitting(false);

    if (success) {
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
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
        
        {/* 1. Header Directory Banner (Flush Left Aligned) */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Liên Hệ Với MINI-SHOP
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, maxWidth: "600px" }}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy gửi tin nhắn hoặc gọi hotline để được kiến trúc sư tư vấn chu đáo nhất.
          </p>
        </div>

        {/* 2. Main Doppelrand Split Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "32px", alignItems: "start", marginBottom: "36px" }}>
          
          {/* Left: Showroom Headquarters Info Doppelrand Container */}
          <div className="doppelrand-outer">
            <div className="doppelrand-inner" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color, #2e7d32)" }}>
                  <Headphones className="w-5 h-5" />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  Thông Tin Trụ Sở & Showroom
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Showroom Address */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin className="w-4.5 h-4.5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Địa chỉ Showroom
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px", lineHeight: 1.5 }}>
                      {storeInfo.address}
                    </div>
                  </div>
                </div>

                {/* Hotline */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone className="w-4.5 h-4.5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Hotline tư vấn 24/7
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", marginTop: "2px" }}>
                      {storeInfo.phone}
                    </div>
                  </div>
                </div>

                {/* Email Support */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail className="w-4.5 h-4.5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Email hỗ trợ khách hàng
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                      {storeInfo.email}
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clock className="w-4.5 h-4.5 text-emerald-700" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Giờ phục vụ tại Showroom
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                      {storeInfo.workingHours}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Callout */}
              <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: 800, color: "#166534", background: "#f0fdf4", padding: "10px 14px", borderRadius: "12px" }}>
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Cam kết phản hồi yêu cầu tư vấn trong vòng 2 giờ làm việc.</span>
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
                  Gửi Tin Nhắn Cho Chúng Tôi
                </h2>
              </div>

              {submitted && (
                <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", color: "#166534", fontSize: "13.5px", fontWeight: 800, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                  <span>Cảm ơn bạn! Tin nhắn đã được gửi trực tiếp tới bộ phận tư vấn CSKH.</span>
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
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    placeholder="Nhập yêu cầu tư vấn mẫu decor, kích thước nội thất hoặc góp ý..."
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

        {/* 3. Bottom Showroom Location Card (Doppelrand) */}
        <div className="doppelrand-outer">
          <div className="doppelrand-inner" style={{ padding: "28px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>
              Ghé Thăm Trung Tâm Tin Học Văn Phòng Bình Dương
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 auto 12px", maxWidth: "650px" }}>
              {storeInfo.address}
            </p>

            <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 16px", borderRadius: "999px", width: "fit-content", margin: "0 auto 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>🖱️ Lăn con lăn chuột trực tiếp trên bản đồ để Phóng to / Thu nhỏ</span>
            </div>

            <div style={{ borderRadius: "1.25rem", overflow: "hidden", border: "1px solid #cbd5e1", height: "400px", background: "#f1f5f9", position: "relative" }}>
              <iframe
                title="Bản đồ Trung tâm Tin học Văn phòng Bình Dương"
                src="https://maps.google.com/maps?q=Trung+t%C3%A2m+Tin+h%E1%BB%8Dc+V%C4%83n+ph%C3%B2ng+B%C3%ACnh+D%C6%B0%C6%A1ng&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: "auto" }}
                allowFullScreen={true}
                loading="lazy"
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
