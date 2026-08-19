"use client";

import React from "react";
import { Zap, Flame, Sparkles, Leaf, Truck, Grid } from "lucide-react";

export type QuickFilterType = "all" | "flashSale" | "bestseller" | "new" | "wood" | "fastDelivery";

interface QuickFilterBarProps {
  activeFilter: QuickFilterType;
  onFilterChange: (filter: QuickFilterType) => void;
}

export const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filterOptions: { id: QuickFilterType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "all", label: "Tất Cả Sản Phẩm", icon: <Grid className="w-4 h-4" />, color: "#2e7d32" },
    { id: "flashSale", label: "Flash Sale Giảm Sâu", icon: <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />, color: "#dc2626" },
    { id: "bestseller", label: "Bán Chạy Nhất", icon: <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />, color: "#ea580c" },
    { id: "new", label: "Sản Phẩm Mới Về", icon: <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-400" />, color: "#0284c7" },
    { id: "wood", label: "Gỗ Tự Nhiên & Tre Đan", icon: <Leaf className="w-4 h-4 text-green-600" />, color: "#166534" },
    { id: "fastDelivery", label: "Giao Nhanh 2H", icon: <Truck className="w-4 h-4 text-blue-600" />, color: "#1d4ed8" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        overflowX: "auto",
        paddingBottom: "8px",
        marginBottom: "24px",
        scrollbarWidth: "thin",
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: 800, color: "#475569", whiteSpace: "nowrap", flexShrink: 0 }}>
        Lọc nhanh 1-Click:
      </span>
      {filterOptions.map((opt) => {
        const isActive = activeFilter === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onFilterChange(opt.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              border: isActive ? `1.5px solid ${opt.color}` : "1px solid #cbd5e1",
              background: isActive ? `${opt.color}10` : "#ffffff",
              color: isActive ? opt.color : "#334155",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              boxShadow: isActive ? `0 4px 12px ${opt.color}25` : "0 2px 6px rgba(0,0,0,0.02)",
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
