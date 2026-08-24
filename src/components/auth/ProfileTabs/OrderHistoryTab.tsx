"use client";

import React, { useState } from "react";
import { CustomerOrder } from "../types";
import { Package, Eye, Star, AlertTriangle } from "lucide-react";
import { fixImagePath } from "@/lib/utils";

interface OrderHistoryTabProps {
  orders: CustomerOrder[];
  onSelectOrder: (order: CustomerOrder) => void;
  onOpenReviewModal: (order: CustomerOrder) => void;
  onOpenCancelModal: (order: CustomerOrder) => void;
}

const isEligibleForReview = (dateStr: string): boolean => {
  if (!dateStr) return true;
  let orderTime: number | null = null;
  const parts = dateStr.split(" ");
  if (parts[0]) {
    const dateParts = parts[0].split("/");
    if (dateParts.length === 3) {
      const d = parseInt(dateParts[0], 10);
      const m = parseInt(dateParts[1], 10) - 1;
      const y = parseInt(dateParts[2], 10);
      orderTime = new Date(y, m, d).getTime();
    }
  }
  if (!orderTime) {
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) orderTime = parsed;
  }
  if (!orderTime) return true;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - orderTime <= SEVEN_DAYS_MS;
};

export const OrderHistoryTab: React.FC<OrderHistoryTabProps> = ({
  orders,
  onSelectOrder,
  onOpenReviewModal,
  onOpenCancelModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "all") return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: string, statusText: string) => {
    if (status === "completed") {
      return (
        <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#dcfce7", color: "#166534", fontSize: "12px", fontWeight: 800 }}>
          {statusText}
        </span>
      );
    }
    if (status === "shipping") {
      return (
        <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#e0f2fe", color: "#0369a1", fontSize: "12px", fontWeight: 800 }}>
          {statusText}
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#fef2f2", color: "#991b1b", fontSize: "12px", fontWeight: 800 }}>
          {statusText}
        </span>
      );
    }
    return (
      <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: 800 }}>
        {statusText}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Đơn Hàng Của Tôi ({orders.length})
        </h3>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ xác nhận" },
            { id: "processing", label: "Chờ lấy hàng" },
            { id: "shipping", label: "Chờ giao hàng" },
            { id: "completed", label: "Đã giao" },
            { id: "returned", label: "Trả hàng" },
            { id: "cancelled", label: "Đã hủy" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterStatus(st.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background: filterStatus === st.id ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                color: filterStatus === st.id ? "#ffffff" : "#64748b",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p style={{ fontSize: "14px", fontWeight: 600 }}>Không tìm thấy đơn hàng nào phù hợp</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px",
                background: "#ffffff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              }}
            >
              {/* Header: ID & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                <div>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Mã đơn: {o.id}</strong>
                  <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "10px" }}>{o.date}</span>
                </div>
                {getStatusBadge(o.status, o.statusText)}
              </div>

              {/* Items preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                {o.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img
                      src={fixImagePath(it.image)}
                      alt={it.name}
                      style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", border: "1px solid #f1f5f9" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: "13.5px", fontWeight: 700, margin: 0, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {it.name}
                      </h4>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Số lượng: {it.qty} × {it.price.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: Total & Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Tổng cộng: </span>
                  <strong style={{ fontSize: "16px", color: "var(--primary-color, #2e7d32)", fontWeight: 900 }}>
                    {o.total.toLocaleString("vi-VN")}đ
                  </strong>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => onSelectOrder(o)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "#f1f5f9",
                      border: "none",
                      color: "#334155",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" /> Chi tiết
                  </button>

                  {o.status === "completed" && (
                    o.review ? (
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(o)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          color: "#166534",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        title="Xem lại đánh giá của bạn"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Đã đánh giá ({o.review.rating}★)
                      </button>
                    ) : isEligibleForReview(o.date) ? (
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(o)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "#fef3c7",
                          border: "1px solid #fde68a",
                          color: "#b45309",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Đánh giá (+50đ)
                      </button>
                    ) : null
                  )}

                  {(o.status === "processing" || o.status === "shipping") && (
                    <button
                      type="button"
                      onClick={() => onOpenCancelModal(o)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
