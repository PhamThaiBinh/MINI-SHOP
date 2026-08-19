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
} from "lucide-react";

export default function TrackOrderPage() {
  const { user } = useAuth();

  // Logged-in Customer Orders State
  const [userOrders, setUserOrders] = useState<UnifiedOrder[]>([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterKeyword, setFilterKeyword] = useState<string>("");

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

  return (
    <main className="container" style={{ padding: "40px 15px", maxWidth: "900px" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          padding: "32px 28px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {/* Page Title */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Search style={{ width: 24, height: 24, color: "var(--primary-color)" }} />
            {user ? "TOÀN BỘ ĐƠN HÀNG CỦA BẠN" : "TRA CỨU ĐƠN HÀNG NHANH"}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            {user
              ? `Xin chào ${user.name}! Dưới đây là danh sách toàn bộ đơn hàng bạn đã mua tại MINI-SHOP.`
              : "Nhập Mã đơn hàng hoặc Số điện thoại để tra cứu hành trình vận chuyển tức thì."}
          </p>
        </div>

        {/* LOGGED IN CUSTOMER VIEW */}
        {user ? (
          <div>
            {/* Customer Welcome Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "var(--primary-color)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                    {user.name} ({user.phone || user.email})
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Tổng cộng <strong>{userOrders.length} đơn hàng</strong> trong tài khoản
                  </div>
                </div>
              </div>

              <Link
                href="/products"
                className="btn-add-product-green"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  padding: "8px 16px",
                }}
              >
                <ShoppingBag className="w-4 h-4" /> Mua sắm thêm
              </Link>
            </div>

            {/* Filter Controls Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--border-color)",
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
                      padding: "6px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "1px solid",
                      borderColor: statusFilter === st.key ? "var(--primary-color)" : "#cbd5e1",
                      background: statusFilter === st.key ? "var(--primary-color)" : "#fff",
                      color: statusFilter === st.key ? "#fff" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Keyword Search Input */}
              <div style={{ position: "relative", width: "240px" }}>
                <input
                  type="text"
                  placeholder="Tìm mã đơn hoặc tên SP..."
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 30px 6px 10px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                  }}
                />
                <Search
                  style={{
                    width: 14,
                    height: 14,
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>

            {/* Orders Stream List */}
            {userOrdersLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontWeight: 700 }}>
                Đang tải toàn bộ đơn hàng của bạn...
              </div>
            ) : filteredUserOrders.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                  {filterKeyword || statusFilter !== "all"
                    ? "Không tìm thấy đơn hàng phù hợp với bộ lọc."
                    : "Bạn chưa có đơn hàng nào."}
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
                  Khám phá các sản phẩm nội thất & gia dụng tuyệt đẹp của MINI-SHOP để đặt hàng ngay!
                </p>
                <Link href="/products" className="btn-add-product-green" style={{ textDecoration: "none" }}>
                  Khám phá sản phẩm ngay
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {filteredUserOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "20px",
                      background: "#fafafa",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Header Info */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border-color)",
                        paddingBottom: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                          Đơn hàng: {ord.id}
                        </h3>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Ngày đặt: {ord.date}
                        </div>
                      </div>
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
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        {ord.statusText}
                      </span>
                    </div>

                    {/* Timeline Roadmap */}
                    {ord.status === "cancelled" ? (
                      <div
                        style={{
                          padding: "12px 16px",
                          background: "#fef2f2",
                          border: "1px solid #fca5a5",
                          borderRadius: "var(--radius-md)",
                          color: "#dc2626",
                          fontWeight: 800,
                          fontSize: "13px",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <XCircle className="w-4 h-4 text-red-600" /> ĐƠN HÀNG ĐÃ HỦY
                        {ord.cancelReason && <span style={{ fontWeight: 600 }}> - Lý do: {ord.cancelReason}</span>}
                      </div>
                    ) : (
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "8px",
                            textAlign: "center",
                          }}
                        >
                          {/* Step 1 */}
                          <div style={{ padding: "6px 2px" }}>
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background: "#15803d",
                                color: "#fff",
                                margin: "0 auto 4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "11px",
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: 700 }}>Đã Đặt</div>
                          </div>

                          {/* Step 2 */}
                          <div style={{ padding: "6px 2px" }}>
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background:
                                  ord.status === "processing" ||
                                  ord.status === "shipping" ||
                                  ord.status === "completed"
                                    ? "#15803d"
                                    : "#cbd5e1",
                                color: "#fff",
                                margin: "0 auto 4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "11px",
                              }}
                            >
                              {ord.status === "processing" ||
                              ord.status === "shipping" ||
                              ord.status === "completed" ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                "2"
                              )}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: 700 }}>Chuẩn Bị</div>
                          </div>

                          {/* Step 3 */}
                          <div style={{ padding: "6px 2px" }}>
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background:
                                  ord.status === "shipping" || ord.status === "completed"
                                    ? "#15803d"
                                    : "#cbd5e1",
                                color: "#fff",
                                margin: "0 auto 4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "11px",
                              }}
                            >
                              {ord.status === "shipping" || ord.status === "completed" ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                "3"
                              )}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: 700 }}>Vận Chuyển</div>
                          </div>

                          {/* Step 4 */}
                          <div style={{ padding: "6px 2px" }}>
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background: ord.status === "completed" ? "#15803d" : "#cbd5e1",
                                color: "#fff",
                                margin: "0 auto 4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "11px",
                              }}
                            >
                              {ord.status === "completed" ? <Check className="w-3 h-3" /> : "4"}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: 700 }}>Đã Giao</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                      {ord.items.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#fff",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={fixImagePath(it.image)}
                            alt={it.name}
                            style={{ width: "38px", height: "38px", borderRadius: "4px", objectFit: "cover" }}
                          />
                          <div style={{ flex: 1, fontSize: "13px", fontWeight: 700 }}>{it.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {it.qty} x {it.price.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recipient & Total Footer */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "12px",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                        Giao tới: <strong>{ord.recipientName}</strong> ({ord.recipientPhone}) - {ord.address}
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 900, color: "var(--primary-color)" }}>
                        Tổng tiền: {ord.total.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* GUEST (NOT LOGGED IN) LOOKUP VIEW */
          <div>
            {/* Login Suggestion Banner */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                marginBottom: "24px",
                fontSize: "13px",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Mẹo:</strong> Bạn có thể <strong>Đăng Nhập</strong> để hệ thống tự động hiển thị toàn bộ lịch sử đơn hàng mà không cần tra cứu thủ công.
                </span>
              </div>
              <Link
                href="/auth"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#fff",
                  background: "var(--primary-color)",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <LogIn className="w-3.5 h-3.5" /> Đăng Nhập Ngay
              </Link>
            </div>

            {/* Manual Search Form */}
            <form onSubmit={handleSearchOrder} style={{ marginBottom: "30px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Mã Đơn Hàng (hoặc Số Điện Thoại)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: #MS-9824"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      fontSize: "14px",
                    }}
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Số Điện Thoại Mua Hàng *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Ví dụ: 0988123456"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      fontSize: "14px",
                    }}
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "var(--primary-color)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: "15px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Search style={{ width: 16, height: 16 }} /> Tra Cứu Ngay
              </button>
            </form>

            {/* Search Results */}
            {searched && (
              <div>
                {!orderResult ? (
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "#fef2f2",
                      border: "1px solid #fca5a5",
                      borderRadius: "var(--radius-md)",
                      color: "#991b1b",
                      textAlign: "center",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Không tìm thấy thông tin đơn hàng với mã <strong>{searchCode}</strong> và SĐT{" "}
                    <strong>{searchPhone}</strong>. Vui lòng kiểm tra lại thông tin!
                  </div>
                ) : (
                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "20px",
                      background: "#fafafa",
                    }}
                  >
                    {/* Header Info */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border-color)",
                        paddingBottom: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                          Đơn hàng: {orderResult.id}
                        </h3>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Ngày đặt: {orderResult.date}
                        </div>
                      </div>
                      <span
                        style={{
                          background:
                            orderResult.status === "cancelled"
                              ? "#fee2e2"
                              : orderResult.status === "completed"
                              ? "#dcfce7"
                              : "#e0f2fe",
                          color:
                            orderResult.status === "cancelled"
                              ? "#dc2626"
                              : orderResult.status === "completed"
                              ? "#15803d"
                              : "#0369a1",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        {orderResult.statusText}
                      </span>
                    </div>

                    {/* Status Content or Timeline Roadmap */}
                    {orderResult.status === "cancelled" ? (
                      <div
                        style={{
                          padding: "16px 20px",
                          background: "#fef2f2",
                          border: "1px solid #fca5a5",
                          borderRadius: "var(--radius-md)",
                          color: "#dc2626",
                          fontWeight: 800,
                          fontSize: "14px",
                          textAlign: "center",
                          marginBottom: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <XCircle className="w-5 h-5 text-red-600" /> ĐƠN HÀNG ĐÃ BỊ HỦY BỎ
                        {orderResult.cancelReason && (
                          <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "6px", color: "#991b1b" }}>
                            Lý do hủy: {orderResult.cancelReason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Truck className="w-4 h-4 text-emerald-700" /> Lộ Trình Giao Hàng:
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "8px",
                            position: "relative",
                            textAlign: "center",
                          }}
                        >
                          {/* Step 1 */}
                          <div style={{ padding: "10px 4px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "#15803d",
                                color: "#fff",
                                margin: "0 auto 6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "12px",
                              }}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 700 }}>Đã Đặt Hàng</div>
                          </div>

                          {/* Step 2 */}
                          <div style={{ padding: "10px 4px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "#15803d",
                                color: "#fff",
                                margin: "0 auto 6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "12px",
                              }}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 700 }}>Đã Đóng Gói</div>
                          </div>

                          {/* Step 3 */}
                          <div style={{ padding: "10px 4px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background:
                                  orderResult.status === "shipping" || orderResult.status === "completed"
                                    ? "#15803d"
                                    : "#cbd5e1",
                                color: "#fff",
                                margin: "0 auto 6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "12px",
                              }}
                            >
                              {orderResult.status === "shipping" || orderResult.status === "completed"
                                ? <Check className="w-3.5 h-3.5" />
                                : "3"}
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 700 }}>Đang Vận Chuyển</div>
                          </div>

                          {/* Step 4 */}
                          <div style={{ padding: "10px 4px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: orderResult.status === "completed" ? "#15803d" : "#cbd5e1",
                                color: "#fff",
                                margin: "0 auto 6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "12px",
                              }}
                            >
                              {orderResult.status === "completed" ? <Check className="w-3.5 h-3.5" /> : "4"}
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 700 }}>Đã Giao Hàng</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recipient details */}
                    <div
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.6",
                        marginBottom: "16px",
                        background: "#fff",
                        padding: "12px 16px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <UserIcon className="w-4 h-4 text-slate-500" /> <strong>Người nhận:</strong> {orderResult.recipientName} (
                        {orderResult.recipientPhone})
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin className="w-4 h-4 text-slate-500" /> <strong>Địa chỉ giao:</strong> {orderResult.address}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CreditCard className="w-4 h-4 text-slate-500" /> <strong>Thanh toán:</strong> {orderResult.paymentMethod}
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ fontSize: "13px", fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Package className="w-4 h-4 text-emerald-700" /> Sản Phẩm Trong Đơn:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                      {orderResult.items.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#fff",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={fixImagePath(it.image)}
                            alt={it.name}
                            style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }}
                          />
                          <div style={{ flex: 1, fontSize: "13px", fontWeight: 700 }}>{it.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {it.qty} x {it.price.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "var(--primary-color)",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "12px",
                      }}
                    >
                      <span>Tổng tiền thanh toán:</span>
                      <span>{orderResult.total.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
