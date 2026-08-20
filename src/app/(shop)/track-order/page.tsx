"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatVND, fixImagePath } from "@/lib/utils";
import { UnifiedOrder } from "@/utils/orderStorage";
import { lookupOrderFromSupabase, fetchUserOrdersFromSupabase } from "@/lib/supabaseOrders";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  AlertTriangle,
  XCircle,
  Truck,
  User as UserIcon,
  MapPin,
  CreditCard,
  Package,
  Check,
  LogIn,
  ShoppingBag,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Calendar,
  ShieldCheck,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

export default function TrackOrderPage() {
  const { user } = useAuth();

  // Logged-in Customer Orders State
  const [userOrders, setUserOrders] = useState<UnifiedOrder[]>([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterKeyword, setFilterKeyword] = useState<string>("");

  // Pagination State (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Selected Order Detail Modal State
  const [selectedOrderModal, setSelectedOrderModal] = useState<UnifiedOrder | null>(null);

  // Guest Search Form State
  const [searchCode, setSearchCode] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<UnifiedOrder | null>(null);

  // Load orders if customer is logged in
  useEffect(() => {
    async function loadCustomerOrders() {
      if (user) {
        setUserOrdersLoading(true);
        const orders = await fetchUserOrdersFromSupabase(user.phone, user.email, user.username);
        setUserOrders(orders);
        setUserOrdersLoading(false);
      }
    }
    loadCustomerOrders();
  }, [user]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, filterKeyword]);

  const normalizePhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("84")) {
      cleaned = "0" + cleaned.slice(2);
    }
    return cleaned;
  };

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    const cleanCode = searchCode.trim().replace(/^#/, "");
    const cleanPhone = normalizePhone(searchPhone);

    const found = await lookupOrderFromSupabase(cleanCode, cleanPhone);
    setOrderResult(found);
    setLoading(false);
  };

  // Filter logged-in customer's orders
  const filteredUserOrders = userOrders.filter((ord) => {
    const matchStatus = statusFilter === "all" || ord.status === statusFilter;
    const kw = filterKeyword.trim().toLowerCase();
    const matchKw =
      !kw ||
      ord.id.toLowerCase().includes(kw) ||
      ord.recipientName.toLowerCase().includes(kw) ||
      ord.recipientPhone.toLowerCase().includes(kw) ||
      ord.items.some((it) => it.name.toLowerCase().includes(kw));
    return matchStatus && matchKw;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUserOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredUserOrders.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="container" style={{ padding: "30px 16px 60px" }}>
        {/* Header Directory Banner (Flush Left Aligned) */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Tra Cứu & Quản Lý Đơn Hàng
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, maxWidth: "600px" }}>
            Kiểm tra hành trình vận chuyển real-time và thông tin chi tiết các đơn hàng tại Mini Shop.
          </p>
        </div>

        {/* =========================================================================
           MAIN CONTENT AREA (LOGGED-IN CUSTOMER VS GUEST LOOKUP)
           ========================================================================= */}
        {user ? (
          <div>
            {/* Customer Status Summary Bar */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-color, #e2e8f0)",
                borderRadius: "1.25rem",
                padding: "20px 24px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(21, 128, 61, 0.2)",
                  }}
                >
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Quản Lý Đơn Hàng Của {user.name}
                  </h1>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{user.email}</span>
                    <span>•</span>
                    <span>{user.phone || "0988.123.456"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "8px 16px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#334155",
                  }}
                >
                  Tổng đơn: <strong style={{ color: "var(--primary-color, #2e7d32)" }}>{userOrders.length}</strong>
                </div>

                <Link
                  href="/products"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    padding: "9px 20px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 800,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                  }}
                >
                  <ShoppingBag className="w-4 h-4" /> Mua sắm thêm
                </Link>
              </div>
            </div>

            {/* Filter Tabs & Keyword Search Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                marginBottom: "20px",
                background: "#ffffff",
                padding: "12px 18px",
                borderRadius: "1.25rem",
                border: "1px solid var(--border-color, #e2e8f0)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              {/* Status Filter Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "pending", label: "Chờ xác nhận" },
                  { key: "processing", label: "Chờ lấy hàng" },
                  { key: "shipping", label: "Đang giao" },
                  { key: "completed", label: "Hoàn thành" },
                  { key: "cancelled", label: "Đã hủy" },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setStatusFilter(st.key)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      border: "none",
                      background: statusFilter === st.key ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                      color: statusFilter === st.key ? "#ffffff" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Keyword Search Input */}
              <div style={{ position: "relative", minWidth: "240px", flex: 1, maxWidth: "300px" }}>
                <input
                  type="text"
                  placeholder="Lọc mã đơn hoặc tên sản phẩm..."
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 36px 8px 14px",
                    fontSize: "13px",
                    borderRadius: "999px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <Search
                  style={{
                    width: 15,
                    height: 15,
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
              </div>
            </div>

            {/* SLEEK & COMPACT ORDERS LIST */}
            {userOrdersLoading ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "#64748b",
                  fontWeight: 700,
                  fontSize: "14px",
                  background: "#ffffff",
                  borderRadius: "1.25rem",
                  border: "1px solid var(--border-color, #e2e8f0)",
                }}
              >
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                Đang nạp danh sách đơn hàng...
              </div>
            ) : filteredUserOrders.length === 0 ? (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  background: "#ffffff",
                  borderRadius: "1.25rem",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  {filterKeyword || statusFilter !== "all"
                    ? "Không tìm thấy đơn hàng nào phù hợp với lọc."
                    : "Bạn chưa có đơn hàng nào."}
                </div>
                <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px", marginBottom: "20px" }}>
                  Khám phá các sản phẩm nội thất & gia dụng tuyệt đẹp để đặt sắm ngay!
                </p>
                <Link
                  href="/products"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    padding: "10px 24px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Khám phá sản phẩm ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {paginatedOrders.map((ord) => {
                    const firstItem = ord.items[0];
                    const otherItemsCount = ord.items.length - 1;
                    return (
                      <div
                        key={ord.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid var(--border-color, #e2e8f0)",
                          borderRadius: "1.25rem",
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "14px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Column 1: Order Code & Date */}
                        <div style={{ minWidth: "160px" }}>
                          <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>
                            {ord.id}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ord.date}</span>
                          </div>
                        </div>

                        {/* Column 2: Items Summary Preview */}
                        <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "12px" }}>
                          {firstItem && (
                            <img
                              src={fixImagePath(firstItem.image)}
                              alt={firstItem.name}
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid #e2e8f0",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                              {firstItem ? firstItem.name : "Sản phẩm"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                              {otherItemsCount > 0 ? `và ${otherItemsCount} sản phẩm khác` : `Số lượng: x${firstItem?.qty || 1}`}
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Status Badge */}
                        <div style={{ textAlign: "center" }}>
                          <span
                            style={{
                              background:
                                ord.status === "cancelled"
                                  ? "#fee2e2"
                                  : ord.status === "completed"
                                  ? "#dcfce7"
                                  : "#e0f2fe",
                              color:
                                ord.status === "cancelled"
                                  ? "#dc2626"
                                  : ord.status === "completed"
                                  ? "#15803d"
                                  : "#0369a1",
                              padding: "5px 12px",
                              borderRadius: "999px",
                              fontWeight: 800,
                              fontSize: "12px",
                              display: "inline-block",
                            }}
                          >
                            {ord.statusText}
                          </span>
                        </div>

                        {/* Column 4: Total Price */}
                        <div style={{ textAlign: "right", minWidth: "120px" }}>
                          <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                            {formatVND(ord.total)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{ord.paymentMethod}</div>
                        </div>

                        {/* Column 5: Action Button (Xem chi tiết) */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderModal(ord)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 16px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: 800,
                              background: "#f1f5f9",
                              color: "#0f172a",
                              border: "1px solid #cbd5e1",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Eye className="w-4 h-4 text-emerald-700" /> Xem chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION CONTROLS (10 items / page) */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "24px",
                      padding: "16px 20px",
                      background: "#ffffff",
                      borderRadius: "1.25rem",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
                      Hiển thị <strong>{(safeCurrentPage - 1) * pageSize + 1} - {Math.min(safeCurrentPage * pageSize, filteredUserOrders.length)}</strong> trên tổng số <strong>{filteredUserOrders.length} đơn hàng</strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        disabled={safeCurrentPage <= 1}
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: safeCurrentPage <= 1 ? "#cbd5e1" : "#0f172a",
                          cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" /> Trước
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => setCurrentPage(pg)}
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "8px",
                            border: pg === safeCurrentPage ? "none" : "1px solid #cbd5e1",
                            background: pg === safeCurrentPage ? "var(--primary-color, #2e7d32)" : "#ffffff",
                            color: pg === safeCurrentPage ? "#ffffff" : "#0f172a",
                            fontWeight: 800,
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          {pg}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={safeCurrentPage >= totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: safeCurrentPage >= totalPages ? "#cbd5e1" : "#0f172a",
                          cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Sau <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* -----------------------------------------------------------------------
             B. GUEST LOOKUP VIEW
             ----------------------------------------------------------------------- */
          <div>
            {/* Login Suggestion Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                border: "1px solid #bbf7d0",
                borderRadius: "1.25rem",
                padding: "16px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <span style={{ fontSize: "14px", color: "#166534", lineHeight: 1.5 }}>
                  <strong>Mẹo tiện lợi:</strong> Bạn có thể <strong>Đăng Nhập Ngay</strong> để tự động xem toàn bộ lịch sử đơn hàng mà không cần gõ mã thủ công.
                </span>
              </div>

              <Link
                href="/auth"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#ffffff",
                  background: "var(--primary-color, #2e7d32)",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  boxShadow: "0 4px 10px rgba(46, 125, 50, 0.2)",
                  whiteSpace: "nowrap",
                }}
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập
              </Link>
            </div>

            {/* Search Form Doppelrand Container */}
            <div className="doppelrand-outer" style={{ marginBottom: "28px" }}>
              <div className="doppelrand-inner" style={{ padding: "28px 32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "16px" }}>
                  Tra Cứu Nhanh Đơn Hàng
                </h2>
                <form onSubmit={handleSearchOrder}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", display: "block" }}>
                        Mã Đơn Hàng (Ví dụ: #MS-9824) *
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập mã đơn hàng..."
                        required
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          fontSize: "14px",
                          borderRadius: "0.75rem",
                          border: "1px solid var(--border-color, #cbd5e1)",
                          outline: "none",
                          boxSizing: "border-box",
                          background: "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", display: "block" }}>
                        Số Điện Thoại Mua Hàng *
                      </label>
                      <input
                        type="tel"
                        placeholder="Ví dụ: 0988123456"
                        required
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          fontSize: "14px",
                          borderRadius: "0.75rem",
                          border: "1px solid var(--border-color, #cbd5e1)",
                          outline: "none",
                          boxSizing: "border-box",
                          background: "#ffffff",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px 24px",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "999px",
                      fontSize: "15px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 6px 20px rgba(46, 125, 50, 0.2)",
                    }}
                  >
                    <Search className="w-4 h-4 text-white" />
                    <span>{loading ? "Đang Tra Cứu..." : "Tra Cứu Đơn Hàng Ngay"}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Guest Search Results Container */}
            {searched && (
              <div>
                {!orderResult ? (
                  <div
                    style={{
                      padding: "20px",
                      background: "#fef2f2",
                      border: "1px solid #fca5a5",
                      borderRadius: "1.25rem",
                      color: "#991b1b",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>
                      Không tìm thấy thông tin đơn hàng với mã <strong>{searchCode}</strong> và SĐT <strong>{searchPhone}</strong>. Vui lòng kiểm tra lại!
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      borderRadius: "1.5rem",
                      padding: "24px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                          Đơn hàng: {orderResult.id}
                        </h3>
                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                          Ngày đặt: {orderResult.date}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderModal(orderResult)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 800,
                          background: "var(--primary-color, #2e7d32)",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Eye className="w-4 h-4" /> Xem chi tiết đầy đủ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
           HIGH-END ORDER DETAIL MODAL (XEM CHI TIẾT ĐƠN HÀNG)
           ========================================================================= */}
        {selectedOrderModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "1.75rem",
                width: "100%",
                maxWidth: "720px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                  borderTopLeftRadius: "1.75rem",
                  borderTopRightRadius: "1.75rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText className="w-5 h-5 text-emerald-700" />
                    Chi Tiết Đơn Hàng {selectedOrderModal.id}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    Ngày đặt hàng: {selectedOrderModal.date}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderModal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "24px" }}>
                {/* Status Pill */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>Trạng thái đơn:</span>
                  <span
                    style={{
                      background:
                        selectedOrderModal.status === "cancelled"
                          ? "#fee2e2"
                          : selectedOrderModal.status === "completed"
                          ? "#dcfce7"
                          : "#e0f2fe",
                      color:
                        selectedOrderModal.status === "cancelled"
                          ? "#dc2626"
                          : selectedOrderModal.status === "completed"
                          ? "#15803d"
                          : "#0369a1",
                      padding: "6px 16px",
                      borderRadius: "999px",
                      fontWeight: 800,
                      fontSize: "13px",
                    }}
                  >
                    {selectedOrderModal.statusText}
                  </span>
                </div>

                {/* Timeline Stepper Roadmap */}
                {selectedOrderModal.status === "cancelled" ? (
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "#fef2f2",
                      border: "1px solid #fca5a5",
                      borderRadius: "1rem",
                      color: "#dc2626",
                      fontWeight: 800,
                      fontSize: "13px",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <div>ĐƠN HÀNG ĐÃ HỦY BỎ</div>
                      {selectedOrderModal.cancelReason && (
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#991b1b", marginTop: "2px" }}>
                          Lý do: {selectedOrderModal.cancelReason}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: "20px", background: "#f8fafc", padding: "16px", borderRadius: "1rem", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>Lộ Trình Vận Chuyển:</span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "8px",
                        textAlign: "center",
                      }}
                    >
                      {/* Step 1 */}
                      <div>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "#15803d",
                            color: "#ffffff",
                            margin: "0 auto 6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Đã Đặt</div>
                      </div>

                      {/* Step 2 */}
                      <div>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              selectedOrderModal.status === "processing" ||
                              selectedOrderModal.status === "shipping" ||
                              selectedOrderModal.status === "completed"
                                ? "#15803d"
                                : "#cbd5e1",
                            color: "#ffffff",
                            margin: "0 auto 6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "12px",
                          }}
                        >
                          {selectedOrderModal.status === "processing" ||
                          selectedOrderModal.status === "shipping" ||
                          selectedOrderModal.status === "completed" ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            "2"
                          )}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Chuẩn Bị</div>
                      </div>

                      {/* Step 3 */}
                      <div>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              selectedOrderModal.status === "shipping" ||
                              selectedOrderModal.status === "completed"
                                ? "#15803d"
                                : "#cbd5e1",
                            color: "#ffffff",
                            margin: "0 auto 6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "12px",
                          }}
                        >
                          {selectedOrderModal.status === "shipping" || selectedOrderModal.status === "completed" ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            "3"
                          )}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Vận Chuyển</div>
                      </div>

                      {/* Step 4 */}
                      <div>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: selectedOrderModal.status === "completed" ? "#15803d" : "#cbd5e1",
                            color: "#ffffff",
                            margin: "0 auto 6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "12px",
                          }}
                        >
                          {selectedOrderModal.status === "completed" ? <Check className="w-3.5 h-3.5" /> : "4"}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Giao Hàng</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipient Information Card */}
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.6,
                    marginBottom: "20px",
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "1rem",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span><strong>Người nhận:</strong> {selectedOrderModal.recipientName} ({selectedOrderModal.recipientPhone})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span><strong>Địa chỉ giao:</strong> {selectedOrderModal.address}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CreditCard className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span><strong>Thanh toán:</strong> {selectedOrderModal.paymentMethod}</span>
                  </div>
                </div>

                {/* Product Breakdown List */}
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Package className="w-4 h-4 text-emerald-700" /> Danh Sách Sản Phẩm (x{selectedOrderModal.items.length}):
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {selectedOrderModal.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "0.75rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={fixImagePath(it.image)}
                          alt={it.name}
                          style={{ width: "46px", height: "46px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }}
                        />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{it.name}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>Số lượng: x{it.qty} • Đơn giá: {formatVND(it.price)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                        {formatVND(it.price * it.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "var(--primary-color, #2e7d32)",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "16px",
                  }}
                >
                  <span>TỔNG TIỀN THANH TOÁN:</span>
                  <span>{formatVND(selectedOrderModal.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
