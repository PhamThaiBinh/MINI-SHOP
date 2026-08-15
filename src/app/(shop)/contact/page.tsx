"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/styles/contact.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <>
      {/* 2. Breadcrumb & Contact Hero */}
      <section className="contact-hero">
        <div className="container">
          <ul className="breadcrumb" style={{ marginBottom: "12px" }}>
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-separator">&rsaquo;</li>
            <li className="breadcrumb-current">Liên hệ</li>
          </ul>
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
                  <span>
                    123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí
                    Minh
                  </span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-text">
                  <strong>Hotline tư vấn:</strong>
                  <span>0987.654.321 (Tư vấn 24/7)</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div className="contact-text">
                  <strong>Email hỗ trợ:</strong>
                  <span>support@minishop.vn</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">⏰</div>
                <div className="contact-text">
                  <strong>Giờ mở cửa:</strong>
                  <span>8:00 AM - 21:30 PM (Tất cả các ngày trong tuần)</span>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-card">
              <h2 className="contact-info-title">Gửi Tin Nhắn Cho Chúng Tôi</h2>
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

                <button type="submit" className="btn-submit-green">
                  ✉️ Gửi Tin Nhắn
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
