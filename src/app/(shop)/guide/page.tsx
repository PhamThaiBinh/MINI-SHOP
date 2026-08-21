"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OnboardingModal } from "@/components/common/OnboardingModal";
import { Search, BookOpen, ShoppingBag, Ticket, Gift, Truck, HelpCircle, ChevronDown, ChevronUp, Sparkles, PlayCircle, ShieldCheck, PhoneCall } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "ordering" | "voucher" | "points" | "shipping";
}

export default function GuideLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const triggerTour = () => {
    setShowOnboarding(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("minishop_trigger_onboarding"));
    }
  };

  const faqs: FAQItem[] = [
    {
      category: "ordering",
      question: "Làm thế nào để mua hàng tại MINI SHOP?",
      answer: "Bạn chọn sản phẩm yêu thích, bấm 'Thêm vào giỏ' hoặc 'Mua ngay'. Tại trang Thanh toán, bạn nhập thông tin địa chỉ giao hàng và chọn phương thức thanh toán (COD hoặc Chuyển khoản VietQR), sau đó bấm 'Đặt hàng'.",
    },
    {
      category: "ordering",
      question: "Tôi có thể hủy đơn hàng sau khi đã đặt không?",
      answer: "Có! Bạn truy cập trang 'Tra cứu đơn hàng' hoặc xem phần 'Đơn hàng của tôi' trong tài khoản. Khi đơn hàng ở trạng thái 'Chờ xác nhận', bạn có thể bấm nút 'Hủy đơn hàng' và ghi rõ lý do hủy.",
    },
    {
      category: "voucher",
      question: "Cách nhập mã giảm giá WELCOME50 cho người mới?",
      answer: "Sau khi đăng ký tài khoản và hoàn thành Tour Hướng dẫn Tân thủ, mã WELCOME50 (giảm 50.000đ cho đơn từ 200.000đ) sẽ tự động lưu vào Kho Voucher của bạn. Tại trang Giỏ hàng hoặc Thanh toán, bạn chỉ cần chọn mã WELCOME50 để áp dụng giảm giá.",
    },
    {
      category: "voucher",
      question: "Một đơn hàng có được áp dụng nhiều mã giảm giá không?",
      answer: "Mỗi đơn hàng được áp dụng 1 mã voucher giảm giá sản phẩm. Tuy nhiên bạn vẫn được hưởng song song các chương trình Flash Sale và miễn phí vận chuyển nếu đủ điều kiện.",
    },
    {
      category: "points",
      question: "Quy chế tích điểm thưởng được tính như thế nào?",
      answer: "Mỗi khi đơn hàng của bạn được giao thành công, bạn sẽ được tự động tích lũy điểm thưởng. Ngoài ra khi đăng ký tài khoản thành công bạn được tặng ngay 500 điểm thưởng tân thủ.",
    },
    {
      category: "points",
      question: "Làm sao để dùng điểm thưởng đổi lấy voucher?",
      answer: "Bạn đăng nhập tài khoản, vào mục 'Quản lý tài khoản' -> 'Điểm thưởng & Đổi quà'. Tại đây bạn có thể dùng số điểm tích lũy để đổi các quà tặng hoặc mã giảm giá MINI10, MINI50, MINI100.",
    },
    {
      category: "shipping",
      question: "Thời gian giao hàng mất bao lâu?",
      answer: "Thời gian giao hàng chuẩn tại Hà Nội & TP.HCM từ 1 - 2 ngày làm việc. Các tỉnh thành khác từ 3 - 5 ngày làm việc tùy thuộc đơn vị vận chuyển.",
    },
    {
      category: "shipping",
      question: "Làm thế nào để tra cứu hành trình vận chuyển?",
      answer: "Bạn truy cập trang 'Tra Cứu Đơn Hàng' ở menu trên cùng, nhập Mã đơn hàng (ví dụ: O0001) hoặc Số điện thoại đặt hàng để kiểm tra timeline vận chuyển chi tiết.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Header />
      <OnboardingModal forceOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Hero Banner Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "60px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", padding: "6px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 800, color: "#4ade80", marginBottom: "16px" }}>
            <BookOpen style={{ width: "16px", height: "16px" }} /> Thư Viện Hướng Dẫn & Trợ Giúp Web
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 900, margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>
            Trung Tâm Hướng Dẫn Sử Dụng MINI SHOP
          </h1>
          <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: "1.6", maxWidth: "650px", margin: "0 auto 28px auto" }}>
            Mọi thông tin bạn cần để sẵn sàng mua sắm: Hướng dẫn đặt hàng, nhập mã giảm giá tân thủ WELCOME50, tích điểm đổi quà và tra cứu đơn hàng online.
          </p>

          {/* Action Buttons & Search */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", maxWidth: "450px", width: "100%" }}>
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm hướng dẫn (Ví dụ: Đặt hàng, Mã giảm giá, Tích điểm)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 18px 14px 44px",
                  borderRadius: "14px",
                  border: "none",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  outline: "none",
                }}
              />
              <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", color: "#64748b" }} />
            </div>

            <button
              type="button"
              onClick={triggerTour}
              style={{
                padding: "14px 22px",
                borderRadius: "14px",
                border: "none",
                background: "var(--primary-color, #2e7d32)",
                color: "#ffffff",
                fontSize: "13.5px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(46, 125, 50, 0.4)",
              }}
            >
              <PlayCircle style={{ width: "18px", height: "18px" }} /> Chạy Lại Tour Tân Thủ 🚀
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
        
        {/* 4 Feature Guide Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "48px" }}>
          
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "transform 0.2s ease" }}>
            <div style={{ background: "#ecfdf5", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", marginBottom: "16px" }}>
              <ShoppingBag style={{ width: "26px", height: "26px" }} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>1. Hướng Dẫn Đặt Hàng</h3>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6", margin: "0 0 14px 0" }}>
              Chọn đồ nội thất thích hợp ➔ Nhập địa chỉ nhận hàng ➔ Chọn thanh toán COD hoặc Quét mã QR VietQR tự động.
            </p>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#10b981" }}>Tiện lợi & Nhanh chóng →</span>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <div style={{ background: "#f0f9ff", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7", marginBottom: "16px" }}>
              <Ticket style={{ width: "26px", height: "26px" }} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>2. Áp Mã WELCOME50</h3>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6", margin: "0 0 14px 0" }}>
              Nhận ngay mã WELCOME50 giảm 50k cho đơn đầu tiên từ 200k. Chọn mã trong Kho voucher khi thanh toán.
            </p>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#0284c7" }}>Ưu đãi tân thủ →</span>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <div style={{ background: "#fffbeb", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", marginBottom: "16px" }}>
              <Gift style={{ width: "26px", height: "26px" }} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>3. Tích Điểm Đổi Quà</h3>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6", margin: "0 0 14px 0" }}>
              Nhận ngay 500 điểm thưởng khi hoàn thành hướng dẫn. Tự động tích điểm cho mỗi đơn hàng để đổi quà tặng.
            </p>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#d97706" }}>Quyền lợi thành viên →</span>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <div style={{ background: "#f5f3ff", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", marginBottom: "16px" }}>
              <Truck style={{ width: "26px", height: "26px" }} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>4. Tra Cứu Vận Chuyển</h3>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6", margin: "0 0 14px 0" }}>
              Nhập Mã đơn hàng hoặc Số điện thoại để xem timeline giao hàng theo thời gian thực và thực hiện hủy đơn online.
            </p>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#7c3aed" }}>Theo dõi dễ dàng →</span>
          </div>

        </div>

        {/* FAQ Section Header & Filters */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0" }}>
              ❓ Câu Hỏi Thường Gặp (FAQ)
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Giải đáp nhanh những vấn đề người mới thường gặp</p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { key: "all", label: "Tất cả câu hỏi" },
              { key: "ordering", label: "🛒 Đặt hàng" },
              { key: "voucher", label: "🎟️ Mã giảm giá" },
              { key: "points", label: "🎁 Tích điểm" },
              { key: "shipping", label: "🚚 Vận chuyển" },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border: activeCategory === cat.key ? "none" : "1px solid #cbd5e1",
                  background: activeCategory === cat.key ? "var(--primary-color, #2e7d32)" : "#ffffff",
                  color: activeCategory === cat.key ? "#ffffff" : "#475569",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "60px" }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: isOpen ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                    boxShadow: isOpen ? "0 4px 14px rgba(34, 197, 94, 0.1)" : "none",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{
                      width: "100%",
                      padding: "18px 24px",
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp style={{ width: "20px", height: "20px", color: "var(--primary-color, #2e7d32)" }} />
                    ) : (
                      <ChevronDown style={{ width: "20px", height: "20px", color: "#94a3b8" }} />
                    )}
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 24px 20px 24px", color: "#475569", fontSize: "14px", lineHeight: "1.7", borderTop: "1px dashed #f1f5f9", paddingTop: "14px" }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", color: "#94a3b8" }}>
              Không tìm thấy câu hỏi phù hợp với từ khóa "{searchQuery}"
            </div>
          )}
        </div>

        {/* Contact Support Banner */}
        <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", borderRadius: "24px", padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 900, margin: "0 0 6px 0" }}>Cần Thêm Sự Hỗ Trợ Trực Tiếp?</h3>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
              Đội ngũ chăm sóc khách hàng MINI SHOP luôn sẵn sàng giải đáp thắc mắc 24/7.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/contact"
              style={{
                padding: "12px 24px",
                borderRadius: "14px",
                background: "#ffffff",
                color: "#059669",
                fontSize: "13.5px",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              💬 Gửi Yêu Cầu Hỗ Trợ
            </Link>
            <a
              href="tel:0988123456"
              style={{
                padding: "12px 20px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontSize: "13.5px",
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <PhoneCall style={{ width: "16px", height: "16px" }} /> 0988.123.456
            </a>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
