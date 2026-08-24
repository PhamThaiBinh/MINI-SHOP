"use client";

import { IconDownload, IconPrinter } from "@/components/common/Icons";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fixImagePath } from "@/lib/utils";
import { type UnifiedOrder } from "@/utils/orderStorage";
import { fetchAdminOrders, updateAdminOrderStatus } from "@/lib/supabaseAdmin";
import { createClient } from "@/utils/supabase/client";
import { Check, Truck, CheckCircle2, XCircle, Clock, Printer, Eye, X, Zap, AlertTriangle, Package, RotateCcw } from "lucide-react";

interface OrderItem {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  productImg: string;
  productName: string;
  productQty: number;
  totalPrice: number;
  paymentMethod: string;
  paymentBadgeClass: string;
  status: "pending" | "processing" | "shipping" | "completed" | "returned" | "cancelled";
  address: string;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "MS-9824",
    date: "10/08/2026 14:20",
    customerName: "Nguyễn Văn An",
    customerPhone: "0901 234 567",
    productImg:
      "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    productName: "Sofa Vải Nordic",
    productQty: 1,
    totalPrice: 2990000,
    paymentMethod: "VietQR 10s",
    paymentBadgeClass: "badge-visible",
    status: "pending",
    address: "123 Nguyễn Trãi, Q.1, TP.HCM",
  },
  {
    id: "MS-9823",
    date: "10/08/2026 11:05",
    customerName: "Trần Thị Mai",
    customerPhone: "0988 765 432",
    productImg:
      "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
    productName: "Bàn Ăn Gỗ Sồi",
    productQty: 1,
    totalPrice: 3490000,
    paymentMethod: "Ví MoMo",
    paymentBadgeClass: "badge-visible",
    status: "processing",
    address: "45 Lê Lợi, Q.1, TP.HCM",
  },
  {
    id: "MS-9822",
    date: "09/08/2026 16:45",
    customerName: "Lê Hoàng Nam",
    customerPhone: "0933 112 233",
    productImg:
      "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
    productName: "Đèn Tre Minimal",
    productQty: 2,
    totalPrice: 580000,
    paymentMethod: "COD (Tiền mặt)",
    paymentBadgeClass: "badge-visible",
    status: "shipping",
    address: "78 Trần Hưng Đạo, Q.5, TP.HCM",
  },
  {
    id: "MS-9821",
    date: "08/08/2026 09:15",
    customerName: "Phạm Tuyết Nhung",
    customerPhone: "0977 445 566",
    productImg:
      "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    productName: "Hộp Sơn Mài Khảm Trai",
    productQty: 1,
    totalPrice: 490000,
    paymentMethod: "Ví ZaloPay",
    paymentBadgeClass: "badge-visible",
    status: "completed",
    address: "12 Nguyễn Thị Minh Khai, Q.3, TP.HCM",
  },
  {
    id: "MS-9820",
    date: "07/08/2026 20:10",
    customerName: "Hoàng Quốc Bảo",
    customerPhone: "0912 889 900",
    productImg:
      "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp",
    productName: "Kệ Gỗ Trang Trí",
    productQty: 1,
    totalPrice: 890000,
    paymentMethod: "COD (Tiền mặt)",
    paymentBadgeClass: "badge-visible",
    status: "cancelled",
    address: "99 Phạm Văn Đồng, Q. Gò Vấp, TP.HCM",
  },
];

export default function AdminOrdersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // BUG 5 FIX: Date Range Filter States
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const handleBulkApprove = async () => {
    if (selectedOrderIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 đơn hàng để duyệt!");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn duyệt ${selectedOrderIds.length} đơn hàng đã chọn sang trạng thái "Chờ lấy hàng" không?`)) {
      setLoading(true);
      for (const id of selectedOrderIds) {
        await updateAdminOrderStatus(id, "processing");
      }
      setSelectedOrderIds([]);
      await loadData();
    }
  };

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdminOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("ordersUpdated", loadData);
    return () => window.removeEventListener("ordersUpdated", loadData);
  }, []);

  const getStatusPill = (status: UnifiedOrder["status"]) => {
    switch (status) {
      case "pending":
        return <span className="status-pill status-pending" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}><Clock className="w-3.5 h-3.5" /> Chờ xác nhận</span>;
      case "processing":
        return <span className="status-pill status-processing" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}><Package className="w-3.5 h-3.5" /> Chờ lấy hàng</span>;
      case "shipping":
        return <span className="status-pill status-shipping" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}><Truck className="w-3.5 h-3.5" /> Đang giao hàng</span>;
      case "completed":
        return <span className="status-pill status-completed" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}><CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành</span>;
      case "cancelled":
        return <span className="status-pill status-cancelled" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}><XCircle className="w-3.5 h-3.5" /> Đã hủy</span>;
      case "returned":
        return <span className="status-pill" style={{ background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa", padding: "4px 10px", borderRadius: "999px", fontWeight: 800, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}><RotateCcw className="w-3.5 h-3.5 text-orange-600" /> Trả hàng (7 ngày)</span>;
      default:
        return <span className="status-pill status-pending" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}><Clock className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("Hết hàng trong kho");
  const [cancelReasonCustom, setCancelReasonCustom] = useState("");

  const handleOpenCancelModal = (id: string) => {
    setCancelOrderId(id);
    setCancelReasonPreset("Hết hàng trong kho");
    setCancelReasonCustom("");
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelOrderId) return;
    const finalReason = cancelReasonPreset.includes("Lý do khác")
      ? cancelReasonCustom.trim() || "Admin hủy đơn"
      : cancelReasonPreset;

    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: "cancelled", status_text: "Đã hủy đơn", cancel_reason: finalReason })
      .eq("id", cancelOrderId);

    setShowCancelModal(false);
    setCancelOrderId(null);
    await loadData();
  };

  const parseOrderDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split(" ")[0].split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.recipientPhone.includes(searchQuery);

    let matchesPayment = true;
    if (paymentFilter === "cod") {
      matchesPayment = order.paymentMethod.includes("COD");
    } else if (paymentFilter === "bank") {
      matchesPayment = order.paymentMethod.includes("VietQR") || order.paymentMethod.includes("Ngân hàng");
    } else if (paymentFilter === "wallet") {
      matchesPayment = order.paymentMethod.includes("MoMo") || order.paymentMethod.includes("ZaloPay") || order.paymentMethod.includes("Ví");
    }

    let matchesDate = true;
    if (fromDate || toDate) {
      const oDate = parseOrderDate(order.date);
      if (oDate) {
        if (fromDate) {
          const fDate = new Date(fromDate);
          fDate.setHours(0, 0, 0, 0);
          if (oDate < fDate) matchesDate = false;
        }
        if (toDate) {
          const tDate = new Date(toDate);
          tDate.setHours(23, 59, 59, 999);
          if (oDate > tDate) matchesDate = false;
        }
      }
    }

    return matchesTab && matchesSearch && matchesPayment && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleApproveOrder = async (id: string) => {
    setLoading(true);
    await updateAdminOrderStatus(id, "processing");
    await loadData();
  };

  const handleShipOrder = async (id: string) => {
    setLoading(true);
    await updateAdminOrderStatus(id, "shipping");
    await loadData();
  };

  const handleCompleteOrder = async (id: string) => {
    setLoading(true);
    await updateAdminOrderStatus(id, "completed");
    await loadData();
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("Không có đơn hàng nào phù hợp để xuất file!");
      return;
    }

    const headers = ["Mã Đơn Hàng", "Người Nhận", "Số Điện Thoại", "Địa Chỉ", "Tổng Tiền (VND)", "Thanh Toán", "Trạng Thái", "Ngày Đặt"];
    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${o.recipientName}"`,
      `"${o.recipientPhone}"`,
      `"${o.address ? o.address.replace(/"/g, '""') : ""}"`,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.statusText}"`,
      `"${o.date || ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Don_Hang_MINI_SHOP_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <style jsx global>{`
        .order-status-tabs {
          display: flex;
          align-items: center;
          gap: 2px;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 4px;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        .order-tab-btn {
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .order-tab-btn:hover {
          color: var(--primary-color);
          background-color: #f0fdf4;
        }
        .order-tab-btn.active {
          color: #ffffff;
          background-color: var(--primary-color);
        }
        .tab-badge {
          padding: 2px 7px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 800;
          background-color: #e2e8f0;
          color: #475569;
        }
        .order-tab-btn.active .tab-badge {
          background-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 700;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #d97706;
        }
        .status-processing {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        .status-shipping {
          background-color: #f3e8ff;
          color: #7e22ce;
        }
        .status-completed {
          background-color: #d1fae5;
          color: #047857;
        }
        .status-cancelled {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-card, #printable-invoice-card * {
            visibility: visible !important;
          }
          #printable-invoice-card {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 190mm !important;
            max-height: 270mm !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            padding: 12mm 15mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            overflow: hidden !important;
          }
          .btn-print-hide {
            display: none !important;
          }
        }
      `}</style>

      <div className="admin-wrapper">
        {/* Left Sidebar Navigation */}
        <AdminSidebar
          activeMenu="orders"
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* 2. Main Content Area */}
        <main className="admin-main">
          {/* Top Header Bar Đồng Bộ Chuẩn 3 Thông Báo & Menu Admin Interactive */}
          <AdminHeader
            title="Đơn hàng"
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Tìm theo Mã đơn, Tên KH, SĐT..."
          />

          <div className="dashboard-content-body">
            {/* Shopee Tabs Navigation */}
            <div className="order-status-tabs">
              <button
                className={`order-tab-btn ${
                  activeTab === "all" ? "active" : ""
                }`}
                onClick={() => setActiveTab("all")}
              >
                Tất cả <span className="tab-badge">{orders.length}</span>
              </button>
              <button
                className={`order-tab-btn ${
                  activeTab === "pending" ? "active" : ""
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Chờ xác nhận{" "}
                <span className="tab-badge">
                  {orders.filter((o) => o.status === "pending").length}
                </span>
              </button>
              <button
                className={`order-tab-btn ${
                  activeTab === "processing" ? "active" : ""
                }`}
                onClick={() => setActiveTab("processing")}
              >
                Chờ lấy hàng{" "}
                <span className="tab-badge">
                  {orders.filter((o) => o.status === "processing").length}
                </span>
              </button>
              <button
                className={`order-tab-btn ${
                  activeTab === "shipping" ? "active" : ""
                }`}
                onClick={() => setActiveTab("shipping")}
              >
                Chờ giao hàng{" "}
                <span className="tab-badge">
                  {orders.filter((o) => o.status === "shipping").length}
                </span>
              </button>
              <button
                className={`order-tab-btn ${
                  activeTab === "completed" ? "active" : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Đã giao{" "}
                <span className="tab-badge">
                  {orders.filter((o) => o.status === "completed").length}
                </span>
              </button>
              <button
                className={`order-tab-btn ${
                  activeTab === "returned" ? "active" : ""
                }`}
                onClick={() => setActiveTab("returned")}
              >
                Trả hàng{" "}
                <span className="tab-badge">
                  {orders.filter((o) => o.status === "returned").length}
                </span>
              </button>
              <button
                className={`order-tab-btn ${
                  activeTab === "cancelled" ? "active" : ""
                }`}
                onClick={() => setActiveTab("cancelled")}
              >
                Đã hủy{" "}
                <span className="tab-badge">
                  {orders.filter((o) => o.status === "cancelled").length}
                </span>
              </button>
            </div>

            {/* Orders Table Card */}
            <div className="admin-card-shell">
              <div className="admin-card-core">
                <div
                  className="card-header-row"
                  style={{ flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}
                >
                  <h2 className="card-header-title text-xl font-extrabold text-slate-900 tracking-tight">
                    Danh Sách Đơn Hàng Gần Đây
                  </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#f8fafc",
                      padding: "4px 8px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <label style={{ fontWeight: 700, color: "#475569" }}>
                      Từ ngày:
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "12px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    />
                    <label style={{ fontWeight: 700, color: "#475569" }}>
                      Đến ngày:
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "12px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    />
                  </div>

                  {/* Payment Method Select Filter */}
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: 800,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      borderRadius: "999px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">Tất cả thanh toán</option>
                    <option value="VietQR">Chuyển khoản VietQR</option>
                    <option value="MoMo">Ví MoMo</option>
                    <option value="ZaloPay">Ví ZaloPay</option>
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                  </select>

                  {(searchQuery || paymentFilter !== "all" || fromDate || toDate || activeTab !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setPaymentFilter("all");
                        setFromDate("");
                        setToDate("");
                        setActiveTab("all");
                      }}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fca5a5",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      title="Xóa tất cả bộ lọc"
                    >
                      <X className="w-3.5 h-3.5" /> Xóa lọc
                    </button>
                  )}

                  <button
                    onClick={handleExportCSV}
                    className="select-filter-sm"
                    style={{
                      cursor: "pointer",
                      background: "#15803d",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <IconDownload size={14} color="#ffffff" /> Xuất File Excel
                  </button>

                      {selectedOrderIds.length > 0 && (
                        <button
                          onClick={handleBulkApprove}
                          className="select-filter-sm"
                          style={{
                            cursor: "pointer",
                            background: "#1d4ed8",
                            color: "#fff",
                            border: "none",
                            fontWeight: 700,
                            marginLeft: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Zap className="w-3.5 h-3.5" /> Duyệt ({selectedOrderIds.length}) đơn đã chọn
                        </button>
                      )}
                    </div>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={paginatedOrders.length > 0 && selectedOrderIds.length === paginatedOrders.length}
                            onChange={(e) =>
                              setSelectedOrderIds(e.target.checked ? paginatedOrders.map((o) => o.id) : [])
                            }
                          />
                        </th>
                        <th>Mã Đơn Hàng</th>
                        <th>Khách Hàng</th>
                        <th>Sản Phẩm Đặt</th>
                        <th>Tổng Tiền</th>
                        <th>Thanh Toán</th>
                        <th>Trạng Thái</th>
                        <th style={{ textAlign: "center", width: "130px", minWidth: "120px" }}>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={(e) =>
                                setSelectedOrderIds((prev) =>
                                  e.target.checked ? [...prev, order.id] : prev.filter((id) => id !== order.id)
                                )
                              }
                            />
                          </td>
                          <td>
                            <strong>{order.id.startsWith("#") ? order.id : "#" + order.id}</strong>
                            <br />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text-muted)",
                              }}
                            >
                              {order.date}
                            </span>
                          </td>
                          <td>
                            <strong>{order.recipientName}</strong>
                            <br />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text-muted)",
                              }}
                            >
                              {order.recipientPhone}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <img
                                src={fixImagePath(order.items[0]?.image || "/assets/images/banner/banner-trang-chu-mini-shop.webp")}
                                width="32"
                                height="32"
                                style={{
                                  borderRadius: "4px",
                                  objectFit: "cover",
                                }}
                                alt={order.items[0]?.name || "Sản phẩm"}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
                                }}
                              />
                              <span>
                                {order.items[0]?.name || "Sản phẩm"}{" "}
                                {order.items.length > 1 ? `(+${order.items.length - 1} món khác)` : `(x${order.items[0]?.qty || 1})`}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: "var(--primary-color)" }}>
                              {order.total.toLocaleString("vi-VN")}đ
                            </strong>
                          </td>
                          <td>
                            <span
                              className="badge-visible"
                              style={{
                                background: order.paymentMethod.includes("VietQR")
                                    ? "#e8f5e9"
                                    : order.paymentMethod.includes("MoMo")
                                    ? "#e0f2fe"
                                    : order.paymentMethod.includes("ZaloPay")
                                    ? "#f3e8ff"
                                    : "#fef3c7",
                                color: order.paymentMethod.includes("VietQR")
                                    ? "var(--primary-color)"
                                    : order.paymentMethod.includes("MoMo")
                                    ? "#0284c7"
                                    : order.paymentMethod.includes("ZaloPay")
                                    ? "#7e22ce"
                                    : "#d97706",
                              }}
                            >
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td>{getStatusPill(order.status)}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                width: "115px",
                                margin: "0 auto",
                              }}
                            >
                              {order.status === "pending" && (
                                <button
                                  className="btn-action-edit"
                                  onClick={() => handleApproveOrder(order.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    height: "26px",
                                    padding: "2px 6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    width: "100%",
                                    borderRadius: "6px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <Check className="w-3 h-3" /> Duyệt đơn
                                </button>
                              )}
                              {order.status === "processing" && (
                                <button
                                  className="btn-action-edit"
                                  onClick={() => handleShipOrder(order.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    height: "26px",
                                    padding: "2px 6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    width: "100%",
                                    borderRadius: "6px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <Truck className="w-3 h-3" /> Giao ĐVVC
                                </button>
                              )}
                              {order.status === "shipping" && (
                                <button
                                  className="btn-action-edit"
                                  onClick={() => handleCompleteOrder(order.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    height: "26px",
                                    padding: "2px 6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    width: "100%",
                                    borderRadius: "6px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Đã giao
                                </button>
                              )}
                              {order.status !== "completed" && order.status !== "cancelled" && order.status !== "returned" && (
                                <button
                                  className="btn-action-delete"
                                  onClick={() => handleOpenCancelModal(order.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    height: "26px",
                                    padding: "2px 6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    width: "100%",
                                    borderRadius: "6px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <XCircle className="w-3 h-3" /> Hủy đơn
                                </button>
                              )}
                              <button
                                className="btn-action-edit"
                                onClick={() => setSelectedOrder(order)}
                                style={{
                                  borderColor: "#cbd5e1",
                                  color: "#475569",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "4px",
                                  height: "26px",
                                  padding: "2px 6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  width: "100%",
                                  borderRadius: "6px",
                                  whiteSpace: "nowrap",
                                  background: "#f8fafc",
                                }}
                              >
                                <Eye className="w-3 h-3" /> Chi tiết
                              </button>
                            </div>
                          </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-footer-row">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    color: "var(--text-muted)",
                  }}
                >
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <option value={10}>10 đơn hàng</option>
                    <option value={25}>25 đơn hàng</option>
                    <option value={50}>50 đơn hàng</option>
                  </select>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    Hiển thị {paginatedOrders.length}/{filteredOrders.length} đơn hàng
                  </span>
                </div>
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{ opacity: safeCurrentPage <= 1 ? 0.5 : 1, cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer" }}
                  >
                    &lt; Trang trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`page-btn ${p === safeCurrentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ opacity: safeCurrentPage >= totalPages ? 0.5 : 1, cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer" }}
                  >
                    Trang sau &gt;
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div
          style={{
            display: "flex",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 2500,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            id="printable-invoice-card"
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "550px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              position: "relative",
            }}
          >
            {/* Watermark Official Seal Stamp for A4 Print */}
            <div
              style={{
                position: "absolute",
                top: "24px",
                right: "60px",
                border: selectedOrder.status === "completed" || selectedOrder.status === "shipping" ? "3px double #166534" : "3px double #1e40af",
                color: selectedOrder.status === "completed" || selectedOrder.status === "shipping" ? "#166534" : "#1e40af",
                borderRadius: "8px",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "1px",
                transform: "rotate(-12deg)",
                opacity: 0.85,
                pointerEvents: "none",
                textTransform: "uppercase",
              }}
            >
              {selectedOrder.status === "completed" ? "ĐÃ THANH TOÁN" : selectedOrder.status === "cancelled" ? "ĐÃ HỦY ĐƠN" : "ĐÃ DUYỆT ĐƠN"}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}
              >
                Chi Tiết Đơn Hàng {selectedOrder.id.startsWith("#") ? selectedOrder.id : `#${selectedOrder.id}`}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="btn-print-hide">
                <button
                  className="btn-print-hide"
                  onClick={() => setSelectedOrder(null)}
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
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                fontSize: "13px",
                maxHeight: "70vh",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <strong>Tên khách hàng:</strong> {selectedOrder.recipientName}
                </div>
                <div>
                  <strong>Số điện thoại:</strong> {selectedOrder.recipientPhone}
                </div>
                <div>
                  <strong>Phương thức TT:</strong> {selectedOrder.paymentMethod}
                </div>
                <div>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    style={{
                      color: "var(--primary-color, #2e7d32)",
                      fontWeight: 800,
                    }}
                  >
                    {selectedOrder.statusText}
                  </span>
                </div>
              </div>
              <div>
                <strong>Địa chỉ giao hàng:</strong> {selectedOrder.address}
              </div>

              {/* Auto-Generated Carrier Tracking Code */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#166534", fontSize: "13px" }}>
                    <Truck className="w-4 h-4 text-emerald-700" /> Ghi chú vận chuyển / Mã vận đơn tự động:
                  </strong>
                  <span style={{ fontSize: "11px", fontWeight: 800, background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "999px" }}>
                    Tự động sinh mã
                  </span>
                </div>

                {(() => {
                  const defaultTracking = `GHTK-VN-${selectedOrder.id.replace(/[^0-9]/g, "") || "882910"}`;
                  const currentTracking = (selectedOrder.cancelReason && !selectedOrder.cancelReason.startsWith("Khách"))
                    ? selectedOrder.cancelReason.replace(/^\[Ghi chú kho\]:\s*/, "")
                    : defaultTracking;

                  return (
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="text"
                          defaultValue={currentTracking}
                          id="admin-tracking-input"
                          onBlur={(e) => {
                            const note = e.target.value.trim();
                            if (note) {
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === selectedOrder.id ? { ...o, cancelReason: `[Ghi chú kho]: ${note}` } : o
                                )
                              );
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                            borderRadius: "8px",
                            border: "1.5px solid #86efac",
                            background: "#ffffff",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                            letterSpacing: "0.02em",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("admin-tracking-input") as HTMLInputElement;
                            if (input) {
                              navigator.clipboard.writeText(input.value);
                              alert(`Đã sao chép mã vận đơn [${input.value}] vào clipboard!`);
                            }
                          }}
                          style={{
                            padding: "8px 12px",
                            background: "#166534",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Sao chép
                        </button>
                      </div>

                      {/* Carrier Quick Switch Pills */}
                      <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Đơn vị vận chuyển:</span>
                        {["GHTK", "GHN", "Viettel Post", "J&T Express", "VNPost"].map((carrier) => (
                          <button
                            key={carrier}
                            type="button"
                            onClick={() => {
                              const code = carrier === "GHTK"
                                ? `GHTK-VN-${selectedOrder.id.replace(/[^0-9]/g, "") || "882910"}`
                                : carrier === "GHN"
                                ? `GHN-${selectedOrder.id.replace(/[^0-9]/g, "") || "773912"}`
                                : carrier === "Viettel Post"
                                ? `VTP-${selectedOrder.id.replace(/[^0-9]/g, "") || "991024"}`
                                : carrier === "J&T Express"
                                ? `JNT-${selectedOrder.id.replace(/[^0-9]/g, "") || "445812"}`
                                : `VNP-${selectedOrder.id.replace(/[^0-9]/g, "") || "110293"}`;

                              const input = document.getElementById("admin-tracking-input") as HTMLInputElement;
                              if (input) input.value = code;

                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === selectedOrder.id ? { ...o, cancelReason: `[Ghi chú kho]: ${code}` } : o
                                )
                              );
                            }}
                            style={{
                              padding: "3px 8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              cursor: "pointer",
                              color: "#334155",
                            }}
                          >
                            {carrier}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Sản phẩm đặt mua - Design matching Screenshot 5 (Ring product & breakdown) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Sản phẩm đặt mua:</strong>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                    🏪 VICK Fashion Accessories / Mini Shop
                  </span>
                </div>

                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
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
                          {(it.price * it.qty).toLocaleString("vi-VN")}đ
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

                  {/* Financial Breakdown Table */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "#475569" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Tổng tiền hàng:</span>
                      <strong style={{ color: "#0f172a" }}>{(selectedOrder.subtotal || selectedOrder.total).toLocaleString("vi-VN")}đ</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Phí vận chuyển:</span>
                      <span style={{ color: (selectedOrder as any).shippingFee > 0 ? "#0f172a" : "#16a34a", fontWeight: 700 }}>
                        {(selectedOrder as any).shippingFee > 0
                          ? `${Number((selectedOrder as any).shippingFee).toLocaleString("vi-VN")}đ`
                          : "Miễn phí (0đ)"}
                      </span>
                    </div>
                    {Boolean((selectedOrder as any).shippingDiscount && Number((selectedOrder as any).shippingDiscount) > 0) && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                        <span>Ưu đãi phí vận chuyển:</span>
                        <span>-{Number((selectedOrder as any).shippingDiscount).toLocaleString("vi-VN")}đ</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
                        <span>Giảm giá / Voucher / Shopee Xu:</span>
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
                <span>THÀNH TIỀN:</span>
                <span style={{ color: "var(--primary-color, #2e7d32)", fontSize: "18px" }}>
                  {selectedOrder.total.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            <div
              className="btn-print-hide"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                onClick={() => window.print()}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Printer className="w-4 h-4" /> In Hóa Đơn A4
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-save-green"
                style={{ padding: "8px 20px" }}
              >
                Đóng Window
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Hủy Đơn Admin Ghi Nhận Lý Do */}
      {showCancelModal && (
        <div
          style={{
            display: "flex",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 3000,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <XCircle className="w-5 h-5 text-red-600" /> Ghi Nhận Lý Do Hủy Đơn Hàng
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              Vui lòng chọn hoặc nhập lý do hủy đơn để thông báo cho khách hàng:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {[
                "Hết hàng trong kho",
                "Không liên lạc được với khách hàng",
                "Khách hàng yêu cầu hủy đơn",
                "Địa chỉ giao hàng không hợp lệ",
                "Lý do khác",
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="admin_cancel_reason"
                    value={reason}
                    checked={cancelReasonPreset === reason}
                    onChange={(e) => setCancelReasonPreset(e.target.value)}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {cancelReasonPreset.includes("Lý do khác") && (
              <textarea
                placeholder="Nhập lý do cụ thể..."
                value={cancelReasonCustom}
                onChange={(e) => setCancelReasonCustom(e.target.value)}
                style={{
                  width: "100%",
                  height: "70px",
                  padding: "8px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  marginBottom: "16px",
                  fontFamily: "inherit",
                }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Xác Nhận Hủy Đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
