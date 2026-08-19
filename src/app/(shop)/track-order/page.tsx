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
  ChevronRight,
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
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        padding: "48px 16px 80px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* =========================================================================
           1. HERO SECTION & HEADER CARD (DOUBLE-BEZEL / DOPPELRAND ARCHITECTURE)
           ========================================================================= */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.03)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: "2rem",
            padding: "8px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "calc(2rem - 0.5rem)",
              padding: "40px 32px",
              color: "#ffffff",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Ambient Mesh Orb */}
            <div
              style={{
                position: "absolute",
                top: "-40px",
                right: "-40px",
                width: "220px",
                height: "220px",
                background: "radial-gradient(circle, rgba(46, 125, 50, 0.35) 0%, rgba(0,0,0,0) 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            {/* Micro Eyebrow Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 14px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#86efac",
                marginBottom: "16px",
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HỆ THỐNG TRA CỨU HÀNH TRÌNH ĐƠN HÀNG</span>
            </div>

            <h1
              style={{
                fontSize: "30px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                margin: "0 0 10px 0",
                color: "#ffffff",
              }}
            >
              {user ? `LỊCH SỬ ĐƠN HÀNG CỦA ${user.name.toUpperCase()}` : "TRA CỨU HÀNH TRÌNH ĐƠN HÀNG"}
            </h1>
            
            <p
              style={{
                fontSize: "15px",
                color: "#94a3b8",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              {user
                ? `Hệ thống tự động đồng bộ tất cả đơn hàng đã mua liên kết với tài khoản ${user.email}.`
                : "Nhập Mã đơn hàng (#MS-XXXX) và Số điện thoại mua hàng để kiểm tra lộ trình vận chuyển tức thì."}
            </p>
          </div>
        </div>

        {/* =========================================================================
           2. MAIN CONTENT AREA (LOGGED-IN CUSTOMER VS GUEST LOOKUP)
           ========================================================================= */}
        {user ? (
          /* -----------------------------------------------------------------------
             A. LOGGED-IN CUSTOMER ARCHETYPE (FULL ORDERS MANAGEMENT STREAM)
             ----------------------------------------------------------------------- */
          <div>
            {/* Customer Status Summary Bar */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                border: "1px solid var(--border-color, #e2e8f0)",
                borderRadius: "1.5rem",
                padding: "20px 24px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(21, 128, 61, 0.25)",
                  }}
                >
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
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
                  Tổng: <strong style={{ color: "var(--primary-color, #2e7d32)" }}>{userOrders.length} đơn hàng</strong>
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
                marginBottom: "24px",
                background: "#ffffff",
                padding: "14px 18px",
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
                      transition: "all 0.2s ease-[cubic-bezier(0.32,0.72,0,1)]",
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Keyword Search Input */}
              <div style={{ position: "relative", minWidth: "240px", flex: 1, maxWidth: "320px" }}>
                <input
                  type="text"
                  placeholder="Lọc mã đơn hoặc sản phẩm..."
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

            {/* Orders Stream Cards */}
            {userOrdersLoading ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "#64748b",
                  fontWeight: 700,
                  fontSize: "14px",
                  background: "#ffffff",
                  borderRadius: "1.5rem",
                  border: "1px solid var(--border-color, #e2e8f0)",
                }}
              >
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                Đang đồng bộ và nạp dữ liệu đơn hàng...
              </div>
            ) : filteredUserOrders.length === 0 ? (
              <div
                style={{
                  padding: "56px 20px",
                  textAlign: "center",
                  background: "#ffffff",
                  borderRadius: "1.5rem",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  {filterKeyword || statusFilter !== "all"
                    ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại."
                    : "Bạn chưa có đơn hàng nào tại MINI-SHOP."}
                </div>
                <p style={{ fontSize: "14px", color: "#64748b", marginTop: "6px", marginBottom: "20px" }}>
                  Hãy khám phá hàng ngàn sản phẩm nội thất & gia dụng cao cấp để mua sắm ngay!
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
                  Khám phá ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {filteredUserOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      background: "rgba(241, 245, 249, 0.7)",
                      border: "1px solid rgba(226, 232, 240, 0.9)",
                      borderRadius: "1.75rem",
                      padding: "6px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: "calc(1.75rem - 0.375rem)",
                        padding: "24px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Card Header: Order Code & Status Badge */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid #f1f5f9",
                          paddingBottom: "16px",
                          marginBottom: "20px",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                              Đơn hàng: {ord.id}
                            </h3>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: "#f1f5f9",
                                color: "#475569",
                              }}
                            >
                              {ord.paymentMethod}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ngày đặt: {ord.date}</span>
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
                            padding: "6px 16px",
                            borderRadius: "999px",
                            fontWeight: 800,
                            fontSize: "12px",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {ord.statusText}
                        </span>
                      </div>

                      {/* Stepper Roadmap / Timeline */}
                      {ord.status === "cancelled" ? (
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
                            <div>ĐƠN HÀNG ĐÃ BỊ HỦY BỎ</div>
                            {ord.cancelReason && (
                              <div style={{ fontSize: "12px", fontWeight: 600, color: "#991b1b", marginTop: "2px" }}>
                                Lý do: {ord.cancelReason}
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
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Đã Đặt Hàng</div>
                            </div>

                            {/* Step 2 */}
                            <div>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background:
                                    ord.status === "processing" || ord.status === "shipping" || ord.status === "completed"
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
                                {ord.status === "processing" || ord.status === "shipping" || ord.status === "completed" ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  "2"
                                )}
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Chuẩn Bị Hàng</div>
                            </div>

                            {/* Step 3 */}
                            <div>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background:
                                    ord.status === "shipping" || ord.status === "completed"
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
                                {ord.status === "shipping" || ord.status === "completed" ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  "3"
                                )}
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Đang Giao Hàng</div>
                            </div>

                            {/* Step 4 */}
                            <div>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background: ord.status === "completed" ? "#15803d" : "#cbd5e1",
                                  color: "#ffffff",
                                  margin: "0 auto 6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "12px",
                                }}
                              >
                                {ord.status === "completed" ? <Check className="w-3.5 h-3.5" /> : "4"}
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Hoàn Thành</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Product Items Breakdown */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                        {ord.items.map((it, idx) => (
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
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                  border: "1px solid var(--border-color, #e2e8f0)",
                                }}
                              />
                              <div>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                                  {it.name}
                                </div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                  Số lượng: x{it.qty}
                                </div>
                              </div>
                            </div>

                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                              {formatVND(it.price * it.qty)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Address & Total Footer */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "12px",
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "16px",
                        }}
                      >
                        <div style={{ fontSize: "13px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>Giao tới: <strong>{ord.recipientName}</strong> ({ord.recipientPhone}) - {ord.address}</span>
                        </div>

                        <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                          Tổng tiền: {formatVND(ord.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* -----------------------------------------------------------------------
             B. GUEST LOOKUP ARCHETYPE (DOUPLE-BEZEL SEARCH FORM & RESULTS)
             ----------------------------------------------------------------------- */
          <div>
            {/* Login Suggestion Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                border: "1px solid #bbf7d0",
                borderRadius: "1.25rem",
                padding: "16px 20px",
                marginBottom: "28px",
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
                  <strong>Mẹo tiện lợi:</strong> Bạn có thể <strong>Đăng Nhập Ngay</strong> để tự động tra cứu tất cả đơn hàng đã mua mà không cần gõ mã thủ công.
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

            {/* Double-Bezel Search Form Card */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.03)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                borderRadius: "2rem",
                padding: "8px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "calc(2rem - 0.5rem)",
                  padding: "32px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                }}
              >
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
                        }}
                      />
                    </div>
                  </div>

                  {/* Island Button Trailing Icon CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "10px 24px",
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
                      gap: "10px",
                      boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
                      transition: "all 0.3s ease-[cubic-bezier(0.32,0.72,0,1)]",
                    }}
                  >
                    <span>{loading ? "Đang Tra Cứu..." : "Tra Cứu Đơn Hàng Ngay"}</span>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Search className="w-4 h-4 text-white" />
                    </div>
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
                      background: "rgba(241, 245, 249, 0.7)",
                      border: "1px solid rgba(226, 232, 240, 0.9)",
                      borderRadius: "1.75rem",
                      padding: "6px",
                    }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: "calc(1.75rem - 0.375rem)",
                        padding: "28px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Header Info */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid #f1f5f9",
                          paddingBottom: "16px",
                          marginBottom: "20px",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                            Đơn hàng: {orderResult.id}
                          </h3>
                          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
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
                            padding: "6px 16px",
                            borderRadius: "999px",
                            fontWeight: 800,
                            fontSize: "13px",
                          }}
                        >
                          {orderResult.statusText}
                        </span>
                      </div>

                      {/* Recipient Details */}
                      <div
                        style={{
                          fontSize: "14px",
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
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          <span><strong>Người nhận:</strong> {orderResult.recipientName} ({orderResult.recipientPhone})</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span><strong>Địa chỉ giao:</strong> {orderResult.address}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CreditCard className="w-4 h-4 text-slate-500" />
                          <span><strong>Phương thức thanh toán:</strong> {orderResult.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Products */}
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Package className="w-4 h-4 text-emerald-700" /> Sản Phẩm Trong Đơn:
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                        {orderResult.items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 16px",
                              borderRadius: "0.75rem",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img
                                src={fixImagePath(it.image)}
                                alt={it.name}
                                style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                              />
                              <div>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{it.name}</div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>Số lượng: x{it.qty}</div>
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
                        <span>Tổng tiền thanh toán:</span>
                        <span>{formatVND(orderResult.total)}</span>
                      </div>
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
