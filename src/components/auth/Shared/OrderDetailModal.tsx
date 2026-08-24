"use client";

import React from "react";
import { Package, X, AlertTriangle } from "lucide-react";
import { CustomerOrder } from "../types";
import { fixImagePath } from "@/lib/utils";

interface OrderDetailModalProps {
  selectedOrder: CustomerOrder | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  selectedOrder,
  onClose,
}) => {
  if (!selectedOrder) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: "600px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            <Package className="w-4 h-4 text-emerald-700" /> Chi Tiết Đơn Hàng {selectedOrder.id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div style={{ padding: "20px 24px", maxHeight: "540px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Order Meta Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              background: "#f8fafc",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
            }}
          >
            <div>Ngày đặt: <span style={{ fontWeight: 800, color: "#0f172a" }}>{selectedOrder.date}</span></div>
            <div>Trạng thái: <span style={{ fontWeight: 800, color: "var(--primary-color, #2e7d32)" }}>{selectedOrder.statusText}</span></div>
            <div>Người nhận: <span style={{ fontWeight: 800, color: "#0f172a" }}>{selectedOrder.recipientName} ({selectedOrder.recipientPhone})</span></div>
            <div>Thanh toán: <span style={{ fontWeight: 800, color: "#0f172a" }}>{selectedOrder.paymentMethod}</span></div>
            <div style={{ gridColumn: "span 2" }}>Địa chỉ: <span style={{ fontWeight: 700, color: "#334155" }}>{selectedOrder.address}</span></div>
            {(selectedOrder as any).cancelReason && (
              <div style={{ gridColumn: "span 2", color: "#dc2626", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertTriangle className="w-4 h-4 text-red-600" /> {(selectedOrder as any).cancelReason}
              </div>
            )}
          </div>

          {/* Products List Card */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Sản phẩm trong đơn ({selectedOrder.items.length})</span>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                🏪 VICK Fashion Accessories / Mini Shop
              </span>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "14px", background: "#ffffff", display: "flex", flexDirection: "column", gap: "12px" }}>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <img
                    src={fixImagePath(it.image)}
                    alt={it.name}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/products/nhan-thep-titan-xanh-lam.png";
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {it.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#64748b", fontWeight: 700 }}>
                        {it.name.toLowerCase().includes("nhẫn") ? "Xanh lam, 7" : "Chính hãng cao cấp"}
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                        x{it.qty}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a" }}>
                      {(it.qty * it.price).toLocaleString("vi-VN")}đ
                    </div>
                    {it.qty > 1 && (
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {it.price.toLocaleString("vi-VN")}đ / cái
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <hr style={{ border: 0, borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />

              {/* Price Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "#475569" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tổng tiền hàng:</span>
                  <strong style={{ color: "#0f172a" }}>{(selectedOrder.subtotal || selectedOrder.total).toLocaleString("vi-VN")}đ</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Phí vận chuyển:</span>
                  <span>30.000đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                  <span>Ưu đãi phí vận chuyển:</span>
                  <span>-30.000đ</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
                    <span>Giảm giá / Shopee Xu:</span>
                    <span>-{selectedOrder.discount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "16px",
              fontWeight: 900,
              color: "#0f172a",
              marginTop: "4px",
              borderTop: "1.5px solid #e2e8f0",
              paddingTop: "12px",
            }}
          >
            <span>TỔNG CỘNG:</span>
            <span style={{ color: "var(--primary-color, #2e7d32)", fontSize: "18px" }}>
              {selectedOrder.total.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
