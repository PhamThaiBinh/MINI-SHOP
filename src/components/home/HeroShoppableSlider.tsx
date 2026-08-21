"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fixImagePath } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    tag: "BỘ SƯU TẬP PHÒNG KHÁCH 2026",
    title: "Sống Đẹp Mỗi Ngày Cùng MINI-SHOP",
    subtitle: "Khám phá không gian Bắc Âu tối giản với chất liệu gỗ tự nhiên & đồ mây tre thủ công tinh tế.",
    image: "assets/images/banner/banner-trang-chu-mini-shop.webp",
  },
  {
    id: 2,
    tag: "BẠN ĐỒNG HÀNH GIA ĐÌNH",
    title: "Ấm Cúng Căn Bếp Việt Mây Tre",
    subtitle: "Bàn ăn gỗ sồi Mỹ nhập khẩu kết hợp khay sơn mài thủ công truyền thống.",
    image: "assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
  },
  {
    id: 3,
    tag: "GÓC NGHỈ NGƠI LÝ TƯỞNG",
    title: "Nâng Niu Giấc Ngủ Bình Yên",
    subtitle: "Sofa nỉ êm ái cùng bàn trà gỗ sồi thông minh gọn gàng cho không gian ấm áp.",
    image: "assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
  },
];

export const HeroShoppableSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="hero-section" style={{ marginTop: "16px", marginBottom: "40px" }}>
      <div className="hero-banner" style={{ minHeight: "450px", height: "450px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "40px 48px" }}>
        {/* Left Column: Content (Fixed Height & Structure) */}
        <div className="hero-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
          <div style={{ height: "26px", marginBottom: "12px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "#e8f5e9",
                color: "var(--primary-color, #2e7d32)",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.tag}</span>
            </div>
          </div>

          <h1 className="hero-title" style={{ minHeight: "105px", margin: "0 0 10px", display: "flex", alignItems: "center" }}>
            {slide.title}
          </h1>
          <p className="hero-subtitle" style={{ minHeight: "52px", margin: "0 0 20px", display: "flex", alignItems: "center" }}>
            {slide.subtitle}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <Link href="/products" className="btn-hero-cta">
              <span>Mua Sắm Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/policy"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#475569",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Chính sách đổi trả &rsaquo;
            </Link>
          </div>

          {/* Slider Controls Dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: currentSlide === idx ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: currentSlide === idx ? "var(--primary-color, #2e7d32)" : "#cbd5e1",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Hero Image Carousel (Fixed 360px Height) */}
        <div className="hero-image-wrapper" style={{ position: "relative", height: "360px", minHeight: "360px", maxHeight: "360px", borderRadius: "16px", overflow: "hidden" }}>
          <img
            src={fixImagePath(slide.image)}
            alt={slide.title}
            style={{ width: "100%", height: "360px", objectFit: "cover", display: "block" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
            }}
          />

          {/* Slider Prev / Next Overlay Buttons */}
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              top: "50%",
              left: "12px",
              transform: "translateY(-50%)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              top: "50%",
              right: "12px",
              transform: "translateY(-50%)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
