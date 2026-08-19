"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatVND, fixImagePath } from "@/lib/utils";
import { PRODUCTS_DATA } from "@/data/products";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import "@/styles/flash-sale.css";
import { Zap, ShoppingCart, Flame, Clock, Check, Bell, Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";

// Generate 10 Flash Sale items per time slot guaranteed to be lower than original price
const getSlotProducts = (productsList: Product[], slotIndex: number) => {
  const list = productsList.length > 0 ? productsList : PRODUCTS_DATA;
  const startIndex = (slotIndex * 4) % list.length;
  const items = [];

  const discountPattern = [50, 45, 40, 35, 32, 30, 28, 25, 38, 27];

  for (let i = 0; i < 10; i++) {
    const pIndex = (startIndex + i) % list.length;
    const p = list[pIndex];
    const discountPercent = discountPattern[(i + slotIndex) % discountPattern.length];
    
    // Calculate flashPrice strictly lower than original price
    const rawFlashPrice = Math.round((p.price * (1 - discountPercent / 100)) / 1000) * 1000;
    const flashPrice = Math.min(p.price - 10000, rawFlashPrice);

    const totalStock = 20 + ((p.id * 7) % 30);
    const soldCount = Math.min(
      totalStock - 2,
      Math.floor(totalStock * (0.60 + ((p.id * 5) % 35) / 100))
    );

    items.push({
      product: p,
      flashPrice,
      discountPercent,
      soldCount,
      totalStock,
    });
  }

  return items;
};

export default function FlashSalePage() {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProductsFromSupabase();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Timezone VN Calculation & Slots
  const [activeSlot, setActiveSlot] = useState<"slot1" | "slot2" | "slot3" | "slot4">("slot1");
  const [currentVnSlot, setCurrentVnSlot] = useState<"slot1" | "slot2" | "slot3" | "slot4">("slot1");
  const isSlotInitRef = React.useRef(false);
  const [vnHour, setVnHour] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Vietnam Time UTC+7
      const vnDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
      const vnTime = new Date(vnDateStr);
      const currentHour = vnTime.getHours();
      setVnHour(currentHour);

      let activeKey: "slot1" | "slot2" | "slot3" | "slot4" = "slot1";
      let targetEndHour = 9;

      if (currentHour >= 0 && currentHour < 9) {
        activeKey = "slot1";
        targetEndHour = 9;
      } else if (currentHour >= 9 && currentHour < 15) {
        activeKey = "slot2";
        targetEndHour = 15;
      } else if (currentHour >= 15 && currentHour < 21) {
        activeKey = "slot3";
        targetEndHour = 21;
      } else {
        activeKey = "slot4";
        targetEndHour = 24;
      }

      setCurrentVnSlot(activeKey);

      if (!isSlotInitRef.current) {
        isSlotInitRef.current = true;
        setActiveSlot(activeKey);
      }

      // Remaining target time calculation
      const targetTime = new Date(vnTime);
      if (targetEndHour === 24) {
        targetTime.setHours(23, 59, 59, 999);
      } else {
        targetTime.setHours(targetEndHour, 0, 0, 0);
      }

      const diffMs = targetTime.getTime() - vnTime.getTime();
      if (diffMs > 0) {
        const totalSec = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        setTimeLeft({ hours: h, minutes: m, seconds: s });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const slotMap = { slot1: 0, slot2: 1, slot3: 2, slot4: 3 };
  const slotStartHours = { slot1: 0, slot2: 9, slot3: 15, slot4: 21 };
  
  const currentSlotIndex = slotMap[activeSlot];
  const slotProducts = getSlotProducts(products, currentSlotIndex);
  const heroSuperDeal = slotProducts[0]; // Top 50% deal of the slot

  const isSlotAvailableToBuy = vnHour >= slotStartHours[activeSlot];
  const slotStartText = activeSlot === "slot1" ? "00:00" : activeSlot === "slot2" ? "09:00" : activeSlot === "slot3" ? "15:00" : "21:00";

  const handleReminderToggle = () => {
    setReminderEnabled((prev) => !prev);
    const msg = !reminderEnabled
      ? "🔔 Đã bật nhắc nhở! Mini Shop sẽ thông báo khi khung giờ kế tiếp mở bán."
      : "🔕 Đã tắt nhắc nhở khung giờ săn deal.";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        paddingBottom: "60px",
      }}
    >
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "14px 20px",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            zIndex: 9999,
            fontSize: "13px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #334155",
          }}
        >
          {toastMessage}
        </div>
      )}

      <div className="container" style={{ padding: "30px 16px 0" }}>

        {/* 1. Cyber-Crimson Doppelrand Banner Header */}
        <div className="doppelrand-outer" style={{ marginBottom: "32px" }}>
          <div
            className="doppelrand-inner"
            style={{
              background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #b91c1c 100%)",
              color: "#ffffff",
              padding: "32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "24px",
              boxShadow: "0 12px 32px rgba(220, 38, 38, 0.35)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 900, background: "#fef08a", color: "#854d0e", padding: "4px 12px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  ⚡ CƠ HỘI SĂN DEAL GIỜ VÀNG
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
                  Khung Giờ Việt Nam (UTC+7)
                </span>
              </div>

              <h1 style={{ fontSize: "32px", fontWeight: 900, margin: "0 0 8px 0", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
                <Zap className="w-8 h-8 text-amber-300 fill-amber-300" /> FLASH SALE GIẢM ĐẾN 50%
              </h1>

              <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.9)", maxWidth: "540px" }}>
                Cam kết giá Flash Sale thấp hơn giá gốc 100%. Số lượng có hạn theo từng khung giờ mở bán!
              </p>
            </div>

            {/* Right: Digital LED Flip Clock & Reminder Button */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fef08a" }}>
                  KẾT THÚC TRONG:
                </span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span className="led-flip-digit">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span style={{ fontWeight: 900, fontSize: "20px", color: "#fbbf24" }}>:</span>
                  <span className="led-flip-digit">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span style={{ fontWeight: 900, fontSize: "20px", color: "#fbbf24" }}>:</span>
                  <span className="led-flip-digit">{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReminderToggle}
                style={{
                  padding: "10px 18px",
                  borderRadius: "999px",
                  background: reminderEnabled ? "#fbbf24" : "rgba(255, 255, 255, 0.2)",
                  color: reminderEnabled ? "#0f172a" : "#ffffff",
                  fontSize: "13px",
                  fontWeight: 800,
                  border: reminderEnabled ? "none" : "1px solid rgba(255, 255, 255, 0.4)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Bell className={`w-4 h-4 ${reminderEnabled ? "text-slate-900 fill-slate-900" : ""}`} />
                {reminderEnabled ? "Đã Đặt Nhắc Nhở Khung Giờ" : "🔔 Bật Nhắc Nhở Khung Giờ Kế Tiếp"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Floating LED Time Slot Tab Capsule Stream */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "36px",
          }}
        >
          {[
            { key: "slot1", label: "00:00 - 09:00", startHour: 0 },
            { key: "slot2", label: "09:00 - 15:00", startHour: 9 },
            { key: "slot3", label: "15:00 - 21:00", startHour: 15 },
            { key: "slot4", label: "21:00 - 24:00", startHour: 21 },
          ].map((slot) => {
            const isActive = activeSlot === slot.key;
            const isLiveNow = currentVnSlot === slot.key;
            const isPassed = vnHour >= slot.startHour;

            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => setActiveSlot(slot.key as any)}
                className={isLiveNow ? "glow-active-slot" : ""}
                style={{
                  padding: "16px 14px",
                  borderRadius: "1.25rem",
                  background: isActive ? "linear-gradient(135deg, #2e7d32 0%, #166534 100%)" : "#ffffff",
                  color: isActive ? "#ffffff" : "#334155",
                  border: "1px solid",
                  borderColor: isActive ? "var(--primary-color, #2e7d32)" : "#e2e8f0",
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: 800,
                  transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                  boxShadow: isActive ? "0 8px 20px rgba(46, 125, 50, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 900 }}>{slot.label}</div>
                <div style={{ fontSize: "12px", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px", opacity: 0.9 }}>
                  {isLiveNow ? (
                    <><Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flame-anim" /> ĐANG DIỄN RA</>
                  ) : isPassed ? (
                    "Đã mở bán"
                  ) : (
                    <><Clock className="w-3.5 h-3.5" /> Chưa đến giờ</>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. Hero Super Deal Spotlight (Top Deal of the Slot) */}
        {heroSuperDeal && (
          <div style={{ marginBottom: "40px" }}>
            <div className="hero-deal-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "center" }}>
                {/* Left: Product Image with 3D Ribbon Badge */}
                <div style={{ position: "relative", borderRadius: "1.25rem", overflow: "hidden", aspectRatio: "16 / 11", background: "#f8fafc" }}>
                  <span className="ribbon-badge-3d">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> SUPER DEAL -{heroSuperDeal.discountPercent}%
                  </span>
                  <Link href={`/products/${heroSuperDeal.product.id}?flashSalePrice=${heroSuperDeal.flashPrice}`}>
                    <img
                      src={fixImagePath(heroSuperDeal.product.image)}
                      alt={heroSuperDeal.product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/images/products/bo-binh-gom-minimal.webp";
                      }}
                    />
                  </Link>
                </div>

                {/* Right: Deal Details & Action */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 900, background: "#fee2e2", color: "#dc2626", padding: "3px 10px", borderRadius: "999px" }}>
                      🔥 SẢN PHẨM GIẢM SỐC NHẤT KHUNG GIỜ
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                      {heroSuperDeal.product.categoryName || "Đồ Nội Thất Sồi"}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: "0 0 12px 0", lineHeight: 1.3 }}>
                    <Link href={`/products/${heroSuperDeal.product.id}?flashSalePrice=${heroSuperDeal.flashPrice}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {heroSuperDeal.product.name}
                    </Link>
                  </h2>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "28px", fontWeight: 900, color: "#dc2626" }}>
                      {formatVND(heroSuperDeal.flashPrice)}
                    </span>
                    <span style={{ fontSize: "15px", textDecoration: "line-through", color: "#94a3b8", fontWeight: 700 }}>
                      Giá gốc: {formatVND(heroSuperDeal.product.price)}
                    </span>
                  </div>

                  {/* Liquid Thermal Tube Bar */}
                  <div style={{ marginBottom: "20px" }}>
                    <div className="thermal-tube-container">
                      <div
                        className="thermal-tube-fill"
                        style={{ width: `${Math.round((heroSuperDeal.soldCount / heroSuperDeal.totalStock) * 100)}%` }}
                      />
                      <div className="thermal-tube-text">
                        <Flame className="w-3 h-3 text-amber-300 fill-amber-300 flame-anim" /> ĐÃ BÁN {heroSuperDeal.soldCount}/{heroSuperDeal.totalStock} SẢN PHẨM ({Math.round((heroSuperDeal.soldCount / heroSuperDeal.totalStock) * 100)}%)
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Buy Action */}
                  {isSlotAvailableToBuy ? (
                    <button
                      type="button"
                      onClick={() => {
                        addToCart({ ...heroSuperDeal.product, price: heroSuperDeal.flashPrice }, 1);
                        setAddedId(heroSuperDeal.product.id);
                        setTimeout(() => setAddedId(null), 2000);
                      }}
                      style={{
                        padding: "14px 28px",
                        borderRadius: "999px",
                        background: addedId === heroSuperDeal.product.id ? "#166534" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 900,
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 8px 24px rgba(220, 38, 38, 0.35)",
                      }}
                    >
                      {addedId === heroSuperDeal.product.id ? (
                        <><Check className="w-5 h-5" /> Đã Thêm Giỏ Hàng!</>
                      ) : (
                        <><Zap className="w-5 h-5 text-amber-300 fill-amber-300" /> ⚡ SĂN DEAL SIÊU TỐC 1-CLICK</>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        padding: "14px 28px",
                        borderRadius: "999px",
                        background: "#94a3b8",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 800,
                        border: "none",
                        cursor: "not-allowed",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Clock className="w-5 h-5" /> Chưa đến giờ mở bán (Chờ đến {slotStartText})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Doppelrand Hardware Capsule Product Cards Stream */}
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Flame className="w-5 h-5 text-red-600 fill-red-600" /> DANH SÁCH DEAL KHUNG GIỜ {activeSlot === "slot1" ? "00:00 - 09:00" : activeSlot === "slot2" ? "09:00 - 15:00" : activeSlot === "slot3" ? "15:00 - 21:00" : "21:00 - 24:00"}
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          {slotProducts.map(({ product, flashPrice, discountPercent, soldCount, totalStock }) => {
            const soldPercentage = Math.round((soldCount / totalStock) * 100);

            return (
              <div key={product.id} className="doppelrand-outer">
                <div className="doppelrand-inner" style={{ padding: "16px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
                  {/* Image with 3D Ribbon Badge */}
                  <div style={{ position: "relative", borderRadius: "1rem", overflow: "hidden", aspectRatio: "1 / 1", marginBottom: "14px", background: "#f8fafc" }}>
                    <span className="ribbon-badge-3d">
                      -{discountPercent}% OFF
                    </span>
                    <Link href={`/products/${product.id}?flashSalePrice=${flashPrice}`}>
                      <img
                        src={fixImagePath(product.image)}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/images/products/bo-binh-gom-minimal.webp";
                        }}
                      />
                    </Link>
                  </div>

                  {/* Body Info */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "4px" }}>
                      {product.categoryName}
                    </span>

                    <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", lineHeight: 1.4, margin: "0 0 10px 0" }}>
                      <Link href={`/products/${product.id}?flashSalePrice=${flashPrice}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {product.name}
                      </Link>
                    </h4>

                    {/* Price */}
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#dc2626" }}>
                        {formatVND(flashPrice)}
                      </div>
                      <div style={{ fontSize: "12px", textDecoration: "line-through", color: "#94a3b8", fontWeight: 700 }}>
                        Giá gốc: {formatVND(product.price)}
                      </div>
                    </div>

                    {/* Liquid Thermal Tube Bar */}
                    <div style={{ marginTop: "auto", marginBottom: "14px" }}>
                      <div className="thermal-tube-container">
                        <div
                          className="thermal-tube-fill"
                          style={{ width: `${soldPercentage}%` }}
                        />
                        <div className="thermal-tube-text">
                          <Flame className="w-3 h-3 text-amber-300 fill-amber-300 flame-anim" /> ĐÃ BÁN {soldCount}/{totalStock} ({soldPercentage}%)
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    {isSlotAvailableToBuy ? (
                      <button
                        type="button"
                        onClick={() => {
                          addToCart({ ...product, price: flashPrice }, 1);
                          setAddedId(product.id);
                          setTimeout(() => setAddedId(null), 1800);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "999px",
                          background: addedId === product.id ? "#166534" : "var(--primary-color, #2e7d32)",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 800,
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {addedId === product.id ? (
                          <><Check className="w-4 h-4" /> Đã Thêm Giỏ Hàng!</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4" /> MUA NGAY GIỜ VÀNG</>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "999px",
                          background: "#94a3b8",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 800,
                          border: "none",
                          cursor: "not-allowed",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Clock className="w-4 h-4" /> Chưa mở bán ({slotStartText})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Policy Transparency Footer Grid */}
        <div className="doppelrand-outer" style={{ marginTop: "32px" }}>
          <div className="doppelrand-inner" style={{ padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <ShieldCheck className="w-8 h-8 text-emerald-700" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Chính Hãng 100%</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Bảo hành 12 tháng gỗ sồi</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Zap className="w-8 h-8 text-amber-600" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Giảm Thật 100%</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Giá thấp hơn niêm yết</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Truck className="w-8 h-8 text-emerald-700" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Freeship Đơn Từ 500k</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Giao hỏa tốc toàn quốc</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <RefreshCw className="w-8 h-8 text-emerald-700" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Đổi Trả 1-Đổi-1</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>30 ngày nếu có lỗi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
