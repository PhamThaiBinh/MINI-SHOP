"use client";

import React, { useState } from "react";
import { BookOpen, Ruler, Sparkles, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

export const CatalogFaqGuide: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const guideItems = [
    {
      icon: <Ruler className="w-5 h-5 text-emerald-600" />,
      title: "Cách chọn kích thước Sofa & Bàn ăn chuẩn diện tích phòng",
      content: "Đối với phòng khách nhỏ dưới 20m², bạn nên chọn Sofa văng đôi hoặc Sofa góc L kích thước dưới 2.1m kết hợp bàn trà tròn mây tre để tối ưu khoảng trống di chuyển. Với bàn ăn, diện tích 4 người dùng lý tưởng nhất là bàn dài 1.4m - 1.6m.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      title: "Mẹo bảo quản đồ gỗ tự nhiên & mây tre trong khí hậu Việt Nam",
      content: "Hạn chế để sản phẩm tiếp xúc trực tiếp ánh nắng gay gắt hoặc nước mưa trong thời gian dài. Thường xuyên lau bụi bằng khăn ẩm mềm mịn, định kỳ 6 tháng dùng lau bóng sáp ong chuyên dụng để duy trì vân gỗ sáng mịn bóng bẩy.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      title: "Quy trình giao hàng, kiểm tra & lắp đặt tận nhà từ MINI-SHOP",
      content: "Đội ngũ kỹ thuật viên MINI-SHOP trực tiếp hỗ trợ giao hàng, đồng kiểm cùng khách hàng và lắp đặt hoàn thiện tại phòng. Quý khách hoàn toàn được quyền kiểm tra sản phẩm đạt chuẩn chất lượng mới tiến hành thanh toán.",
    },
  ];

  return (
    <section
      style={{
        marginTop: "56px",
        marginBottom: "48px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "1.75rem",
        padding: "32px 36px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "#dcfce7",
            color: "#15803d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
            Cẩm Nang Mua Sắm Nội Thất & Hỏi Đáp Thường Gặp
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>
            Giải đáp thông tin hữu ích giúp bạn kiến tạo không gian sống như ý
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {guideItems.map((item, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              style={{
                border: "1px solid #f1f5f9",
                borderRadius: "1rem",
                background: isOpen ? "#f8fafc" : "#ffffff",
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {item.icon}
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                    {item.title}
                  </span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {isOpen && (
                <div style={{ padding: "0 20px 18px 52px", fontSize: "14px", color: "#475569", lineHeight: 1.65 }}>
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
