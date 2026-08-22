"use client";

import React, { useState, useEffect } from "react";

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  desc: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image: "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products/products/noi-that-gia-dung/sofa-phong-khach.webp",
    title: "Nội Thất Nordic Đẳng Cấp",
    desc: "Giải pháp thiết kế Bắc Âu tinh tế, ấm cúng và sang trọng cho ngôi nhà Việt.",
  },
  {
    id: 2,
    image: "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products/products/do-my-nghe/den-tre-thu-cong.webp",
    title: "Mây Tre Đan Thủ Công",
    desc: "Tác phẩm nghệ thuật mộc mạc mang nét đẹp truyền thống vào kiến trúc hiện đại.",
  },
  {
    id: 3,
    image: "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products/products/noi-that-gia-dung/bo-ban-an-go.webp",
    title: "Bàn Ăn Gỗ Sồi Tự Nhiên",
    desc: "Chất liệu bền bỉ vượt thời gian - Nơi gắn kết trọn vẹn những bữa ăn gia đình.",
  },
];

export const AuthCarousel: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="auth-carousel-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "520px",
        overflow: "hidden",
        background: "#0f172a",
        borderTopLeftRadius: "24px",
        borderBottomLeftRadius: "24px",
      }}
    >
      {CAROUSEL_SLIDES.map((slide, index) => {
        const isActive = index === currentSlideIndex;
        return (
          <div
            key={slide.id}
            style={{
              position: "absolute",
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive ? "scale(1)" : "scale(1.05)",
              transition: "opacity 1s ease-in-out, transform 1s ease-in-out",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />

            {/* Dark Overlay Gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.3) 50%, rgba(15, 23, 42, 0.1) 100%)",
              }}
            />

            {/* Content Text Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                left: "32px",
                right: "32px",
                color: "#ffffff",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "rgba(46, 125, 50, 0.9)",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                }}
              >
                MINI SHOP INTERIOR
              </div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  lineHeight: "1.3",
                  marginBottom: "8px",
                  color: "#ffffff",
                }}
              >
                {slide.title}
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "#cbd5e1",
                  lineHeight: "1.6",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {slide.desc}
              </p>
            </div>
          </div>
        );
      })}

      {/* Indicator Dots */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "32px",
          display: "flex",
          gap: "8px",
          zIndex: 3,
        }}
      >
        {CAROUSEL_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlideIndex(index)}
            style={{
              width: index === currentSlideIndex ? "28px" : "8px",
              height: "8px",
              borderRadius: "9999px",
              background: index === currentSlideIndex ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
