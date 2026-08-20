"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { formatVND, fixImagePath } from "@/lib/utils";
import {
  fetchAdminOrders,
  fetchAdminCategories,
  fetchAdminUsers,
} from "@/lib/supabaseAdmin";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { createClient } from "@/utils/supabase/client";
import { UnifiedOrder } from "@/utils/orderStorage";
import { Product } from "@/types/product";
import { DollarSign, BarChart3, Target, AlertTriangle, CheckCircle2, Truck, Package, Clock, XCircle, Eye, ArrowRight } from "lucide-react";

interface CategoryStat {
  code: string;
  name: string;
  icon: string;
  orderCount: number;
  revenue: number;
  percentage: number;
}

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Raw Database States
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number>(0);

  const loadAnalyticsData = async () => {
    setLoading(true);
    const [fetchedOrders, fetchedProducts, fetchedCategories, fetchedUsers] =
      await Promise.all([
        fetchAdminOrders(),
        fetchProductsFromSupabase(),
        fetchAdminCategories(),
        fetchAdminUsers(),
      ]);

    setOrders(fetchedOrders);
    setProducts(fetchedProducts);
    setCategories(fetchedCategories);
    setUserCount(fetchedUsers.length);
    setLoading(false);
  };

  useEffect(() => {
    loadAnalyticsData();

    // Subscribe to realtime changes on orders table
    const supabase = createClient();
    const channel = supabase
      .channel("admin_dashboard_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadAnalyticsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ==================== DATA ANALYST METRICS AGGREGATION ====================
  const completedOrders = orders.filter((o) => o.status === "completed");
  const shippingOrders = orders.filter((o) => o.status === "shipping");
  const processingOrders = orders.filter((o) => o.status === "processing");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  // Financial Metrics
  const netRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const grossPipeline = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const cancelledLoss = cancelledOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

  const averageOrderValue =
    completedOrders.length > 0 ? netRevenue / completedOrders.length : 0;

  const fulfillmentRate =
    orders.length > 0
      ? Math.round((completedOrders.length / orders.length) * 100)
      : 0;

  // Category Breakdown Aggregation
  const categoryStats: CategoryStat[] = categories.map((cat) => {
    // Match product category code or category name
    const catProducts = products.filter(
      (p) =>
        p.category === cat.code ||
        p.category === cat.slug ||
        p.categoryName === cat.name
    );
    const catProdNames = new Set(catProducts.map((p) => p.name));

    // Calculate revenue from completed orders matching products in this category
    let catRevenue = 0;
    let catOrderCount = 0;

    completedOrders.forEach((ord) => {
      const matchedItem = ord.items.find((it) => catProdNames.has(it.name));
      if (matchedItem) {
        catOrderCount++;
        catRevenue += ord.total || 0;
      }
    });

    return {
      code: cat.code || cat.slug,
      name: cat.name,
      icon: cat.icon || "Folder",
      orderCount: catOrderCount,
      revenue: catRevenue,
      percentage: netRevenue > 0 ? Math.round((catRevenue / netRevenue) * 100) : 0,
    };
  });

  // Low stock products alert (< 10 units)
  const lowStockProducts = products.filter(
    (p) => (p.stock !== undefined ? p.stock : 15) <= 10
  );

  // Search Filter for Live Orders Stream
  const filteredOrdersStream = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.recipientName.toLowerCase().includes(q) ||
      o.recipientPhone.includes(q) ||
      o.paymentMethod.toLowerCase().includes(q)
    );
  });

  // Time preset & date range filter state for Chart Hub
  const [timePreset, setTimePreset] = useState<"7d" | "30d" | "90d" | "180d" | "365d" | "custom">("30d");
  const [customStartDate, setCustomStartDate] = useState("2026-01-01");
  const [customEndDate, setCustomEndDate] = useState("2026-02-28");

  return (
    <div className="admin-wrapper">
      <AdminSidebar activeMenu="overview" sidebarCollapsed={sidebarCollapsed} />

      <main className="admin-main">
        <AdminHeader
          title="Tổng quan"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Tìm mã đơn, tên khách, SĐT trong nhật ký..."
        />

        <div className="dashboard-content-body">
          {loading ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text-muted)",
              }}
            >
              Đang nạp và xử lý mô hình phân tích dữ liệu Supabase...
            </div>
          ) : (
            <>
              {/* 1. HIGH-CONTRAST EXECUTIVE KPI SUMMARY CARDS WITH KINETIC TRENDS */}
              <div className="admin-bento-grid" style={{ marginBottom: "24px" }}>
                {/* Card 1: Net Revenue */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 4px 20px rgba(22, 101, 52, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Doanh Thu Thực
                      </span>
                      <span style={{ padding: "2px 6px", background: "#dcfce7", color: "#15803d", borderRadius: "8px", fontWeight: 800, fontSize: "10px" }}>
                        {completedOrders.length > 0 ? "↑ 100%" : "0%"}
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#14532d", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                      {formatVND(netRevenue)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                        {completedOrders.length} đơn hoàn thành
                      </span>
                    </div>
                  </div>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#166534", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(22, 101, 52, 0.25)" }}>
                    <DollarSign className="w-7 h-7" />
                  </div>
                </div>

                {/* Card 2: AOV */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                    border: "1.5px solid #bae6fd",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 4px 20px rgba(3, 105, 161, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Đơn Trung Bình (AOV)
                      </span>
                      <span style={{ padding: "2px 6px", background: "#e0f2fe", color: "#0369a1", borderRadius: "8px", fontWeight: 800, fontSize: "10px" }}>
                        {completedOrders.length > 0 ? "↑ 100%" : "0%"}
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#0c4a6e", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                      {formatVND(averageOrderValue)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ padding: "2px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                        Pipeline {formatVND(grossPipeline)}
                      </span>
                    </div>
                  </div>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(2, 132, 199, 0.25)" }}>
                    <BarChart3 className="w-7 h-7" />
                  </div>
                </div>

                {/* Card 3: Fulfillment Rate */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)",
                    border: "1.5px solid #99f6e4",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 4px 20px rgba(15, 118, 110, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Tỷ Lệ Chốt Đơn
                      </span>
                      <span style={{ padding: "2px 6px", background: "#ccfbf1", color: "#0f766e", borderRadius: "8px", fontWeight: 800, fontSize: "10px" }}>
                        {fulfillmentRate}%
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#134e4a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                      {fulfillmentRate}%
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ padding: "2px 8px", background: "#ccfbf1", color: "#0f766e", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                        {completedOrders.length} / {orders.length} đơn hàng
                      </span>
                    </div>
                  </div>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#0d9488", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(13, 148, 136, 0.25)" }}>
                    <Target className="w-7 h-7" />
                  </div>
                </div>

                {/* Card 4: Low Stock Alert */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
                    border: "1.5px solid #fde68a",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 4px 20px rgba(180, 83, 9, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Hàng Tồn Thấp (&le;10)
                      </span>
                      <span style={{ padding: "2px 6px", background: "#fef3c7", color: "#b45309", borderRadius: "8px", fontWeight: 800, fontSize: "10px" }}>
                        {lowStockProducts.length} món
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#78350f", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                      {lowStockProducts.length} <span style={{ fontSize: "14px", fontWeight: 700 }}>mặt hàng</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                        {pendingOrders.length} đơn chờ duyệt
                      </span>
                    </div>
                  </div>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#d97706", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.25)" }}>
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                </div>
              </div>

              {/* 1.5 INTERACTIVE REVENUE TREND & ANALYTICS CHART HUB */}
              {(() => {
                // Calculate dynamic date points strictly based on selected time preset & real Supabase orders
                const chartPoints: { dateStr: string; label: string; revenue: number }[] = [];

                if (timePreset === "custom") {
                  const startDate = new Date(customStartDate);
                  const endDate = new Date(customEndDate);
                  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate) {
                    const curr = new Date(startDate);
                    while (curr <= endDate) {
                      const year = curr.getFullYear();
                      const month = String(curr.getMonth() + 1).padStart(2, "0");
                      const day = String(curr.getDate()).padStart(2, "0");
                      const isoDate = `${year}-${month}-${day}`;
                      const dateLabel = `${day}/${month}/${year}`;

                      const dayRevenue = completedOrders
                        .filter((o) => {
                          if (!o.date) return false;
                          if (o.date.includes("/")) {
                            const parts = o.date.split(" ")[0].split("/");
                            if (parts.length === 3) {
                              const orderIso = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                              return orderIso === isoDate;
                            }
                          }
                          return o.date.startsWith(isoDate);
                        })
                        .reduce((sum, o) => sum + (o.total || 0), 0);

                      chartPoints.push({ dateStr: isoDate, label: dateLabel, revenue: dayRevenue });
                      curr.setDate(curr.getDate() + 1);
                    }
                  }
                } else {
                  let daysCount = 30;
                  if (timePreset === "7d") daysCount = 7;
                  else if (timePreset === "30d") daysCount = 30;
                  else if (timePreset === "90d") daysCount = 90;
                  else if (timePreset === "180d") daysCount = 180;
                  else if (timePreset === "365d") daysCount = 365;

                  const today = new Date();
                  for (let i = daysCount - 1; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    const isoDate = `${year}-${month}-${day}`;
                    const dateLabel = `${day}/${month}/${year}`;

                    const dayRevenue = completedOrders
                      .filter((o) => {
                        if (!o.date) return false;
                        if (o.date.includes("/")) {
                          const parts = o.date.split(" ")[0].split("/");
                          if (parts.length === 3) {
                            const orderIso = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                            return orderIso === isoDate;
                          }
                        }
                        return o.date.startsWith(isoDate);
                      })
                      .reduce((sum, o) => sum + (o.total || 0), 0);

                    chartPoints.push({ dateStr: isoDate, label: dateLabel, revenue: dayRevenue });
                  }
                }

                if (chartPoints.length === 0) {
                  const todayStr = new Date().toISOString().split("T")[0];
                  chartPoints.push({ dateStr: todayStr, label: "Hôm nay", revenue: 0 });
                }

                const maxRevenue = Math.max(...chartPoints.map((p) => p.revenue), 0);

                // Build SVG path string dynamically
                const width = 800;
                const height = 160;
                const baselineY = 130;
                const topY = 30;

                const svgPoints = chartPoints.map((pt, idx) => {
                  const x = (idx / Math.max(1, chartPoints.length - 1)) * width;
                  const y = maxRevenue > 0
                    ? baselineY - (pt.revenue / maxRevenue) * (baselineY - topY)
                    : baselineY;
                  return { x, y, pt };
                });

                const polylineStr = svgPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
                const linePathD = `M ${polylineStr}`;
                const areaPathD = `M 0,${baselineY} L ${polylineStr} L ${width},${baselineY} Z`;

                // Calculate display label steps for X-axis
                const labelStep = Math.max(1, Math.floor(chartPoints.length / 8));
                const filteredLabels = chartPoints.filter((_, i) => i % labelStep === 0 || i === chartPoints.length - 1);

                return (
                  <div className="admin-card-shell" style={{ marginBottom: "24px" }}>
                    <div className="admin-card-core" style={{ padding: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <BarChart3 className="w-5 h-5 text-emerald-700" />
                            <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              Biểu Đồ Doanh Thu & Xu Hướng Tăng Trưởng ({chartPoints.length} Ngày Qua)
                            </h3>
                          </div>
                          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            Phân tích dữ liệu thực tế từ Supabase — Hiển thị chính xác {chartPoints.length} ngày trong khoảng chọn
                          </p>
                        </div>

                        {/* Time Presets & Custom Picker */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          {(["7d", "30d", "90d", "180d", "365d"] as const).map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setTimePreset(preset)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "999px",
                                border: timePreset === preset ? "none" : "1px solid #cbd5e1",
                                background: timePreset === preset ? "var(--primary-color, #2e7d32)" : "#ffffff",
                                color: timePreset === preset ? "#ffffff" : "#475569",
                                fontSize: "12px",
                                fontWeight: 800,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                cursor: "pointer",
                                boxShadow: timePreset === preset ? "0 4px 10px rgba(46, 125, 50, 0.2)" : "none",
                              }}
                            >
                              {preset === "7d" && "7 ngày"}
                              {preset === "30d" && "1 tháng (30 ngày)"}
                              {preset === "90d" && "3 tháng (90 ngày)"}
                              {preset === "180d" && "6 tháng (180 ngày)"}
                              {preset === "365d" && "12 tháng (365 ngày)"}
                            </button>
                          ))}

                          {/* Custom Range Toggle */}
                          <button
                            type="button"
                            onClick={() => setTimePreset("custom")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "999px",
                              border: timePreset === "custom" ? "none" : "1px solid #cbd5e1",
                              background: timePreset === "custom" ? "#0284c7" : "#ffffff",
                              color: timePreset === "custom" ? "#ffffff" : "#475569",
                              fontSize: "12px",
                              fontWeight: 800,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              cursor: "pointer",
                            }}
                          >
                            📅 Tùy chỉnh ngày
                          </button>
                        </div>
                      </div>

                      {/* Custom Date Pickers Bar */}
                      {timePreset === "custom" && (
                        <div
                          style={{
                            padding: "12px 16px",
                            background: "#f0f9ff",
                            border: "1px solid #bae6fd",
                            borderRadius: "14px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: "#0369a1" }}>Từ ngày:</span>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                              }}
                            />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: "#0369a1" }}>Đến ngày:</span>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "12px", color: "#0369a1", fontWeight: 700 }}>
                            Hiển thị báo cáo doanh thu {chartPoints.length} ngày (từ <strong>{customStartDate}</strong> đến <strong>{customEndDate}</strong>)
                          </span>
                        </div>
                      )}

                      {/* Dynamic SVG Area Chart */}
                      <div style={{ position: "relative", width: "100%", height: "240px", background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
                        <svg width="100%" height="170" viewBox="0 0 800 160" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Horizontal Gridlines */}
                          <line x1="0" y1="30" x2="800" y2="30" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <line x1="0" y1="70" x2="800" y2="70" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <line x1="0" y1="110" x2="800" y2="110" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <line x1="0" y1="130" x2="800" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />

                          {/* Dynamic Area & Line Paths */}
                          <path d={areaPathD} fill="url(#revenueGrad)" />
                          <path d={linePathD} fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />

                          {/* Render Data Dots if there is non-zero revenue */}
                          {maxRevenue > 0 &&
                            svgPoints
                              .filter((p) => p.pt.revenue > 0)
                              .map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                              ))}
                        </svg>

                        {/* X-Axis Date Labels Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                          {filteredLabels.map((pt, idx) => (
                            <span key={idx} style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {pt.label}
                            </span>
                          ))}
                        </div>

                        {/* Chart Tooltip Badge simulation */}
                        <div
                          style={{
                            position: "absolute",
                            top: "14px",
                            right: "20px",
                            background: maxRevenue > 0 ? "#14532d" : "#0f172a",
                            color: "#ffffff",
                            padding: "6px 14px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 800,
                            boxShadow: "0 6px 14px rgba(15, 23, 42, 0.2)",
                            pointerEvents: "none",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {maxRevenue > 0 ? `Mốc đỉnh cao: ${formatVND(maxRevenue)}` : "Mốc đỉnh cao: 0đ (Chưa có doanh số trong kho)"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. MIDDLE SECTION: ORDER FUNNEL & CATEGORY PERFORMANCE */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr",
                  gap: "20px",
                }}
              >
                {/* 2A. ORDER FUNNEL BREAKDOWN */}
                <div className="dashboard-card" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="card-header-row" style={{ marginBottom: "16px" }}>
                    <div>
                      <h3 className="card-header-title">Phễu Xử Lý Đơn Hàng</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                        Phân bổ <strong>{orders.length} đơn hàng</strong> theo trạng thái vận hành
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
                    {/* Progress Bar 1: Completed */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã hoàn thành ({completedOrders.length})</span>
                        <span style={{ color: "#166534" }}>{formatVND(netRevenue)}</span>
                      </div>
                      <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ background: "#16a34a", height: "100%", width: `${(completedOrders.length / orders.length) * 100}%` }} />
                      </div>
                    </div>

                    {/* Progress Bar 2: Shipping */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Truck className="w-3.5 h-3.5 text-sky-600" /> Đang vận chuyển ({shippingOrders.length})</span>
                        <span style={{ color: "#0284c7" }}>
                          {formatVND(shippingOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                        </span>
                      </div>
                      <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ background: "#0284c7", height: "100%", width: `${(shippingOrders.length / orders.length) * 100}%` }} />
                      </div>
                    </div>

                    {/* Progress Bar 3: Processing */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Package className="w-3.5 h-3.5 text-amber-600" /> Đang xử lý đóng gói ({processingOrders.length})</span>
                        <span style={{ color: "#d97706" }}>
                          {formatVND(processingOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                        </span>
                      </div>
                      <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ background: "#f59e0b", height: "100%", width: `${(processingOrders.length / orders.length) * 100}%` }} />
                      </div>
                    </div>

                    {/* Progress Bar 4: Pending */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock className="w-3.5 h-3.5 text-slate-500" /> Chờ duyệt mới ({pendingOrders.length})</span>
                        <span style={{ color: "#64748b" }}>
                          {formatVND(pendingOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                        </span>
                      </div>
                      <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ background: "#94a3b8", height: "100%", width: `${(pendingOrders.length / orders.length) * 100}%` }} />
                      </div>
                    </div>

                    {/* Progress Bar 5: Cancelled */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><XCircle className="w-3.5 h-3.5 text-red-600" /> Đã hủy ({cancelledOrders.length})</span>
                        <span style={{ color: "#dc2626" }}>-{formatVND(cancelledLoss)}</span>
                      </div>
                      <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ background: "#ef4444", height: "100%", width: `${(cancelledOrders.length / orders.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2B. CATEGORY REVENUE MATRIX */}
                <div className="dashboard-card">
                  <div className="card-header-row" style={{ marginBottom: "16px" }}>
                    <div>
                      <h3 className="card-header-title">Đóng Góp Doanh Thu Theo Danh Mục</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                        Phân tích hiệu quả kinh doanh của <strong>{categories.length} nhóm sản phẩm chính</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {categoryStats.map((c) => (
                      <div
                        key={c.code}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-color)",
                          background: "#fff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                            fontWeight: 700,
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "16px" }}>{c.icon}</span> {c.name}{" "}
                            <code style={{ fontSize: "11px", color: "var(--text-muted)", background: "#f1f5f9", padding: "1px 5px", borderRadius: "4px" }}>
                              {c.code}
                            </code>
                          </span>
                          <span style={{ color: "var(--primary-color)", fontWeight: 800 }}>
                            {formatVND(c.revenue)} ({c.percentage}%)
                          </span>
                        </div>

                        <div style={{ background: "#f1f5f9", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              background: "var(--primary-color)",
                              height: "100%",
                              width: `${c.percentage || 5}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. INVENTORY ALERT & PENDING ACTION CENTER */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                {/* 3A. LOW STOCK PRODUCTS ALERT */}
                <div className="dashboard-card">
                  <div className="card-header-row" style={{ marginBottom: "12px" }}>
                    <h3 className="card-header-title" style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertTriangle className="w-4 h-4 text-red-600" /> Sản Phẩm Tồn Kho Thấp (&le; 10 sản phẩm)
                    </h3>
                    <Link href="/admin/products" style={{ fontSize: "12px", color: "var(--primary-color)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      Xem kho <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {lowStockProducts.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#166534", background: "#f0fdf4", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kho hàng an toàn, không có mặt hàng nào dưới 10 món.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {lowStockProducts.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid #fee2e2",
                            background: "#fff5f5",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={fixImagePath(p.image)}
                              alt={p.name}
                              style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }}
                            />
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{p.name}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.categoryName}</div>
                            </div>
                          </div>
                          <span style={{ padding: "4px 8px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "6px", fontSize: "12px", fontWeight: 800 }}>
                            Còn {p.stock !== undefined ? p.stock : 5} món
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3B. PENDING APPROVAL ORDERS */}
                <div className="dashboard-card">
                  <div className="card-header-row" style={{ marginBottom: "12px" }}>
                    <h3 className="card-header-title" style={{ color: "#d97706", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock className="w-4 h-4 text-amber-600" /> Đơn Hàng Cần Duyệt Gấp ({pendingOrders.length})
                    </h3>
                    <Link href="/admin/orders" style={{ fontSize: "12px", color: "var(--primary-color)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      Quản lý đơn <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {pendingOrders.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#166534", background: "#f0fdf4", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã xử lý sạch đơn hàng chờ duyệt!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {pendingOrders.slice(0, 4).map((ord) => (
                        <div
                          key={ord.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid #fef3c7",
                            background: "#fffbeb",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                              {ord.id} • {ord.recipientName}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {ord.date} • {ord.paymentMethod}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary-color)" }}>
                              {formatVND(ord.total)}
                            </div>
                            <Link
                              href="/admin/orders"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#2563eb",
                                textDecoration: "underline",
                              }}
                            >
                              Duyệt ngay <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. REALTIME RECENT ORDERS STREAM TABLE */}
              <div className="admin-card-shell">
                <div className="admin-card-core" style={{ padding: "24px" }}>
                  <div className="card-header-row" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ position: "relative", display: "flex", width: "10px", height: "10px" }}>
                          <span style={{ position: "absolute", display: "inline-flex", width: "100%", height: "100%", borderRadius: "50%", background: "#22c55e", opacity: 0.75, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}></span>
                          <span style={{ position: "relative", display: "inline-flex", width: "10px", height: "10px", borderRadius: "50%", background: "#16a34a" }}></span>
                        </span>
                        <h3 className="card-header-title" style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Nhật Ký Giao Dịch Gần Đây (Live Transaction Stream 🟢)
                        </h3>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Tự động đồng bộ nguyên bản thời gian thực từ Supabase Database ({orders.length} đơn)
                      </p>
                    </div>
                    <Link href="/admin/orders" className="btn-add-product-green" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Xem Tất Cả {orders.length} Đơn Hàng <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Thời Gian</th>
                      <th>Khách Hàng</th>
                      <th>Số Điện Thoại</th>
                      <th>Thanh Toán</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                      <th style={{ textAlign: "center" }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrdersStream.slice(0, 10).map((ord) => (
                      <tr key={ord.id}>
                        <td><strong style={{ color: "#0f172a" }}>{ord.id}</strong></td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{ord.date}</td>
                        <td><strong>{ord.recipientName}</strong></td>
                        <td style={{ fontSize: "12px" }}>{ord.recipientPhone}</td>
                        <td>
                          <span
                            style={{
                              background: ord.paymentMethod.includes("VietQR")
                                ? "#e8f5e9"
                                : ord.paymentMethod.includes("MoMo")
                                ? "#e0f2fe"
                                : "#fef3c7",
                              color: ord.paymentMethod.includes("VietQR")
                                ? "var(--primary-color)"
                                : ord.paymentMethod.includes("MoMo")
                                ? "#0284c7"
                                : "#d97706",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: "var(--primary-color)" }}>
                          {formatVND(ord.total)}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background:
                                ord.status === "completed"
                                  ? "#dcfce7"
                                  : ord.status === "shipping"
                                  ? "#e0f2fe"
                                  : ord.status === "processing"
                                  ? "#fef3c7"
                                  : ord.status === "pending"
                                  ? "#f1f5f9"
                                  : "#fee2e2",
                              color:
                                ord.status === "completed"
                                  ? "#166534"
                                  : ord.status === "shipping"
                                  ? "#0369a1"
                                  : ord.status === "processing"
                                  ? "#b45309"
                                  : ord.status === "pending"
                                  ? "#475569"
                                  : "#991b1b",
                            }}
                          >
                            {ord.statusText}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Link
                            href="/admin/orders"
                            style={{
                              padding: "4px 8px",
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "1px solid #bfdbfe",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" /> Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
