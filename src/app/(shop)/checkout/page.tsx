"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/styles/checkout.css";
import "@/styles/cart.css";
import { useCart } from "@/context/CartContext";
import { useAuth, PlacedOrder } from "@/context/AuthContext";
import { formatVND, fixImagePath } from "@/lib/utils";
import { getSystemVouchers } from "@/utils/voucherStorage";
import { addPlacedOrder as addUnifiedPlacedOrder, formatFullTimestamp, UnifiedOrder } from "@/utils/orderStorage";
import { createOrderInSupabase } from "@/lib/supabaseOrders";

interface Coupon {
  code: string;
  percent?: number;
  fixedDiscount?: number;
  desc: string;
  minOrder?: number;
  isRedeemed?: boolean;
  quantity?: number;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, consumeVoucher, addPlacedOrder } = useAuth();

  // Form Fields (Pre-filled from user profile)
  const [fullname, setFullname] = useState(user?.name || "Bình Nguyễn");
  const [phone, setPhone] = useState(user?.phone || "0988.123.456");
  const [email, setEmail] = useState(user?.email || "binh.nguyen@minishop.vn");
  const [address, setAddress] = useState(
    "123 Đường Nguyễn Trãi, Thành phố Hồ Chí Minh"
  );
  const [notes, setNotes] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank" | "ewallet">(
    "cod"
  );
  const [selectedWallet, setSelectedWallet] = useState("MoMo");

  // Voucher & Kho Quà
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Coupon | null>(null);
  const [voucherMsg, setVoucherMsg] = useState("");
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  const [systemCoupons, setSystemCoupons] = useState<Coupon[]>([]);

  React.useEffect(() => {
    const sys = getSystemVouchers()
      .filter((v) => v.isActive)
      .map((v) => ({
        code: v.code,
        percent: v.percent,
        fixedDiscount: v.fixedDiscount,
        desc: v.desc,
        minOrder: v.minOrder,
      }));
    setSystemCoupons(sys);
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const activeSystemCoupons = systemCoupons.filter(
    (c) => !user?.usedSystemCoupons?.includes(c.code)
  );

  // Combined coupons (system coupons + user's redeemed vouchers from Kho Quà)
  const allAvailableCoupons: Coupon[] = [
    ...(user?.vouchers.map((v) => {
      const qty = v.quantity || 1;
      const isShipping = v.code.toUpperCase().includes("FREESHIP");
      // REQUIREMENT: Shipping voucher does NOT stack (1 per order)
      const totalDiscount = isShipping ? v.discount : v.discount * qty;
      return {
        code: v.code,
        fixedDiscount: totalDiscount,
        minOrder: v.minOrder || 0,
        desc: isShipping
          ? `Quà đã đổi: ${v.label} (Giảm ${v.discount.toLocaleString(
              "vi-VN"
            )}đ/đơn)`
          : qty > 1
          ? `Quà đã đổi: ${v.label} (Giảm gộp ${totalDiscount.toLocaleString(
              "vi-VN"
            )}đ cho ${qty} cái)`
          : `Quà đã đổi: ${v.label} (Giảm ${v.discount.toLocaleString(
              "vi-VN"
            )}đ)`,
        isRedeemed: true,
        quantity: qty,
      };
    }) || []),
    ...activeSystemCoupons,
  ];

  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.fixedDiscount) {
      discountAmount = appliedVoucher.fixedDiscount;
    } else if (appliedVoucher.percent) {
      discountAmount = (subtotal * appliedVoucher.percent) / 100;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  const totalAvailableItemsCount =
    (user?.vouchers.reduce((sum, v) => sum + (v.quantity || 1), 0) || 0) +
    activeSystemCoupons.length;

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherMsg("");
    try {
      localStorage.removeItem("mini_shop_applied_coupon");
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyVoucher = (codeToApply?: string) => {
    const targetCode = (
      codeToApply !== undefined ? codeToApply : voucherCode
    )
      .trim()
      .toUpperCase();
    if (!targetCode) {
      handleRemoveVoucher();
      return;
    }

    if (appliedVoucher?.code === targetCode) {
      handleRemoveVoucher();
      return;
    }

    const found = allAvailableCoupons.find((c) => c.code === targetCode);
    if (found) {
      // REQUIREMENT 1: Check minOrder
      if (found.minOrder && subtotal < found.minOrder) {
        setVoucherMsg(
          `⚠️ Mã này chỉ áp dụng cho đơn hàng từ ${found.minOrder.toLocaleString(
            "vi-VN"
          )}đ trở lên!`
        );
        return;
      }

      setAppliedVoucher(found);
      setVoucherCode(found.code);
      try {
        localStorage.setItem("mini_shop_applied_coupon", found.code);
      } catch (e) {
        console.error(e);
      }
      const label = found.fixedDiscount
        ? `Giảm ${found.fixedDiscount.toLocaleString("vi-VN")}đ`
        : `Giảm ${found.percent}%`;
      setVoucherMsg(`✅ Áp dụng thành công mã ${found.code} (${label})`);
      setShowCouponModal(false);
    } else {
      setVoucherMsg("❌ Mã ưu đãi không hợp lệ hoặc không có trong Kho quà!");
    }
  };

  // Re-validate applied voucher when cart subtotal changes
  React.useEffect(() => {
    if (appliedVoucher && appliedVoucher.minOrder && subtotal < appliedVoucher.minOrder) {
      setAppliedVoucher(null);
      setVoucherCode("");
      try {
        localStorage.removeItem("mini_shop_applied_coupon");
      } catch (e) {
        console.error(e);
      }
      setVoucherMsg(
        `⚠️ Mã ${appliedVoucher.code} đã bị hủy do tổng tiền đơn hàng (${subtotal.toLocaleString("vi-VN")}đ) chưa đạt mức tối thiểu ${appliedVoucher.minOrder.toLocaleString("vi-VN")}đ!`
      );
    }
  }, [subtotal, appliedVoucher]);

  React.useEffect(() => {
    try {
      const savedCode = localStorage.getItem("mini_shop_applied_coupon");
      if (savedCode) {
        const found = allAvailableCoupons.find((c) => c.code === savedCode);
        if (found) {
          if (found.minOrder && subtotal < found.minOrder) {
            localStorage.removeItem("mini_shop_applied_coupon");
            return;
          }
          setAppliedVoucher(found);
          setVoucherCode(found.code);
          const label = found.fixedDiscount
            ? `Giảm ${found.fixedDiscount.toLocaleString("vi-VN")}đ`
            : `Giảm ${found.percent}%`;
          setVoucherMsg(`✅ Áp dụng thành công mã ${found.code} (${label})`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [allAvailableCoupons, subtotal]);

  const handleCompleteOrder = async () => {
    const finalCode = orderCode || ("#MS-" + Math.floor(10000 + Math.random() * 90000));
    setOrderCode(finalCode);
    const fullDateStr = formatFullTimestamp(new Date());

    const placedOrderRecord: PlacedOrder = {
      id: finalCode,
      date: fullDateStr,
      status: "processing",
      statusText: "📦 Đang xử lý đơn hàng",
      recipientName: fullname,
      recipientPhone: phone,
      address: address,
      paymentMethod:
        paymentMethod === "cod"
          ? "COD (Thanh toán khi nhận hàng)"
          : paymentMethod === "bank"
          ? "Chuyển khoản Ngân hàng (QR)"
          : `Ví điện tử (${selectedWallet})`,
      items: cart.map((it) => ({
        name: it.product.name,
        image: fixImagePath(it.product.image),
        qty: it.quantity,
        price: it.product.price,
      })),
      subtotal: subtotal,
      discount: discountAmount,
      total: grandTotal,
    };

    const unifiedRecord: UnifiedOrder = {
      ...placedOrderRecord,
      username: user?.username || "binh",
    };

    addPlacedOrder(placedOrderRecord);
    addUnifiedPlacedOrder(unifiedRecord);
    
    // Save order synchronously to Supabase
    try {
      await createOrderInSupabase(unifiedRecord);
    } catch (err) {
      console.error("Failed to save order to Supabase:", err);
    }

    if (appliedVoucher) {
      consumeVoucher(appliedVoucher.code);
    }
    try {
      localStorage.removeItem("mini_shop_applied_coupon");
    } catch (e) {
      console.error(e);
    }
    setShowSuccessModal(true);
    clearCart();
  };

  const isValidVnPhone = (p: string) => {
    const cleanPhone = p.replace(/\s+/g, "").replace(/\./g, "");
    return /^(03|05|07|08|09)\d{8}$/.test(cleanPhone);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidVnPhone(phone)) {
      alert("⚠️ Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam chuẩn 10 chữ số (đầu 03, 05, 07, 08, 09).");
      return;
    }

    const newCode = "#MS-" + Math.floor(10000 + Math.random() * 90000);
    setOrderCode(newCode);

    if (paymentMethod === "bank") {
      setShowQrModal(true);
      setQrCountdown(10);
      let count = 10;
      const timer = setInterval(async () => {
        count--;
        setQrCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setShowQrModal(false);
          await handleCompleteOrder();
        }
      }, 1000);
    } else {
      await handleCompleteOrder();
    }
  };

  const EWALLETS = [
    { name: "MoMo", logo: "/logo/MoMo.webp" },
    { name: "ZaloPay", logo: "/logo/Zalopay.png" },
    { name: "ShopeePay", logo: "/logo/ShopeePay.webp" },
    { name: "VNPAY", logo: "/logo/VNPAY.jpg" },
    { name: "Viettel Money", logo: "/logo/Viettel Money.webp" },
    { name: "VNPT Money", logo: "/logo/VNPT Money.png" },
    { name: "PayOO", logo: "/logo/PayOO.webp" },
    { name: "9Pay", logo: "/logo/9Pay.png" },
  ];

  return (
    <main className="main-content">
      <div className="container" style={{ paddingTop: "24px" }}>
        <div className="checkout-page-section">
          <h1 className="checkout-title-heading">Thanh toán & Đặt hàng</h1>

          {/* Empty Cart Warning */}
          {cart.length === 0 && !showSuccessModal ? (
            <div className="cart-empty-box" id="checkout-empty-state">
              <div className="cart-empty-icon">🛒</div>
              <h2 className="cart-empty-title">Giỏ hàng của bạn đang trống!</h2>
              <p className="cart-empty-desc">
                Vui lòng chọn sản phẩm vào giỏ hàng trước khi tiến hành đặt hàng.
              </p>
              <Link
                href="/products"
                className="btn-checkout"
                style={{
                  display: "inline-block",
                  width: "auto",
                  padding: "12px 28px",
                }}
              >
                Khám phá sản phẩm ngay &rarr;
              </Link>
            </div>
          ) : (
            /* 2-Column Checkout Layout */
            <form className="checkout-layout" onSubmit={handleSubmitOrder}>
              {/* Left Column: Shipping Info & Payment Methods */}
              <div className="checkout-form-card">
                <div>
                  <h2 className="form-section-title">📍 Thông tin giao hàng</h2>

                  <div className="form-grid-2col">
                    <div className="form-group">
                      <label htmlFor="fullname">
                        Họ và tên <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullname"
                        className="form-control"
                        placeholder="Ví dụ: Bình"
                        required
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">
                        Số điện thoại <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="form-control"
                        placeholder="Ví dụ: 0987654321"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Địa chỉ Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="binh.nguyen@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">
                      Địa chỉ nhận hàng chi tiết <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      className="form-control"
                      placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, TP..."
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea
                      id="notes"
                      className="form-control"
                      placeholder="Ghi chú về thời gian giao hàng hoặc chỉ dẫn chi tiết..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <hr style={{ border: 0, borderTop: "1px solid var(--border-color)" }} />

                {/* Payment Method Section */}
                <div>
                  <h2 className="form-section-title">
                    💳 Phương thức thanh toán
                  </h2>
                  <div className="payment-methods-list">
                    <label
                      className={`payment-method-item ${
                        paymentMethod === "cod" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <div className="payment-method-info">
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <span>
                          Bạn chỉ thanh toán tiền mặt khi nhân viên giao hàng tới.
                        </span>
                      </div>
                    </label>

                    <label
                      className={`payment-method-item ${
                        paymentMethod === "bank" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="bank"
                        checked={paymentMethod === "bank"}
                        onChange={() => setPaymentMethod("bank")}
                      />
                      <div className="payment-method-info">
                        <strong>Chuyển khoản ngân hàng (QR Code)</strong>
                        <span>
                          Quét mã VietQR tự động thanh toán nhanh 24/7 (Đếm ngược 10s).
                        </span>
                      </div>
                    </label>

                    <div
                      className={`payment-method-item ${
                        paymentMethod === "ewallet" ? "active" : ""
                      }`}
                      style={{ flexDirection: "column", alignItems: "stretch" }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="ewallet"
                          checked={paymentMethod === "ewallet"}
                          onChange={() => setPaymentMethod("ewallet")}
                        />
                        <div className="payment-method-info">
                          <strong>
                            Ví điện tử & Cổng thanh toán Việt Nam
                          </strong>
                          <span>
                            Hỗ trợ trọn bộ 8 ví điện tử phổ biến nhất: MoMo,
                            ZaloPay, ShopeePay, VNPAY, Viettel Money, VNPT
                            Money, PayOO, 9Pay.
                          </span>
                        </div>
                      </label>

                      {/* Sub-options E-Wallet */}
                      {paymentMethod === "ewallet" && (
                        <div
                          className="ewallet-sub-options"
                          style={{ marginLeft: "30px" }}
                        >
                          {EWALLETS.map((w) => (
                            <div
                              key={w.name}
                              className={`ewallet-chip ${
                                selectedWallet === w.name ? "selected" : ""
                              }`}
                              onClick={() => setSelectedWallet(w.name)}
                            >
                              <img
                                src={w.logo}
                                alt={w.name}
                                className="ewallet-logo-img"
                              />
                              <span>{w.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <aside className="checkout-summary-card">
                <h2
                  className="summary-title"
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "#0f172a",
                    borderBottom: "2px solid var(--border-color)",
                    paddingBottom: "12px",
                  }}
                >
                  ĐƠN HÀNG CỦA BẠN
                </h2>

                {/* List of items in cart */}
                <div className="checkout-items-list">
                  {cart.map((item) => (
                    <div key={item.product.id} className="checkout-item">
                      <img
                        src={fixImagePath(item.product.image)}
                        alt={item.product.name}
                      />
                      <div>
                        <div className="checkout-item-name">
                          {item.product.name}
                        </div>
                        <div className="checkout-item-meta">
                          Số lượng: {item.quantity}
                        </div>
                      </div>
                      <div className="checkout-item-price">
                        {formatVND(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <hr
                  style={{
                    border: 0,
                    borderTop: "1px solid var(--border-color)",
                    margin: "8px 0",
                  }}
                />

                <div className="summary-row">
                  <span className="summary-label">Tạm tính:</span>
                  <strong id="checkout-subtotal">{formatVND(subtotal)}</strong>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Phí vận chuyển:</span>
                  <strong style={{ color: subtotal >= 500000 ? "var(--primary-color)" : "#334155" }}>
                    {subtotal >= 500000 ? "🎉 Miễn phí (Đơn từ 500.000đ)" : "30.000đ"}
                  </strong>
                </div>

                {appliedVoucher && (
                  <div className="summary-row">
                    <span className="summary-label">
                      Giảm giá ({appliedVoucher.code}):
                    </span>
                    <strong style={{ color: "#ef4444" }}>
                      -{formatVND(discountAmount)}
                    </strong>
                  </div>
                )}

                {/* Voucher Box */}
                <div style={{ margin: "12px 0" }}>
                  <div className="coupon-header-line">
                    <label className="coupon-label-title">
                      🎟️ Mã ưu đãi:
                    </label>
                    <button
                      type="button"
                      className="btn-kho-qua-pill"
                      onClick={() => setShowCouponModal(true)}
                      title="Mở danh sách mã ưu đãi & quà đã đổi"
                    >
                      📋 Chọn từ Kho Quà ({totalAvailableItemsCount})
                    </button>
                  </div>
                  <div className="coupon-box">
                    <input
                      type="text"
                      placeholder="Nhập hoặc chọn mã..."
                      style={{ textTransform: "uppercase" }}
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleApplyVoucher()}
                      style={{
                        padding: "8px 14px",
                        fontSize: "13px",
                        borderColor: "var(--primary-color)",
                        color: "var(--primary-color)",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Áp dụng
                    </button>
                  </div>
                  {voucherMsg && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: voucherMsg.startsWith("✅")
                          ? "#166534"
                          : "#ef4444",
                        fontWeight: 700,
                        marginTop: "4px",
                      }}
                    >
                      {voucherMsg}
                    </div>
                  )}
                </div>

                <div className="summary-row">
                  <span className="summary-label">Phí giao hàng:</span>
                  <strong style={{ color: "var(--primary-color)" }}>
                    Miễn phí
                  </strong>
                </div>

                <div
                  className="summary-row-total"
                  style={{
                    backgroundColor: "var(--primary-light)",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(46,125,50,0.2)",
                  }}
                >
                  <span
                    className="total-label"
                    style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a" }}
                  >
                    TỔNG CỘNG:
                  </span>
                  <span
                    className="total-price"
                    style={{
                      fontSize: "26px",
                      fontWeight: 900,
                      color: "var(--primary-color)",
                    }}
                  >
                    {formatVND(grandTotal)}
                  </span>
                </div>

                <button type="submit" className="btn-place-order">
                  🛍️ ĐẶT HÀNG NGAY
                </button>
              </aside>
            </form>
          )}
        </div>
      </div>

      {/* Modal QR Code */}
      {showQrModal && (
        <div className="modal-overlay active" id="qr-modal">
          <div className="qr-modal-card">
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
              Quét Mã QR Chuyển Khoản
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              Mở app ngân hàng để quét mã VietQR tự động
            </p>

            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MINISHOP_BANKS"
              alt="Mã QR Chuyển khoản"
              className="qr-code-img"
            />

            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-main)",
              }}
            >
              Đang xác nhận giao dịch...
            </div>
            <div className="qr-timer-box">
              ⏳ Tự động hoàn tất sau <span>{qrCountdown}</span> giây
            </div>
          </div>
        </div>
      )}

      {/* Success Order Modal Popup */}
      {showSuccessModal && (
        <div className="modal-overlay active" id="order-success-modal">
          <div className="modal-card">
            <div className="success-icon-box">✓</div>
            <h2 className="modal-title">Đặt Hàng Thành Công!</h2>
            <p className="modal-desc">
              Cảm ơn <strong>{fullname}</strong> đã mua sắm tại <strong>Mini Shop</strong>. Đơn hàng của bạn
              đã được ghi nhận và đang được xử lý giao hàng.
            </p>
            <div>Mã đơn hàng của bạn:</div>
            <div className="order-code-badge">{orderCode}</div>
            <div>
              <Link
                href="/"
                className="btn-checkout"
                style={{
                  display: "inline-block",
                  width: "auto",
                  padding: "12px 32px",
                }}
              >
                Về Trang Chủ Mua Sắm &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN MÃ ƯU ĐÃI & KHO QUÀ */}
      {showCouponModal && (
        <div
          id="coupon-picker-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 2500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "540px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                📋 Kho Mã Ưu Đãi & Quà Đã Đổi của {user?.name || "bạn"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
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
                padding: "20px",
                maxHeight: "420px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {allAvailableCoupons.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  Không có mã ưu đãi nào trong kho quà!
                </div>
              ) : (
                allAvailableCoupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    onClick={() => handleApplyVoucher(coupon.code)}
                    style={{
                      border:
                        appliedVoucher?.code === coupon.code
                          ? "2px solid var(--primary-color)"
                          : coupon.isRedeemed
                          ? "2px dashed var(--primary-color)"
                          : "1px dashed var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      background:
                        appliedVoucher?.code === coupon.code
                          ? "#f0fdf4"
                          : coupon.isRedeemed
                          ? "var(--primary-light)"
                          : "#ffffff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="radio"
                        name="checkout-modal-coupon"
                        checked={appliedVoucher?.code === coupon.code}
                        onChange={() => handleApplyVoucher(coupon.code)}
                        style={{
                          width: "18px",
                          height: "18px",
                          accentColor: "var(--primary-color)",
                          cursor: "pointer",
                        }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <strong
                            style={{
                              fontSize: "14px",
                              color: "var(--primary-color)",
                            }}
                          >
                            {coupon.code}
                          </strong>
                          {coupon.quantity && coupon.quantity > 1 && (
                            <sup
                              className="badge-superscript count-green"
                              style={{ fontSize: "11px", fontWeight: 800 }}
                            >
                              x{coupon.quantity}
                            </sup>
                          )}
                          {coupon.isRedeemed && (
                            <span
                              style={{
                                background: "var(--primary-color)",
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              🎁 Quà đã đổi
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {coupon.desc}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyVoucher(coupon.code);
                      }}
                      style={{
                        padding: "6px 14px",
                        background:
                          appliedVoucher?.code === coupon.code
                            ? "#15803d"
                            : "var(--primary-color)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {appliedVoucher?.code === coupon.code
                        ? "✅ Đã chọn"
                        : "Dùng Mã"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
