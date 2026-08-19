"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { fixImagePath, formatVND } from "@/lib/utils";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { PRODUCTS_DATA } from "@/data/products";
import { Zap, Flame, Clock, ShoppingCart, ArrowRight, Check } from "lucide-react";

export const HomeFlashSale: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);

  // VN Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 20 });

  useEffect(() => {
    async function loadData() {
      const data = await fetchProductsFromSupabase();
      setProducts(data.length > 0 ? data : PRODUCTS_DATA);
    }
    loadData();

    const interval = setInterval(() => {
      const now = new Date();
      const vnDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
      const vnTime = new Date(vnDateStr);
      const targetTime = new Date(vnTime);
      targetTime.setHours(23, 59, 59, 999);

      const diffMs = targetTime.getTime() - vnTime.getTime();
      if (diffMs > 0) {
        const totalSec = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        setTimeLeft({ hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const flashItems = (products.length > 0 ? products : PRODUCTS_DATA).slice(0, 4).map((p, idx) => {
    const discountPercent = 25 + (idx * 5);
    const flashPrice = Math.round((p.price * (1 - discountPercent / 100)) / 1000) * 1000;
    const totalStock = 20;
    const soldCount = 14 + (idx * 2);
    return {
      product: p,
      flashPrice,
      discountPercent,
      soldCount,
      totalStock,
    };
  });

  const padZero = (n: number) => n.toString().padStart(2, "0");

  return (
    <section style={{ marginBottom: "48px" }}>
      <div className="container">
        <div
          style={{
            background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
            border: "1px solid #fed7aa",
            borderRadius: "1.75rem",
            padding: "28px 24px",
            boxShadow: "0 10px 30px rgba(234, 88, 12, 0.08)",
          }}
        >
          {/* Section Header with Live LED Clock */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#ea580c",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                }}
              >
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#9a3412", margin: 0, letterSpacing: "-0.02em" }}>
                  Flash Sale Săn Deal Giờ Vàng
                </h2>
                <p style={{ fontSize: "13px", color: "#c2410c", margin: "2px 0 0", fontWeight: 600 }}>
                  Giảm sâu tới 40% - Số lượng có hạn theo khung giờ!
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "8px 16px", borderRadius: "999px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #ffedd5" }}>
              <Clock className="w-4 h-4 text-orange-600" />
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#9a3412", textTransform: "uppercase" }}>Kết thúc sau:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 900, fontSize: "14px", color: "#ffffff" }}>
                <span style={{ background: "#ea580c", padding: "2px 6px", borderRadius: "4px" }}>{padZero(timeLeft.hours)}</span>
                <span style={{ color: "#ea580c" }}>:</span>
                <span style={{ background: "#ea580c", padding: "2px 6px", borderRadius: "4px" }}>{padZero(timeLeft.minutes)}</span>
                <span style={{ color: "#ea580c" }}>:</span>
                <span style={{ background: "#ea580c", padding: "2px 6px", borderRadius: "4px" }}>{padZero(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Product Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {flashItems.map(({ product, flashPrice, discountPercent, soldCount, totalStock }) => (
              <div
                key={product.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "1.25rem",
                  border: "1px solid #ffedd5",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {/* Sale Discount Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "#dc2626",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: "999px",
                    zIndex: 2,
                    boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)",
                  }}
                >
                  -{discountPercent}%
                </div>

                <div style={{ position: "relative", paddingTop: "85%", background: "#f8fafc" }}>
                  <img
                    src={fixImagePath(product.image)}
                    alt={product.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {product.name}
                  </h3>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "17px", fontWeight: 900, color: "#dc2626" }}>
                      {formatVND(flashPrice)}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "line-through" }}>
                      {formatVND(product.price)}
                    </span>
                  </div>

                  {/* Stock Progress Bar */}
                  <div style={{ marginBottom: "14px", marginTop: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#ea580c", marginBottom: "4px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Flame className="w-3.5 h-3.5 fill-orange-500" /> Đã bán {soldCount}
                      </span>
                      <span>Còn {totalStock - soldCount} suất</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "#ffedd5", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.round((soldCount / totalStock) * 100)}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #f97316 0%, #dc2626 100%)",
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart({ ...product, price: flashPrice }, 1);
                      setAddedId(product.id);
                      setTimeout(() => setAddedId(null), 1500);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: addedId === product.id ? "#15803d" : "#ea580c",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)",
                    }}
                  >
                    {addedId === product.id ? (
                      <><Check className="w-4 h-4" /> Đã thêm giỏ!</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4" /> Mua Ngay Giờ Vàng</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link
              href="/flash-sale"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#c2410c",
                textDecoration: "none",
              }}
            >
              Xem tất cả deal Flash Sale hôm nay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
