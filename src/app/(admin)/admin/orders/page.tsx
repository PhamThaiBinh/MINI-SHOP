"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fixImagePath } from "@/lib/utils";
import { getAllOrders, updateOrderStatus, UnifiedOrder } from "@/utils/orderStorage";
import { fetchAdminOrders, updateAdminOrderStatus } from "@/lib/supabaseAdmin";
import { createClient } from "@/utils/supabase/client";

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
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
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
        return <span className="status-pill status-pending">⏳ Chờ xác nhận</span>;
      case "processing":
        return <span className="status-pill status-processing">📦 Chờ lấy hàng</span>;
      case "shipping":
        return <span className="status-pill status-shipping">🚚 Đang giao hàng</span>;
      case "completed":
        return <span className="status-pill status-completed">✅ Đã hoàn thành</span>;
      case "cancelled":
        return <span className="status-pill status-cancelled">❌ Đã hủy đơn</span>;
      default:
        return null;
    }
  };

  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("📦 Hết hàng trong kho");
  const [cancelReasonCustom, setCancelReasonCustom] = useState("");

  const handleOpenCancelModal = (id: string) => {
    setCancelOrderId(id);
    setCancelReasonPreset("📦 Hết hàng trong kho");
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
      .update({ status: "cancelled", status_text: "❌ Đã hủy đơn", cancel_reason: finalReason })
      .eq("id", cancelOrderId);

    setShowCancelModal(false);
    setCancelOrderId(null);
    await loadData();
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

    return matchesTab && matchesSearch && matchesPayment;
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

  const handleCancelOrder = async (id: string) => {
    if (confirm("⚠️ Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      setLoading(true);
      await updateAdminOrderStatus(id, "cancelled");
      await loadData();
    }
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
            title="Quản Lý Đơn Hàng System"
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
                Đang giao{" "}
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
            <div className="dashboard-card">
              <div
                className="card-header-row"
                style={{ flexWrap: "wrap", gap: "12px" }}
              >
                <h2 className="card-header-title">
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
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "12px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    />
                  </div>
                  <button
                    className="select-filter-sm"
                    style={{
                      cursor: "pointer",
                      background: "#15803d",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                    }}
                  >
                    📥 Xuất File Excel
                  </button>
                </div>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã Đơn Hàng</th>
                    <th>Khách Hàng</th>
                    <th>Sản Phẩm Đặt</th>
                    <th>Tổng Tiền</th>
                    <th>Thanh Toán</th>
                    <th>Trạng Thái</th>
                    <th style={{ textAlign: "center" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
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
                            src={fixImagePath(order.items[0]?.image || "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp")}
                            width="32"
                            height="32"
                            style={{
                              borderRadius: "4px",
                              objectFit: "cover",
                            }}
                            alt={order.items[0]?.name || "Sản phẩm"}
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
                      <td style={{ textAlign: "center" }}>
                        {order.status === "pending" && (
                          <button
                            className="btn-action-edit"
                            onClick={() => handleApproveOrder(order.id)}
                          >
                            ✓ Duyệt đơn
                          </button>
                        )}
                        {order.status === "processing" && (
                          <button
                            className="btn-action-edit"
                            onClick={() => handleShipOrder(order.id)}
                          >
                            🚚 Giao ĐVVC
                          </button>
                        )}
                        {order.status === "shipping" && (
                          <button
                            className="btn-action-edit"
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            ✅ Đã giao
                          </button>
                        )}
                        {order.status !== "completed" && order.status !== "cancelled" && (
                          <button
                            className="btn-action-delete"
                            onClick={() => handleOpenCancelModal(order.id)}
                            style={{ marginLeft: "4px" }}
                          >
                            ❌ Hủy đơn
                          </button>
                        )}
                        <button
                          className="btn-action-edit"
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            borderColor: "#cbd5e1",
                            color: "#475569",
                            marginLeft: "4px",
                          }}
                        >
                          👁️ Chi tiết
                        </button>
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
                  <span>Hiển thị:</span>
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
                    <option value={10}>10 đơn / trang</option>
                    <option value={25}>25 đơn / trang</option>
                    <option value={50}>50 đơn / trang</option>
                  </select>
                  <span>
                    Hiển thị {filteredOrders.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0} -{" "}
                    {Math.min(safeCurrentPage * pageSize, filteredOrders.length)} / tổng {filteredOrders.length} đơn hàng
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
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "550px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
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
                style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}
              >
                Chi Tiết Đơn Hàng #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
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
                      color: "var(--primary-color)",
                      fontWeight: 700,
                    }}
                  >
                    {selectedOrder.statusText}
                  </span>
                </div>
              </div>
              <div>
                <strong>Địa chỉ giao hàng:</strong> {selectedOrder.address}
              </div>
              <div style={{ marginTop: "4px" }}>
                <strong>📌 Ghi chú vận chuyển / Mã vận đơn:</strong>
                <input
                  type="text"
                  placeholder="Nhập mã vận đơn hoặc ghi chú kho (VD: GHTK-882910)..."
                  defaultValue={selectedOrder.cancelReason && !selectedOrder.cancelReason.startsWith("Khách") ? selectedOrder.cancelReason : ""}
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
                    width: "100%",
                    marginTop: "4px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <strong>Sản phẩm đặt mua:</strong>
                <div
                  style={{
                    marginTop: "6px",
                    padding: "10px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>
                        • {it.name} (x{it.qty})
                      </span>
                      <span>{(it.price * it.qty).toLocaleString("vi-VN")}đ</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginTop: "8px",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "10px",
                }}
              >
                <span>TỔNG TIỀN THANH TOÁN:</span>
                <span style={{ color: "var(--primary-color)" }}>
                  {selectedOrder.total.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            <div
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
                }}
              >
                🖨️ In Hóa Đơn A4
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
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              ❌ Ghi Nhận Lý Do Hủy Đơn Hàng
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              Vui lòng chọn hoặc nhập lý do hủy đơn để thông báo cho khách hàng:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {[
                "📦 Hết hàng trong kho",
                "📞 Không liên lạc được với khách hàng",
                "👤 Khách hàng yêu cầu hủy đơn",
                "📍 Địa chỉ giao hàng không hợp lệ",
                "❓ Lý do khác",
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
