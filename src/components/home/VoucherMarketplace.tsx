"use client";

import React, { useState } from "react";
import { Ticket, Gift, Check, Sparkles } from "lucide-react";

interface Voucher {
  code: string;
  title: string;
  desc: string;
  minOrder: string;
  expiry: string;
  badge: string;
}

const VOUCHERS: Voucher[] = [
  {
    code: "MINI100K",
    title: "Giảm ngay 100.000đ",
    desc: "Áp dụng cho đơn hàng nội thất & decor từ 1.500.000đ",
    minOrder: "Đơn từ 1.500.000đ",
    expiry: "Hạn 31/12/2026",
    badge: "MÃ HOT NHẤT",
  },
  {
    code: "FREESHIP",
    title: "Miễn Phí Vận Chuyển",
    desc: "Giảm 100% phí giao hàng & lắp đặt tận nhà toàn quốc",
    minOrder: "Đơn bất kỳ",
    expiry: "Hạn 31/12/2026",
    badge: "TOÀN QUỐC",
  },
  {
    code: "WELCOME50K",
    title: "Ưu Đãi Khách Hàng Mới",
    desc: "Tặng 50.000đ cho đơn hàng đầu tiên trải nghiệm dịch vụ",
    minOrder: "Đơn từ 500.000đ",
    expiry: "Dành cho TV mới",
    badge: "KHÁCH MỚI",
  },
];

export const VoucherMarketplace: React.FC = () => {
  const [savedCodes, setSavedCodes] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState("");

  const handleSaveVoucher = (code: string) => {
    try {
      localStorage.setItem("mini_shop_applied_coupon", code);
      if (!savedCodes.includes(code)) {
        setSavedCodes([...savedCodes, code]);
      }
      setToastMsg(`Đã lưu mã ${code} vào giỏ hàng thành công!`);
      setTimeout(() => setToastMsg(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section style={{ marginBottom: "48px" }}>
      <div className="container">
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "1.75rem",
            padding: "28px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                  Kho Quà & Mã Giảm Giá Đặc Quyền
                </h2>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Bấm nút "Lưu mã 1-Click" để tự động áp dụng ưu đãi vào đơn hàng của bạn.
                </p>
              </div>
            </div>

            {toastMsg && (
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 14px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check className="w-3.5 h-3.5" /> {toastMsg}
              </div>
            )}
          </div>

          {/* Voucher Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {VOUCHERS.map((v) => {
              const isSaved = savedCodes.includes(v.code);
              return (
                <div
                  key={v.code}
                  style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "1.25rem",
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, background: "#0284c7", color: "#ffffff", padding: "2px 8px", borderRadius: "999px", letterSpacing: "0.05em" }}>
                      {v.badge}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>{v.expiry}</span>
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>
                    {v.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 12px", lineHeight: 1.4, flexGrow: 1 }}>
                    {v.desc}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                    <code style={{ fontSize: "13px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", background: "#ffffff", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                      {v.code}
                    </code>
                    <button
                      onClick={() => handleSaveVoucher(v.code)}
                      style={{
                        padding: "6px 16px",
                        background: isSaved ? "#15803d" : "var(--primary-color, #2e7d32)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {isSaved ? (
                        <><Check className="w-3.5 h-3.5" /> Đã lưu</>
                      ) : (
                        <><Gift className="w-3.5 h-3.5" /> Lưu mã</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
