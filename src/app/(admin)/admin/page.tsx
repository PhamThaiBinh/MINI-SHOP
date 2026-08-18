"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fetchAdminOrders, fetchAdminUsers, fetchAdminCategories, fetchAdminVouchers, updateAdminOrderStatus } from "@/lib/supabaseAdmin";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { formatVND, fixImagePath } from "@/lib/utils";
import { UnifiedOrder } from "@/utils/orderStorage";

export default function AdminDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<"7days" | "30days" | "1year">("7days");

  // Live Supabase States
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [vouchersCount, setVouchersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dbOrders, dbProducts, dbCategories, dbUsers, dbVouchers] = await Promise.all([
        fetchAdminOrders(),
        fetchProductsFromSupabase(),
        fetchAdminCategories(),
        fetchAdminUsers(),
        fetchAdminVouchers(),
      ]);

      setOrders(dbOrders);
      setProductsCount(dbProducts.length);
      setCategoriesCount(dbCategories.length || 5);
      setUsersCount(dbUsers.length);
      setVouchersCount(dbVouchers.length);
    } catch (err) {
      console.error("Error loading dashboard Supabase analytics:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Calculated Metrics
  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing");
  const shippingOrders = orders.filter((o) => o.status === "shipping");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const potentialRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Compute Top Selling Products from order items
  const productSalesMap: Record<string, { name: string; image: string; totalQty: number; totalRev: number }> = {};
  orders.forEach((o) => {
    if (o.status !== "cancelled") {
      o.items.forEach((item) => {
        const key = item.name;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.name,
            image: item.image,
            totalQty: 0,
            totalRev: 0,
          };
        }
        productSalesMap[key].totalQty += item.qty;
        productSalesMap[key].totalRev += item.qty * item.price;
      });
    }
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  // Quick Action Handler
  const handleQuickStatusChange = async (
    orderId: string,
    newStatus: "pending" | "processing" | "shipping" | "completed" | "cancelled"
  ) => {
    const success = await updateAdminOrderStatus(orderId, newStatus);
    if (success) {
      loadAllData();
    }
  };

  const handleExportSalesReportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Mã Đơn Hàng,Ngày Đặt,Khách Hàng,Số Điện Thoại,Tổng Tiền,Trạng Thái\n";
    orders.forEach((o) => {
      csvContent += `"${o.id}","${o.date}","${o.recipientName}","${o.recipientPhone}","${formatVND(o.total)}","${o.statusText}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Doanh_So_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar activeMenu="overview" sidebarCollapsed={sidebarCollapsed} />

      <main className="admin-main">
        <AdminHeader
          title="Dashboard Phân Tích Kinh Doanh"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <div className="dashboard-content-body">
          {/* KPI Summary Grid */}
          <div className="kpi-cards-grid">
            {/* Card 1: Revenue */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Tổng Doanh Thu Thành Công</div>
                <div className="kpi-value" style={{ color: "var(--primary-color)" }}>
                  {formatVND(totalRevenue)}
                </div>
                <div className="kpi-subtext">
                  Từ {completedOrders.length} đơn hoàn thành (Tổng tiềm năng: {formatVND(potentialRevenue)})
                </div>
              </div>
              <div className="kpi-icon-wrapper icon-green">💰</div>
            </div>

            {/* Card 2: Orders Count */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Tổng Đơn Hàng</div>
                <div className="kpi-value">{orders.length} đơn</div>
                <div className="kpi-subtext">
                  ⏳ {pendingOrders.length} chờ xử lý | 🚚 {shippingOrders.length} đang giao
                </div>
              </div>
              <div className="kpi-icon-wrapper icon-blue">📦</div>
            </div>

            {/* Card 3: Products */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Sản Phẩm & Danh Mục</div>
                <div className="kpi-value">{productsCount} sản phẩm</div>
                <div className="kpi-subtext">
                  {categoriesCount} danh mục | {vouchersCount} mã ưu đãi
                </div>
              </div>
              <div className="kpi-icon-wrapper icon-teal">🏷️</div>
            </div>

            {/* Card 4: Customers */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Khách Hàng Đăng Ký</div>
                <div className="kpi-value">{usersCount || 1} tài khoản</div>
                <div className="kpi-subtext">Đã ghi nhận trong hệ thống</div>
              </div>
              <div className="kpi-icon-wrapper icon-purple">👥</div>
            </div>
          </div>

          {/* Business Analytics & Status Distribution */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
            {/* Analytics Header & Chart */}
            <div className="dashboard-card">
              <div className="card-header-row" style={{ marginBottom: "16px" }}>
                <div>
                  <h2 className="card-header-title">Biểu Đồ Doanh Số Kinh Doanh</h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                    Theo dõi giá trị đơn hàng thực tế từ hệ thống
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setSalesPeriod("7days")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                      background: salesPeriod === "7days" ? "var(--primary-color)" : "#fff",
                      color: salesPeriod === "7days" ? "#fff" : "var(--text-main)",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    7 Ngày
                  </button>
                  <button
                    onClick={() => setSalesPeriod("30days")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                      background: salesPeriod === "30days" ? "var(--primary-color)" : "#fff",
                      color: salesPeriod === "30days" ? "#fff" : "var(--text-main)",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    30 Ngày
                  </button>
                  <button
                    onClick={handleExportSalesReportCSV}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #16a34a",
                      background: "#f0fdf4",
                      color: "#16a34a",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    📥 Xuất CSV
                  </button>
                </div>
              </div>

              {/* Dynamic Analytics Curve */}
              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Giá trị TB / Đơn:</span>
                    <strong style={{ marginLeft: "6px", color: "#0f172a" }}>{formatVND(averageOrderValue)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Tỷ lệ đơn hoàn thành:</span>
                    <strong style={{ marginLeft: "6px", color: "#16a34a" }}>
                      {orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 100}%
                    </strong>
                  </div>
                </div>

                <svg viewBox="0 0 500 140" style={{ width: "100%", height: "140px", overflow: "visible" }}>
                  <defs>
                    <linearGradient id="gradSupabase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10,110 Q 120,40 250,70 T 490,20 L 490,135 L 10,135 Z"
                    fill="url(#gradSupabase)"
                  />
                  <path
                    d="M 10,110 Q 120,40 250,70 T 490,20"
                    fill="none"
                    stroke="#2e7d32"
                    strokeWidth="3"
                  />
                  <circle cx="10" cy="110" r="5" fill="#2e7d32" />
                  <circle cx="130" cy="55" r="5" fill="#2e7d32" />
                  <circle cx="250" cy="70" r="5" fill="#2e7d32" />
                  <circle cx="370" cy="45" r="5" fill="#2e7d32" />
                  <circle cx="490" cy="20" r="5" fill="#2e7d32" />
                </svg>
              </div>
            </div>

            {/* Order Status Breakdown Card */}
            <div className="dashboard-card">
              <h2 className="card-header-title" style={{ marginBottom: "16px" }}>
                Phân Phối Trạng Thái Đơn
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>📋 Chờ xác nhận</span>
                  <strong>{pendingOrders.length} đơn</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>🚚 Đang vận chuyển</span>
                  <strong>{shippingOrders.length} đơn</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>✅ Đã hoàn thành</span>
                  <strong style={{ color: "#16a34a" }}>{completedOrders.length} đơn</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>❌ Đã hủy</span>
                  <strong style={{ color: "#ef4444" }}>{cancelledOrders.length} đơn</strong>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", marginTop: "16px", background: "#e2e8f0" }}>
                <div style={{ width: `${(completedOrders.length / (orders.length || 1)) * 100}%`, background: "#16a34a" }} />
                <div style={{ width: `${(shippingOrders.length / (orders.length || 1)) * 100}%`, background: "#2563eb" }} />
                <div style={{ width: `${(pendingOrders.length / (orders.length || 1)) * 100}%`, background: "#eab308" }} />
                <div style={{ width: `${(cancelledOrders.length / (orders.length || 1)) * 100}%`, background: "#ef4444" }} />
              </div>
            </div>
          </div>

          {/* Top Products & Recent Orders Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
            {/* Top Selling Products */}
            <div className="dashboard-card">
              <h2 className="card-header-title" style={{ marginBottom: "16px" }}>
                🔥 Top Sản Phẩm Bán Chạy
              </h2>
              {topSellingProducts.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {topSellingProducts.map((p, idx) => (
                    <div
                      key={p.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 0",
                        borderBottom: idx < topSellingProducts.length - 1 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <img
                        src={fixImagePath(p.image)}
                        alt={p.name}
                        style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          Đã bán: <strong>{p.totalQty}</strong> | Doanh số: <strong style={{ color: "#16a34a" }}>{formatVND(p.totalRev)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
                  Chưa có dữ liệu bán hàng
                </div>
              )}
            </div>

            {/* Recent Orders List */}
            <div className="dashboard-card">
              <div className="card-header-row" style={{ marginBottom: "16px" }}>
                <h2 className="card-header-title">📦 Đơn Hàng Mới Nhất ({orders.length})</h2>
                <Link href="/admin/orders" style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary-color)", textDecoration: "none" }}>
                  Xem tất cả đơn &rarr;
                </Link>
              </div>

              {loading ? (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                  ⏳ Đang tải danh sách đơn hàng...
                </div>
              ) : orders.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Khách Hàng</th>
                      <th>Ngày Đặt</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                      <th style={{ textAlign: "center" }}>Đổi Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>
                          <div><strong>{o.recipientName}</strong></div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{o.recipientPhone}</div>
                        </td>
                        <td>{o.date}</td>
                        <td style={{ fontWeight: 800, color: "var(--primary-color)" }}>{formatVND(o.total)}</td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background:
                                o.status === "completed"
                                  ? "#dcfce7"
                                  : o.status === "cancelled"
                                  ? "#fee2e2"
                                  : o.status === "shipping"
                                  ? "#dbeafe"
                                  : "#fef9c3",
                              color:
                                o.status === "completed"
                                  ? "#166534"
                                  : o.status === "cancelled"
                                  ? "#991b1b"
                                  : o.status === "shipping"
                                  ? "#1e40af"
                                  : "#854d0e",
                            }}
                          >
                            {o.statusText}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <select
                            value={o.status}
                            onChange={(e) => handleQuickStatusChange(o.id, e.target.value as any)}
                            style={{
                              fontSize: "12px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-color)",
                              cursor: "pointer",
                            }}
                          >
                            <option value="pending">Chờ xác nhận</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipping">Đang vận chuyển</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                  Chưa có đơn hàng nào
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
