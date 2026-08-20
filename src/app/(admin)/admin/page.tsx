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

  return (
    <div className="admin-wrapper">
      <AdminSidebar activeMenu="overview" sidebarCollapsed={sidebarCollapsed} />

      <main className="admin-main">
        <AdminHeader
          title="Báo Cáo Quản Trị & Phân Tích Dữ Liệu Hoạt Động (Data Analytics)"
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
              {/* 1. EXECUTIVE KPI SUMMARY CARDS (4 BENTO CARDS) */}
              <div className="admin-bento-grid" style={{ marginBottom: "20px" }}>
                {/* Card 1: Net Revenue */}
                <div className="admin-card-shell">
                  <div className="admin-card-core" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Doanh Thu Thật (Completed)</div>
                      <div className="text-2xl font-black text-emerald-700 tracking-tight">
                        {formatVND(netRevenue)}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        Từ <strong className="text-slate-900">{completedOrders.length}</strong> đơn hoàn thành
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Card 2: AOV */}
                <div className="admin-card-shell">
                  <div className="admin-card-core" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giá Trị Đơn TB (AOV)</div>
                      <div className="text-2xl font-black text-sky-700 tracking-tight">
                        {formatVND(averageOrderValue)}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        Pipeline: <strong className="text-slate-900">{formatVND(grossPipeline)}</strong>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-sm">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Card 3: Fulfillment Rate */}
                <div className="admin-card-shell">
                  <div className="admin-card-core" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tỷ Lệ Chốt Đơn</div>
                      <div className="text-2xl font-black text-teal-700 tracking-tight">
                        {fulfillmentRate}%
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        <strong className="text-slate-900">{completedOrders.length}</strong> / {orders.length} đơn phát sinh
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm">
                      <Target className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Card 4: Low Stock Alert */}
                <div className="admin-card-shell">
                  <div className="admin-card-core" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hàng Tồn Thấp (&le;10)</div>
                      <div className={`text-2xl font-black tracking-tight ${lowStockProducts.length > 0 ? "text-amber-600" : "text-emerald-700"}`}>
                        {lowStockProducts.length} <span className="text-sm font-semibold">mặt hàng</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        <strong className="text-amber-700">{pendingOrders.length}</strong> đơn chờ duyệt gấp
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

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
              <div className="dashboard-card">
                <div className="card-header-row" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-header-title">Nhật Ký Giao Dịch Gần Đây (Realtime Stream)</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                      Hiển thị <strong>{Math.min(10, filteredOrdersStream.length)}/{filteredOrdersStream.length} đơn hàng</strong> mới nhất nạp từ Supabase
                    </p>
                  </div>
                  <Link href="/admin/orders" className="btn-add-product-green" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
