"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatVND, fixImagePath } from "@/lib/utils";
import { UnifiedOrder } from "@/utils/orderStorage";
import { lookupOrderFromSupabase } from "@/lib/supabaseOrders";
import { Search, AlertTriangle, XCircle, Truck, User, MapPin, CreditCard, Package } from "lucide-react";

export default function TrackOrderPage() {
  const [searchCode, setSearchCode] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<UnifiedOrder | null>(null);

  const normalizePhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, ""); // Remove dots, spaces, dashes
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


  return (
    <main className="container" style={{ padding: "40px 15px", maxWidth: "800px" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          padding: "30px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
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
            <Search style={{ width: 22, height: 22, color: "var(--primary-color)" }} /> TRA CỨU ĐƠN HÀNG NHANH
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            Nhập Mã đơn hàng hoặc Số điện thoại để tra cứu hành trình vận chuyển tức thì.
          </p>
        </div>

        {/* Search Form */}
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
                        ✓
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
                        ✓
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
                          ? "✓"
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
                        {orderResult.status === "completed" ? "✓" : "4"}
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
                    <User className="w-4 h-4 text-slate-500" /> <strong>Người nhận:</strong> {orderResult.recipientName} (
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
    </main>
  );
}
