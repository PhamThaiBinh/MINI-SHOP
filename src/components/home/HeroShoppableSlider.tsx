"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { fixImagePath, formatVND } from "@/lib/utils";
import { Product } from "@/types/product";
import { ShoppingCart, ChevronLeft, ChevronRight, Sparkles, Plus, ArrowRight, Check } from "lucide-react";

interface Hotspot {
  id: number;
  top: string;
  left: string;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    categoryName?: string;
  };
}

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  hotspots: Hotspot[];
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    tag: "BỘ SƯU TẬP PHÒNG KHÁCH 2026",
    title: "Sống Đẹp Mỗi Ngày Cùng MINI-SHOP",
    subtitle: "Khám phá không gian Bắc Âu tối giản với chất liệu gỗ tự nhiên & đồ mây tre thủ công tinh tế.",
    image: "assets/images/banner/banner-trang-chu-mini-shop.webp",
    hotspots: [
      {
        id: 101,
        top: "42%",
        left: "35%",
        product: {
          id: 1,
          name: "Sofa Vải Hiện Đại Nordic",
          price: 2990000,
          image: "assets/images/products/product-1.jpg",
          categoryName: "Phòng khách",
        },
      },
      {
        id: 102,
        top: "58%",
        left: "68%",
        product: {
          id: 6,
          name: "Chậu Cây Trồng Trong Nhà",
          price: 190000,
          image: "assets/images/products/product-6.jpg",
          categoryName: "Trang trí",
        },
      },
    ],
  },
  {
    id: 2,
    tag: "BẠN ĐỒNG HÀNH GIA ĐÌNH",
    title: "Ấm Cúng Căn Bếp Việt Mây Tre",
    subtitle: "Bàn ăn gỗ sồi mỹ nhập khẩu kết hợp khay sơn mài thủ công truyền thống.",
    image: "assets/images/products/product-2.jpg",
    hotspots: [
      {
        id: 201,
        top: "50%",
        left: "48%",
        product: {
          id: 2,
          name: "Bàn Ăn Gỗ Sồi Tự Nhiên",
          price: 3490000,
          image: "assets/images/products/product-2.jpg",
          categoryName: "Nhà bếp",
        },
      },
      {
        id: 202,
        top: "30%",
        left: "75%",
        product: {
          id: 5,
          name: "Kệ Gỗ Trang Trí Đa Năng",
          price: 890000,
          image: "assets/images/products/product-5.jpg",
          categoryName: "Lưu trữ",
        },
      },
    ],
  },
  {
    id: 3,
    tag: "GÓC NGHỈ NGƠI LÝ TƯỞNG",
    title: "Nâng Niu Giấc Ngủ Bình Yên",
    subtitle: "Giường ngủ gỗ sồi thiết kế giấu chân cùng tủ đầu giường thông minh gọn gàng.",
    image: "assets/images/products/product-3.jpg",
    hotspots: [
      {
        id: 301,
        top: "55%",
        left: "40%",
        product: {
          id: 3,
          name: "Giường Gỗ Sồi Hiện Đại",
          price: 4990000,
          image: "assets/images/products/product-3.jpg",
          categoryName: "Phòng ngủ",
        },
      },
      {
        id: 302,
        top: "45%",
        left: "78%",
        product: {
          id: 4,
          name: "Tủ Đầu Giường Gỗ Tự Nhiên",
          price: 790000,
          image: "assets/images/products/product-4.jpg",
          categoryName: "Phòng ngủ",
        },
      },
    ],
  },
];

export const HeroShoppableSlider: React.FC = () => {
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      setActiveHotspot(null);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    setActiveHotspot(null);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setActiveHotspot(null);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section className="hero-section" style={{ marginTop: "16px", marginBottom: "40px" }}>
      <div className="hero-banner">
        {/* Left Column: Content */}
        <div className="hero-content">
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
              marginBottom: "16px",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.tag}</span>
          </div>

          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-subtitle">{slide.subtitle}</p>

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "32px" }}>
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlide(idx);
                  setActiveHotspot(null);
                }}
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

        {/* Right Column: Interactive Image & Hotspots */}
        <div className="hero-image-wrapper" style={{ position: "relative", minHeight: "360px" }}>
          <img
            src={fixImagePath(slide.image)}
            alt={slide.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Hotspot Pins */}
          {slide.hotspots.map((spot) => (
            <div
              key={spot.id}
              style={{
                position: "absolute",
                top: spot.top,
                left: spot.left,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              <button
                onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.95)",
                  border: "2px solid var(--primary-color, #2e7d32)",
                  color: "var(--primary-color, #2e7d32)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 0 0 6px rgba(46, 125, 50, 0.25)",
                  animation: "pulse 2s infinite",
                }}
                title={`Xem ${spot.product.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Floating Mini Product Card */}
              {activeHotspot?.id === spot.id && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "36px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "220px",
                    background: "#ffffff",
                    borderRadius: "1rem",
                    padding: "12px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.18)",
                    border: "1px solid #e2e8f0",
                    zIndex: 20,
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    <img
                      src={fixImagePath(spot.product.image)}
                      alt={spot.product.name}
                      style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {spot.product.name}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                        {formatVND(spot.product.price)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(spot.product as Product)}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      background: addedId === spot.product.id ? "#15803d" : "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    {addedId === spot.product.id ? (
                      <><Check className="w-3 h-3" /> Đã thêm giỏ!</>
                    ) : (
                      <><ShoppingCart className="w-3 h-3" /> + Thêm nhanh</>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}

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
