"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatVND, fixImagePath } from "@/lib/utils";
import { PRODUCTS_DATA } from "@/data/products";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import "@/styles/product-list.css";
import { Zap, ShoppingCart, Flame, Clock, Check, X, AlertCircle } from "lucide-react";

// Generate 10 Flash Sale items per time slot guaranteed to be lower than original price
const getSlotProducts = (productsList: Product[], slotIndex: number) => {
  const list = productsList.length > 0 ? productsList : PRODUCTS_DATA;
  const startIndex = (slotIndex * 4) % list.length;
  const items = [];

  const discountPattern = [30, 35, 25, 40, 32, 28, 45, 33, 27, 38];

  for (let i = 0; i < 10; i++) {
    const pIndex = (startIndex + i) % list.length;
    const p = list[pIndex];
    const discountPercent = discountPattern[(i + slotIndex) % discountPattern.length];
    
    // Calculate flashPrice strictly lower than original price (at least 10,000 VND lower)
    const rawFlashPrice = Math.round((p.price * (1 - discountPercent / 100)) / 1000) * 1000;
    const flashPrice = Math.min(p.price - 10000, rawFlashPrice);

    const totalStock = 20 + ((p.id * 7) % 30);
    const soldCount = Math.min(
      totalStock - 2,
      Math.floor(totalStock * (0.45 + ((p.id * 5) % 45) / 100))
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

  // Map activeSlot to slotIndex 0..3 & check purchase eligibility
  const slotMap = { slot1: 0, slot2: 1, slot3: 2, slot4: 3 };
  const slotStartHours = { slot1: 0, slot2: 9, slot3: 15, slot4: 21 };
  
  const currentSlotIndex = slotMap[activeSlot];
  const slotProducts = getSlotProducts(products, currentSlotIndex);

  // Is active slot available for purchase based on VN time?
  const isSlotAvailableToBuy = vnHour >= slotStartHours[activeSlot];
  const slotStartText = activeSlot === "slot1" ? "00:00" : activeSlot === "slot2" ? "09:00" : activeSlot === "slot3" ? "15:00" : "21:00";

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="container" style={{ padding: "30px 16px 60px" }}>

        {/* Header Banner Flash Sale */}
      <div
        style={{
          background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "30px 24px",
          color: "#fff",
          marginBottom: "30px",
          boxShadow: "0 10px 25px rgba(220, 38, 38, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 900,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Zap style={{ width: 28, height: 28, color: "#fef08a", fill: "#fef08a" }} /> FLASH SALE SĂN DEAL GIỜ VÀNG
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: "14px", opacity: 0.9 }}>
            Khung giờ Việt Nam (UTC+7) - Ràng buộc giá FLASH SALE nhỏ hơn Giá Gốc 100%!
          </p>
        </div>

        {/* Live Countdown Clock VN Time */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>KẾT THÚC KHUNG HIỆN TẠI TRONG:</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontWeight: 900,
                fontSize: "16px",
              }}
            >
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span style={{ fontWeight: 900, fontSize: "16px", alignSelf: "center" }}>:</span>
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontWeight: 900,
                fontSize: "16px",
              }}
            >
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span style={{ fontWeight: 900, fontSize: "16px", alignSelf: "center" }}>:</span>
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontWeight: 900,
                fontSize: "16px",
              }}
            >
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Time Slots Bar - Clickable to view any time slot */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setActiveSlot("slot1")}
          style={{
            padding: "14px 10px",
            background: activeSlot === "slot1" ? "var(--primary-color)" : "#fff",
            color: activeSlot === "slot1" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            textAlign: "center",
            fontWeight: 800,
            transition: "all 0.2s ease",
            boxShadow: activeSlot === "slot1" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          <div style={{ fontSize: "15px" }}>00:00 - 09:00</div>
          <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {currentVnSlot === "slot1" ? <><Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Đang diễn ra</> : vnHour >= 0 ? "Đang / Đã mở bán" : "Chờ đón"}
          </div>
        </button>

        <button
          onClick={() => setActiveSlot("slot2")}
          style={{
            padding: "14px 10px",
            background: activeSlot === "slot2" ? "var(--primary-color)" : "#fff",
            color: activeSlot === "slot2" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            textAlign: "center",
            fontWeight: 800,
            transition: "all 0.2s ease",
            boxShadow: activeSlot === "slot2" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          <div style={{ fontSize: "15px" }}>09:00 - 15:00</div>
          <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {currentVnSlot === "slot2" ? <><Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Đang diễn ra</> : vnHour >= 9 ? "Đã mở bán" : <><Clock className="w-3.5 h-3.5" /> Chưa đến giờ</>}
          </div>
        </button>

        <button
          onClick={() => setActiveSlot("slot3")}
          style={{
            padding: "14px 10px",
            background: activeSlot === "slot3" ? "var(--primary-color)" : "#fff",
            color: activeSlot === "slot3" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            textAlign: "center",
            fontWeight: 800,
            transition: "all 0.2s ease",
            boxShadow: activeSlot === "slot3" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          <div style={{ fontSize: "15px" }}>15:00 - 21:00</div>
          <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {currentVnSlot === "slot3" ? <><Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Đang diễn ra</> : vnHour >= 15 ? "Đã mở bán" : <><Clock className="w-3.5 h-3.5" /> Chưa đến giờ</>}
          </div>
        </button>

        <button
          onClick={() => setActiveSlot("slot4")}
          style={{
            padding: "14px 10px",
            background: activeSlot === "slot4" ? "var(--primary-color)" : "#fff",
            color: activeSlot === "slot4" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            textAlign: "center",
            fontWeight: 800,
            transition: "all 0.2s ease",
            boxShadow: activeSlot === "slot4" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          <div style={{ fontSize: "15px" }}>21:00 - 24:00</div>
          <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {currentVnSlot === "slot4" ? <><Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Đang diễn ra</> : vnHour >= 21 ? "Đã mở bán" : <><Clock className="w-3.5 h-3.5" /> Chưa đến giờ</>}
          </div>
        </button>
      </div>

      {/* Section Header Notice */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          background: "#fff",
          padding: "12px 18px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
          <Flame className="w-4 h-4 text-red-600 fill-red-600" /> Danh sách 10 sản phẩm Flash Sale thuộc khung giờ {activeSlot === "slot1" ? "00:00 - 09:00" : activeSlot === "slot2" ? "09:00 - 15:00" : activeSlot === "slot3" ? "15:00 - 21:00" : "21:00 - 24:00"}:
        </div>
        <span
          style={{
            fontSize: "12px",
            background: isSlotAvailableToBuy ? "#dcfce7" : "#fef3c7",
            color: isSlotAvailableToBuy ? "#15803d" : "#b45309",
            padding: "4px 12px",
            borderRadius: "20px",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {isSlotAvailableToBuy ? (
            <><Check className="w-3.5 h-3.5 text-emerald-700" /> Đang trong thời gian mở bán - Mua ngay!</>
          ) : (
            <><Clock className="w-3.5 h-3.5 text-amber-700" /> Chưa đến giờ mở bán (Chờ đến {slotStartText})</>
          )}
        </span>
      </div>

      {/* Products Grid (10 items for selected time slot) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {slotProducts.map(({ product, flashPrice, discountPercent, soldCount, totalStock }) => {
          const soldPercentage = Math.round((soldCount / totalStock) * 100);

          return (
            <div
              key={product.id}
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Badge % Discount */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  zIndex: 2,
                }}
              >
                -{discountPercent}%
              </div>

              {/* Product Image Link to Detail Page with flashSalePrice */}
              <Link
                href={`/products/${product.id}?flashSalePrice=${flashPrice}`}
                style={{ width: "100%", height: "200px", background: "#f8fafc", display: "block" }}
              >
                <img
                  src={fixImagePath(product.image)}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Link>

              {/* Product Details */}
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>
                  {product.categoryName}
                </div>
                <Link
                  href={`/products/${product.id}?flashSalePrice=${flashPrice}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: "4px 0 12px",
                      lineHeight: "1.4",
                      color: "var(--text-main)",
                    }}
                  >
                    {product.name}
                  </h3>
                </Link>

                {/* Price Display */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#dc2626" }}>
                    {formatVND(flashPrice)}
                  </div>
                  <div style={{ fontSize: "12px", textDecoration: "line-through", color: "var(--text-muted)" }}>
                    Giá gốc: {formatVND(product.price)}
                  </div>
                </div>

                {/* Progress Bar (Sold stock) */}
                <div style={{ marginTop: "auto", marginBottom: "12px" }}>
                  <div
                    style={{
                      height: "16px",
                      background: "#fee2e2",
                      borderRadius: "10px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${soldPercentage}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
                        borderRadius: "10px",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 800,
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        gap: "4px",
                      }}
                    >
                      <Flame className="w-3 h-3 text-red-500 fill-red-500" /> ĐÃ BÁN {soldCount}/{totalStock} ({soldPercentage}%)
                    </span>
                  </div>
                </div>

                {/* Add to Cart button (Only enabled if isSlotAvailableToBuy and not sold out) */}
                {(() => {
                  const isSoldOut = soldCount >= totalStock || (product.stock !== undefined && product.stock === 0);
                  if (isSlotAvailableToBuy && !isSoldOut) {
                    return (
                      <button
                        onClick={() => {
                          addToCart({ ...product, price: flashPrice }, 1);
                          setAddedId(product.id);
                          setTimeout(() => setAddedId(null), 1500);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: addedId === product.id ? "#15803d" : "var(--primary-color)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "var(--radius-md)",
                          fontWeight: 800,
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        {addedId === product.id ? (
                          <><Check className="w-4 h-4" /> Đã thêm vào giỏ!</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4" /> MUA NGAY GIỜ VÀNG</>
                        )}
                      </button>
                    );
                  }
                  return (
                    <button
                      disabled
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#94a3b8",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontWeight: 800,
                        fontSize: "13px",
                        cursor: "not-allowed",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      {isSoldOut ? (
                        <><AlertCircle className="w-4 h-4" /> Hết suất Flash Sale</>
                      ) : (
                        <><Clock className="w-4 h-4" /> Chưa tới giờ bán ({slotStartText})</>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </main>
  );
}
