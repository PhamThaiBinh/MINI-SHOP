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

        <div style={{ padding: "20px", maxHeight: "480px", overflowY: "auto" }}>
          <div
            style={{
              marginBottom: "16px",
              fontSize: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              color: "var(--text-main)",
            }}
          >
            <div>Ngày đặt: <span style={{ fontWeight: 600 }}>{selectedOrder.date}</span></div>
            <div>Trạng thái: <span style={{ fontWeight: 600 }}>{selectedOrder.statusText}</span></div>
            {(selectedOrder as any).cancelReason && (
              <div style={{ color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertTriangle className="w-4 h-4 text-red-600" /> Lý do hủy: {(selectedOrder as any).cancelReason}
              </div>
            )}
            <div>Người nhận: <span style={{ fontWeight: 600 }}>{selectedOrder.recipientName} ({selectedOrder.recipientPhone})</span></div>
            <div>Địa chỉ: <span style={{ fontWeight: 600 }}>{selectedOrder.address}</span></div>
            <div>Thanh toán: <span style={{ fontWeight: 600 }}>{selectedOrder.paymentMethod}</span></div>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "16px 0" }} />

          <h4 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "10px" }}>Sản phẩm trong đơn:</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {selectedOrder.items.map((it, idx) => (
              <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <img src={fixImagePath(it.image)} alt={it.name} style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>{it.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Số lượng: {it.qty} x {it.price.toLocaleString("vi-VN")}đ
                  </div>
                </div>
                <strong style={{ fontSize: "14px" }}>
                  {(it.qty * it.price).toLocaleString("vi-VN")}đ
                </strong>
              </div>
            ))}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "16px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span>Tạm tính:</span>
            <strong>{selectedOrder.subtotal.toLocaleString("vi-VN")}đ</strong>
          </div>
          {selectedOrder.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#ef4444" }}>
              <span>Giảm giá:</span>
              <strong>-{selectedOrder.discount.toLocaleString("vi-VN")}đ</strong>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 900, color: "var(--primary-color)", marginTop: "8px" }}>
            <span>TỔNG CỘNG:</span>
            <span>{selectedOrder.total.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
