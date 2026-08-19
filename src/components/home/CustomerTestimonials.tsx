"use client";

import React from "react";
import { fixImagePath } from "@/lib/utils";
import { Star, Heart, Camera } from "lucide-react";

export const CustomerTestimonials: React.FC = () => {
  const reviews = [
    {
      id: 1,
      name: "Chị Hoàng Lan",
      location: "Quận 1, TP. Hồ Chí Minh",
      rating: 5,
      comment: "Bộ bàn ăn gỗ sồi tự nhiên cực kỳ chắc chắn, vân gỗ đều đẹp mịn. Nhân viên giao hàng đúng hẹn và hỗ trợ nhiệt tình lắm!",
      roomImg: "assets/images/products/product-2.jpg",
    },
    {
      id: 2,
      name: "Anh Minh Tuấn",
      location: "Cầu Giấy, Hà Nội",
      rating: 5,
      comment: "Đèn thả mây tre trang trí phòng khách tạo ánh sáng rất ấm cúng. Thiết kế tinh tế đúng chuẩn phong cách Bắc Âu Nordic.",
      roomImg: "assets/images/products/product-1.jpg",
    },
    {
      id: 3,
      name: "Chị Ngọc Bích",
      location: "Hải Châu, Đà Nẵng",
      rating: 5,
      comment: "Mua trọn bộ tủ đầu giường và chậu cây decor phòng ngủ. Đóng gói rất cẩn thận, hàng nhận y như hình chụp trên web!",
      roomImg: "assets/images/products/product-6.jpg",
    },
  ];

  return (
    <section style={{ marginBottom: "60px" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "#fee2e2",
              color: "#dc2626",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-red-600" />
            <span>TRẢI NGHIỆM KHÁCH HÀNG THỰC TẾ</span>
          </div>

          <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Khách Hàng Nói Gì Về MINI-SHOP?
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "6px 0 0" }}>
            Hàng ngàn gia đình Việt đã tin tưởng và chọn MINI-SHOP để kiến tạo tổ ấm.
          </p>
        </div>

        {/* Testimonials 3-Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "1.5rem",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Star Ratings */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6, marginBottom: "20px", flexGrow: 1, fontStyle: "italic" }}>
                "{rev.comment}"
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                <img
                  src={fixImagePath(rev.roomImg)}
                  alt={rev.name}
                  style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{rev.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{rev.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Gallery Feed Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
            border: "1px solid #f5d0fe",
            borderRadius: "1.5rem",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Camera className="w-6 h-6 text-fuchsia-600" />
            <div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#701a75" }}>
                Chia sẻ không gian sống cùng hashtag #MiniShopHome
              </div>
              <div style={{ fontSize: "12px", color: "#86198f" }}>
                Tag @minishop_decor trên Instagram để nhận ngay Voucher 50.000đ!
              </div>
            </div>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#c026d3",
              color: "#ffffff",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(192, 38, 211, 0.25)",
            }}
          >
            Theo Dõi @minishop_decor
          </a>
        </div>
      </div>
    </section>
  );
};
