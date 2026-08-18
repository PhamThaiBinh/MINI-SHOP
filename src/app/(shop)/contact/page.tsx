"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/contact.css";
import { sendContactMessageToSupabase } from "@/lib/supabaseContact";
import { getStoreSettings, StoreSettings } from "@/lib/storeSettings";

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
      alert("⚠️ Vui lòng nhập địa chỉ Email đúng định dạng (Ví dụ: name@example.com)!");
      return;
    }

    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/\D/g, "");
      if (cleanPhone.length < 9 || cleanPhone.length > 11) {
        alert("⚠️ Số điện thoại liên hệ phải chứa từ 9 đến 11 chữ số!");
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
    <>
      {/* 2. Contact Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1 className="contact-hero-title">Liên Hệ Với Mini Shop</h1>
          <p className="contact-hero-desc">
            Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn 24/7. Hãy gửi tin
            nhắn cho chúng tôi để được tư vấn chu đáo nhất.
          </p>
        </div>
      </section>

      {/* 3. Contact Form & Info Grid */}
      <main className="main-content">
        <div className="container">
          <div className="contact-grid">
            {/* Left: Contact Details */}
            <div className="contact-info-card">
              <h2 className="contact-info-title">Thông Tin Trụ Sở</h2>

              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div className="contact-text">
                  <strong>Địa chỉ showroom:</strong>
                  <span>{storeInfo.address}</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-text">
                  <strong>Hotline tư vấn:</strong>
                  <span>{storeInfo.phone}</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div className="contact-text">
                  <strong>Email hỗ trợ:</strong>
                  <span>{storeInfo.email}</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">⏰</div>
                <div className="contact-text">
                  <strong>Giờ mở cửa:</strong>
                  <span>{storeInfo.workingHours}</span>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-card">
              <h2 className="contact-info-title">Gửi Tin Nhắn Cho Chúng Tôi</h2>
              {submitted && (
                <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#166534", fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
                  ✅ Cảm ơn bạn! Tin nhắn đã được gửi và lưu trực tiếp vào hệ thống Supabase. Bộ phận CSKH sẽ phản hồi trong 2 giờ.
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Họ và tên *</label>
                  <input
                    type="text"
                    id="contact-name"
                    className="form-control"
                    placeholder="Nhập họ và tên..."
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email">Địa chỉ Email *</label>
                  <input
                    type="email"
                    id="contact-email"
                    className="form-control"
                    placeholder="example@gmail.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-phone">Số điện thoại</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    className="form-control"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Nội dung tin nhắn *</label>
                  <textarea
                    id="contact-message"
                    className="form-control"
                    placeholder="Nhập yêu cầu tư vấn hoặc góp ý..."
                    style={{ minHeight: "100px" }}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit-green" disabled={submitting} style={{ opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? "⏳ Đang gửi tin nhắn..." : "✉️ Gửi Tin Nhắn"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
