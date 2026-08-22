"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Check, Copy } from "lucide-react";
import { fetchAdminVouchers } from "@/lib/supabaseAdmin";

export const ProductVoucherBox: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Array<{ code: string; desc: string; tag: string }>>([
    { code: "DISCOUNT30", desc: "Giảm 30% cho đơn từ 2.000.000đ", tag: "GIẢM 30%" },
    { code: "DISCOUNT10", desc: "Giảm 10% cho tất cả đơn hàng", tag: "GIẢM 10%" },
    { code: "MINISHOP20", desc: "Giảm 20% cho đơn hàng đầu tiên", tag: "GIẢM 20%" },
  ]);

  useEffect(() => {
    fetchAdminVouchers().then((dbVouchers) => {
      const active = dbVouchers.filter((v) => v.isActive);
      if (active.length > 0) {
        setVouchers(
          active.slice(0, 4).map((v) => ({
            code: v.code,
            desc: v.desc,
            tag: v.percent
              ? `GIẢM ${v.percent}%`
              : v.fixedDiscount
              ? `GIẢM ${(v.fixedDiscount / 1000).toFixed(0)}K`
              : "ƯU ĐÃI",
          }))
        );
      }
    });
  }, []);

  const handleCopy = (code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  return (
    <div
      style={{
        background: "#f0fdf4",
        border: "1px dashed #86efac",
        borderRadius: "12px",
        padding: "14px 16px",
        marginBottom: "18px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 800,
          color: "#166534",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Ticket className="w-4 h-4 text-emerald-600" /> Mã Giảm Giá Áp Dụng Cho Sản Phẩm Này:
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {vouchers.map((v) => {
          const isCopied = copiedCode === v.code;
          return (
            <div
              key={v.code}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#ffffff",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 900,
                    background: "#dcfce7",
                    color: "#15803d",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {v.tag}
                </span>
                <div>
                  <strong style={{ fontSize: "12.5px", color: "#0f172a" }}>{v.code}</strong>
                  <span style={{ fontSize: "11.5px", color: "#64748b", marginLeft: "8px" }}>
                    {v.desc}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(v.code)}
                style={{
                  background: isCopied ? "#15803d" : "#f0fdf4",
                  color: isCopied ? "#ffffff" : "#166534",
                  border: "1px solid #86efac",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {isCopied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                {isCopied ? "Đã lưu mã!" : "Lưu mã"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
