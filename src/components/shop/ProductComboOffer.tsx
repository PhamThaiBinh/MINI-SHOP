"use client";

import React, { useState } from "react";
import { Sparkles, Plus, ShoppingBag, CheckCircle2 } from "lucide-react";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";

interface ProductComboOfferProps {
  currentProduct: Product;
}

export const ProductComboOffer: React.FC<ProductComboOfferProps> = ({ currentProduct }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const comboItems = [
    {
      id: 991,
      name: "Đèn Lồng Tre Đan Thủ Công",
      price: 650000,
      image: "/assets/images/products/do-my-nghe/den-long-tre.webp",
    },
    {
      id: 992,
      name: "Chậu Cây Decor Để Bàn",
      price: 280000,
      image: "/assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp",
    },
  ];

  const originalTotal = currentProduct.price + comboItems[0].price + comboItems[1].price;
  const comboDiscount = 250000;
  const comboTotal = Math.max(500000, originalTotal - comboDiscount);
  const discountRatio = comboTotal / originalTotal;

  const handleAddCombo = () => {
    const p0Price = Math.round(currentProduct.price * discountRatio);
    const p1Price = Math.round(comboItems[0].price * discountRatio);
    const p2Price = comboTotal - p0Price - p1Price;

    // Add current product with proportional combo discount
    addToCart({
      ...currentProduct,
      price: p0Price,
      name: `${currentProduct.name} (Ưu Đãi Combo)`,
    });

    // Add combo item 1
    addToCart({
      id: comboItems[0].id,
      name: `${comboItems[0].name} (Ưu Đãi Combo)`,
      price: p1Price,
      image: comboItems[0].image,
      category: "C0005",
      categoryName: "Trang trí",
    } as Product);

    // Add combo item 2
    addToCart({
      id: comboItems[1].id,
      name: `${comboItems[1].name} (Ưu Đãi Combo)`,
      price: p2Price,
      image: comboItems[1].image,
      category: "C0005",
      categoryName: "Trang trí",
    } as Product);

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <section
      style={{
        marginTop: "36px",
        marginBottom: "36px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "1.5rem",
        padding: "28px 32px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "#fef3c7",
            color: "#b45309",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
            Gợi Ý Mua Trọn Bộ Không Gian "Complete The Look"
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>
            Phối cùng phụ kiện chuẩn Bắc Âu - Tiết kiệm ngay {formatVND(comboDiscount)} khi mua Combo!
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr auto 1fr auto 240px",
          gap: "14px",
          alignItems: "center",
        }}
      >
        {/* Main Product */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "12px",
            textAlign: "center",
            background: "#f8fafc",
          }}
        >
          <img
            src={fixImagePath(currentProduct.image)}
            alt={currentProduct.name}
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "0.75rem", margin: "0 auto 8px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
            }}
          />
          <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", height: "34px", overflow: "hidden" }}>
            {currentProduct.name}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--primary-color)", marginTop: "4px" }}>
            {formatVND(currentProduct.price)}
          </div>
        </div>

        <Plus className="w-5 h-5 text-slate-400" />

        {/* Combo Item 1 */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "12px",
            textAlign: "center",
            background: "#ffffff",
          }}
        >
          <img
            src={fixImagePath(comboItems[0].image)}
            alt={comboItems[0].name}
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "0.75rem", margin: "0 auto 8px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
            }}
          />
          <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", height: "34px", overflow: "hidden" }}>
            {comboItems[0].name}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--primary-color)", marginTop: "4px" }}>
            {formatVND(comboItems[0].price)}
          </div>
        </div>

        <Plus className="w-5 h-5 text-slate-400" />

        {/* Combo Item 2 */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "12px",
            textAlign: "center",
            background: "#ffffff",
          }}
        >
          <img
            src={fixImagePath(comboItems[1].image)}
            alt={comboItems[1].name}
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "0.75rem", margin: "0 auto 8px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
            }}
          />
          <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", height: "34px", overflow: "hidden" }}>
            {comboItems[1].name}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--primary-color)", marginTop: "4px" }}>
            {formatVND(comboItems[1].price)}
          </div>
        </div>

        <span style={{ fontSize: "20px", fontWeight: 900, color: "#94a3b8" }}>=</span>

        {/* Total & Action Box */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1px solid #86efac",
            borderRadius: "1rem",
            padding: "16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800, textTransform: "uppercase" }}>
            Tổng Tiền Combo (3 Món)
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#15803d" }}>
            {formatVND(comboTotal)}
          </div>
          <div style={{ fontSize: "11.5px", color: "#94a3b8", textDecoration: "line-through" }}>
            {formatVND(originalTotal)}
          </div>

          <button
            type="button"
            onClick={handleAddCombo}
            style={{
              marginTop: "6px",
              padding: "10px 14px",
              background: added ? "#166534" : "var(--primary-color, #2e7d32)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
              transition: "all 0.2s ease",
            }}
          >
            {added ? <CheckCircle2 className="w-4 h-4 text-white" /> : <ShoppingBag className="w-4 h-4" />}
            {added ? "Đã Thêm Combo!" : "+ Thêm Trọn Bộ Combo"}
          </button>
        </div>
      </div>
    </section>
  );
};
