"use client";

import React, { useState } from "react";
import { CustomerOrder } from "../types";
import { Package, Eye, Star, AlertTriangle, RotateCcw, Calendar, TrendingUp, Coins, ShoppingBag } from "lucide-react";
import { fixImagePath, formatVND } from "@/lib/utils";

interface OrderHistoryTabProps {
  orders: CustomerOrder[];
  onSelectOrder: (order: CustomerOrder) => void;
  onOpenReviewModal: (order: CustomerOrder) => void;
  onOpenCancelModal: (order: CustomerOrder) => void;
  onOpenReturnModal: (order: CustomerOrder) => void;
}

// Helper: Extract YYYY-MM from various date formats
const parseOrderMonthYear = (dateStr: string): string => {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      return `${yyyy}-${mm}`;
    }
  }
  const parts = dateStr.trim().split(" ");
  const datePart = parts.find((p) => p.includes("/")) || parts[0];
  if (datePart && datePart.includes("/")) {
    const sub = datePart.split("/");
    if (sub.length === 3) {
      const mm = sub[1].padStart(2, "0");
      const yyyy = sub[2];
      return `${yyyy}-${mm}`;
    }
  }
  return "";
};

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
  onOpenReturnModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Current Month default
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Month list for filter dropdown
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    return { key, label };
  });

  // Calculate Monthly Spending Statistics
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const monthOrders = selectedMonth === "all"
    ? validOrders
    : validOrders.filter((o) => parseOrderMonthYear(o.date) === selectedMonth);

  const monthlyTotalSpent = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const monthlyTotalDiscount = monthOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const completedMonthOrders = monthOrders.filter((o) => o.status === "completed").length;

  const filteredOrders = orders.filter((o) => {
    // 1. Month filter
    if (selectedMonth !== "all") {
      const orderMonth = parseOrderMonthYear(o.date);
      if (orderMonth !== selectedMonth) return false;
    }

    // 2. Status filter
    if (filterStatus === "all") return true;
    if (filterStatus === "returned") {
      return (
        o.status === "returned" ||
        (o.status as any) === "returning" ||
        o.statusText?.toLowerCase().includes("trả hàng") ||
        (o as any).cancelReason?.toLowerCase().includes("trả hàng")
      );
    }
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: string, statusText: string) => {
    if (status === "returned" || (status as any) === "returning" || statusText?.toLowerCase().includes("trả hàng")) {
      return (
        <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#ffedd5", color: "#c2410c", fontSize: "12px", fontWeight: 800 }}>
          {statusText || "Trả hàng / Hoàn tiền"}
        </span>
      );
    }
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
      {/* MONTHLY SPENDING ANALYTICS CARD */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          border: "1.5px solid #bbf7d0",
          borderRadius: "18px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 4px 16px rgba(22, 101, 52, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "var(--primary-color, #2e7d32)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 900, color: "#14532d", margin: 0 }}>
                Thống Kê Chi Tiêu {selectedMonth === "all" ? "Tất Cả Thời Gian" : `Tháng ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}
              </h4>
              <p style={{ fontSize: "12px", color: "#166534", margin: "2px 0 0", fontWeight: 700 }}>
                Báo cáo tổng tiền mua sắm và ưu đãi đã nhận
              </p>
            </div>
          </div>

          {/* Month Selector Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar className="w-4 h-4 text-emerald-800" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                borderRadius: "10px",
                border: "1.5px solid #86efac",
                background: "#ffffff",
                color: "#166534",
                outline: "none",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(22, 101, 52, 0.06)",
              }}
            >
              <option value="all">📅 Tất cả các tháng</option>
              {monthOptions.map((m) => (
                <option key={m.key} value={m.key}>
                  📅 {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Metric Mini Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          {/* Total Spent */}
          <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "14px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Tổng Chi Tiêu
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#14532d", marginTop: "4px" }}>
              {formatVND(monthlyTotalSpent)}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
              {monthOrders.length} đơn phát sinh
            </div>
          </div>

          {/* Completed Orders */}
          <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "14px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Đã Giao Thành Công
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#0c4a6e", marginTop: "4px" }}>
              {completedMonthOrders} đơn
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
              Giao tận tay thành công
            </div>
          </div>

          {/* Total Savings */}
          <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "14px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Tiết Kiệm & Voucher
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#78350f", marginTop: "4px" }}>
              {formatVND(monthlyTotalDiscount)}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
              Ưu đãi đã áp dụng
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Đơn Hàng Của Tôi ({filteredOrders.length})
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
                    <>
                      {o.review ? (
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
                      ) : null}

                      {/* 7-Day Return Button */}
                      {isEligibleForReview(o.date) && (
                        <button
                          type="button"
                          onClick={() => onOpenReturnModal(o)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "#fff7ed",
                            border: "1px solid #fed7aa",
                            color: "#c2410c",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="Yêu cầu trả hàng / hoàn tiền trong vòng 7 ngày kể từ khi nhận đơn"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-orange-600" /> Trả hàng (7 ngày)
                        </button>
                      )}
                    </>
                  )}

                  {(o.status === "pending" || o.status === "processing" || o.status === "shipping" || o.statusText?.toLowerCase().includes("chờ") || o.statusText?.toLowerCase().includes("xử lý")) && o.status !== "cancelled" && o.status !== "completed" && o.status !== "returned" && (
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
