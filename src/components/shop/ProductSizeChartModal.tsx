"use client";

import React from "react";
import { X, Ruler, CheckCircle2 } from "lucide-react";
import { Product } from "@/types/product";

interface ProductSizeChartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductSizeChartModal: React.FC<ProductSizeChartModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  // Generate specific product size specs based on product category / name
  const isSofa = product.name.toLowerCase().includes("sofa") || product.categoryName?.includes("Nội thất");
  const isTable = product.name.toLowerCase().includes("bàn") || product.name.toLowerCase().includes("ghế");
  const isVase = product.name.toLowerCase().includes("bình") || product.name.toLowerCase().includes("gốm") || product.categoryName?.includes("Trang trí");

  let sizeData = [
    { size: "Size S", dim: "Dài 120cm × Rộng 60cm × Cao 75cm", fit: "Phù hợp căn hộ 1PN, phòng ngủ, góc nhỏ (<15m²)" },
    { size: "Size M (Chuẩn)", dim: "Dài 160cm × Rộng 80cm × Cao 75cm", fit: "Phù hợp căn hộ 2PN, phòng khách hiện đại (15 - 25m²)" },
    { size: "Size L", dim: "Dài 200cm × Rộng 90cm × Cao 75cm", fit: "Phù hợp căn hộ 3PN, biệt thự, không gian rộng (>25m²)" },
  ];

  if (isSofa) {
    sizeData = [
      { size: "Size S (2 Chỗ)", dim: "Dài 150cm × Sâu 85cm × Cao 80cm", fit: "Phù hợp phòng khách nhỏ hoặc phòng đọc sách" },
      { size: "Size M (3 Chỗ)", dim: "Dài 210cm × Sâu 90cm × Cao 82cm", fit: "Chuẩn tiêu chuẩn căn hộ chung cư 2-3 phòng ngủ" },
      { size: "Size L (Góc L)", dim: "Dài 270cm × Sâu 160cm × Cao 85cm", fit: "Không gian phòng khách rộng rãi, sang trọng" },
    ];
  } else if (isVase) {
    sizeData = [
      { size: "Size S", dim: "Đường kính 12cm × Cao 18cm", fit: "Trang trí bàn làm việc, kệ sách nhỏ" },
      { size: "Size M (Chuẩn)", dim: "Đường kính 18cm × Cao 28cm", fit: "Trang trí bàn trà phòng khách, bàn ăn" },
      { size: "Size L", dim: "Đường kính 24cm × Cao 38cm", fit: "Trang trí đôn gỗ góc tường, tủ console" },
    ];
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "1.5rem",
          maxWidth: "560px",
          width: "100%",
          padding: "28px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          position: "relative",
          border: "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e8f5e9", color: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                Bảng Tra Kích Thước Sản Phẩm
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                {product.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: "none", background: "#f1f5f9", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Size Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sizeData.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "1rem",
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <strong style={{ fontSize: "14px", color: "var(--primary-color, #2e7d32)", fontWeight: 900 }}>
                  {item.size}
                </strong>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", background: "#ffffff", padding: "3px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                  {item.dim}
                </span>
              </div>
              <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> {item.fit}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
          💡 Sai số thủ công ±1-2cm do đo đạc thủ công. Cần tư vấn đo đạc thực tế xin liên hệ Hotline/Zalo: <strong>0901.234.567</strong>.
        </div>
      </div>
    </div>
  );
};
