"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/styles/checkout.css";
import "@/styles/cart.css";
import { useCart } from "@/context/CartContext";
import { useAuth, PlacedOrder } from "@/context/AuthContext";
import { formatVND, fixImagePath } from "@/lib/utils";
import { fetchAdminVouchers } from "@/lib/supabaseAdmin";
import { fetchUserAddressesFromSupabase } from "@/lib/supabaseAddress";
import { formatFullTimestamp, UnifiedOrder } from "@/utils/orderStorage";
import { createOrderInSupabase } from "@/lib/supabaseOrders";
import { CreditCard, ShieldCheck, ShoppingCart, MapPin, Ticket, Gift, Home, CheckCircle2, AlertTriangle, Check, X, Printer, Clock, ArrowRight } from "lucide-react";

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
  const [fullname, setFullname] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Auto-sync user information & default address from Supabase when user loads
  React.useEffect(() => {
    if (user) {
      if (user.name) setFullname(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);

      fetchUserAddressesFromSupabase(user.username || user.email).then((addrs) => {
        if (addrs && addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setAddress(`${defaultAddr.detail}, ${defaultAddr.ward}, ${defaultAddr.province}`);
            if (defaultAddr.name && !user.name) setFullname(defaultAddr.name);
            if (defaultAddr.phone && !user.phone) setPhone(defaultAddr.phone);
          }
        }
      });
    }
  }, [user]);

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
  const [ineligibleModalInfo, setIneligibleModalInfo] = useState<{
    code: string;
    minOrder: number;
    missingAmount: number;
  } | null>(null);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  const [systemCoupons, setSystemCoupons] = useState<Coupon[]>([]);

  React.useEffect(() => {
    fetchAdminVouchers().then((vouchers) => {
      const sys = vouchers
        .filter((v) => v.isActive)
        .map((v) => ({
          code: v.code,
          percent: v.percent,
          fixedDiscount: v.fixedDiscount,
          desc: v.desc,
          minOrder: v.minOrder,
        }));
      setSystemCoupons(sys);
    });
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

  const isFreeShip = subtotal >= 500000;
  const shippingFee = isFreeShip
    ? 0
    : address.toLowerCase().includes("hà nội") ||
      address.toLowerCase().includes("hồ chí minh") ||
      address.toLowerCase().includes("hcm")
    ? 20000
    : 30000;

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

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
      // REQUIREMENT: Check minOrder
      if (found.minOrder && subtotal < found.minOrder) {
        const missing = found.minOrder - subtotal;
        setIneligibleModalInfo({
          code: found.code,
          minOrder: found.minOrder,
          missingAmount: missing,
        });
        setVoucherMsg(
          `Bạn chưa đủ điều kiện để áp mã. Bạn cần đặt thêm ${formatVND(missing)} để có thể áp được mã giảm.`
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
      setVoucherMsg(`Áp dụng thành công mã ${found.code} (${label})`);
      setShowCouponModal(false);
    } else {
      setVoucherMsg("Mã ưu đãi không hợp lệ hoặc không có trong Kho quà!");
    }
  };

  // Re-validate applied voucher when cart subtotal changes
  React.useEffect(() => {
    if (appliedVoucher && appliedVoucher.minOrder && subtotal < appliedVoucher.minOrder) {
      const kickedCode = appliedVoucher.code;
      const requiredMin = appliedVoucher.minOrder;
      setAppliedVoucher(null);
      setVoucherCode("");
      try {
        localStorage.removeItem("mini_shop_applied_coupon");
      } catch (e) {
        console.error(e);
      }
      setVoucherMsg(
        `⚠️ Mã ${kickedCode} đã tự động bị hủy do giá trị đơn hàng (${formatVND(subtotal)}) không còn đủ điều kiện tối thiểu ${formatVND(requiredMin)}.`
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
          setVoucherMsg(`Áp dụng thành công mã ${found.code} (${label})`);
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
      statusText: "Đang xử lý đơn hàng",
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
      id: finalCode,
      date: fullDateStr,
      status: "processing",
      statusText: "Đang xử lý đơn hàng",
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
      username: user?.username || "binh",
    };

    addPlacedOrder(placedOrderRecord);
    
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
      alert("Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam chuẩn 10 chữ số (đầu 03, 05, 07, 08, 09).");
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
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="container" style={{ padding: "30px 16px 60px" }}>
        {/* Header Title Section */}
        <div style={{ marginBottom: "28px", textAlign: "left" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Thanh toán & Đặt hàng
          </h1>
        </div>

        {/* Empty Cart Warning */}
        {cart.length === 0 && !showSuccessModal ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-color, #e2e8f0)",
              borderRadius: "1.75rem",
              padding: "64px 20px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <ShoppingCart className="w-10 h-10 text-slate-400" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              Giỏ hàng của bạn đang trống!
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "480px", margin: "0 auto 24px" }}>
              Vui lòng chọn sản phẩm vào giỏ hàng trước khi tiến hành đặt hàng.
            </p>
            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary-color, #2e7d32)",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
              }}
            >
              <span>Khám phá sản phẩm ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* 2-Column Checkout Layout */
          <form className="checkout-layout" onSubmit={handleSubmitOrder}>
              {/* Left Column: Shipping Info & Payment Methods */}
              <div className="checkout-form-card">
                <div>
                  <h2 className="form-section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin className="w-5 h-5 text-emerald-700" /> Thông tin giao hàng
                  </h2>

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
                  <h2 className="form-section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CreditCard style={{ width: 20, height: 20, color: "var(--primary-color)" }} /> Phương thức thanh toán
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
                        }}
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
                  <strong style={{ color: isFreeShip ? "var(--primary-color)" : "#334155" }}>
                    {isFreeShip ? "Miễn phí" : formatVND(shippingFee)}
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
                    <label className="coupon-label-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Ticket className="w-4 h-4 text-emerald-700" /> Mã ưu đãi:
                    </label>
                    <button
                      type="button"
                      className="btn-kho-qua-pill"
                      onClick={() => setShowCouponModal(true)}
                      title="Mở danh sách mã ưu đãi & quà đã đổi"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Gift className="w-3.5 h-3.5" /> Chọn từ Kho Quà ({totalAvailableItemsCount})
                    </button>
                  </div>
                  <div className="coupon-box">
                    <input
                      type="text"
                      placeholder="Nhập hoặc chọn mã..."
                      style={{ textTransform: "uppercase" }}
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
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
                        color: !voucherMsg.includes("không") && !voucherMsg.includes("Không")
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
                {grandTotal === 0 && discountAmount > 0 && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#dcfce7",
                      border: "1px solid #86efac",
                      borderRadius: "6px",
                      color: "#166534",
                      fontWeight: 800,
                      fontSize: "12px",
                      textAlign: "center",
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Gift className="w-4 h-4 text-emerald-600" /> Đơn hàng của bạn được miễn phí 100% nhờ Voucher!
                  </div>
                )}

                <button type="submit" className="btn-place-order" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <ShoppingCart className="w-5 h-5" /> ĐẶT HÀNG NGAY
                </button>
              </aside>
            </form>
          )}
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
            <div className="qr-timer-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Clock className="w-4 h-4 text-emerald-700" /> Tự động hoàn tất sau <span>{qrCountdown}</span> giây
            </div>
          </div>
        </div>
      )}

      {/* Success Order Modal Popup */}
      {showSuccessModal && (
        <div className="modal-overlay active" id="order-success-modal">
          <div className="modal-card">
            <div className="success-icon-box" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="modal-title">Đặt Hàng Thành Công!</h2>
            <p className="modal-desc">
              Cảm ơn <strong>{fullname}</strong> đã mua sắm tại <strong>Mini Shop</strong>. Đơn hàng của bạn
              đã được ghi nhận và đang được xử lý giao hàng.
            </p>
            <div>Mã đơn hàng của bạn:</div>
            <div className="order-code-badge">{orderCode}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <Link
                href="/"
                className="btn-checkout"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  width: "auto",
                  padding: "12px 24px",
                }}
              >
                <Home className="w-4 h-4" /> Quay Về Trang Chủ
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "12px 20px",
                  borderColor: "var(--primary-color)",
                  color: "var(--primary-color)",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <Printer className="w-4 h-4" /> In / Lưu Biên Nhận
              </button>
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
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Ticket className="w-5 h-5 text-emerald-700" /> Kho Mã Ưu Đãi & Quà Đã Đổi của {user?.name || "bạn"}
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
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
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
                          {coupon.isRedeemed ? (
                            <span
                              style={{
                                background: "var(--primary-color)",
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <Gift className="w-3 h-3" /> Quà đã đổi
                            </span>
                          ) : coupon.minOrder && subtotal < coupon.minOrder ? (
                            <span
                              style={{
                                background: "#fffbeb",
                                color: "#b45309",
                                fontSize: "10.5px",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "4px",
                                border: "1px solid #fde68a",
                              }}
                            >
                              Thiếu {formatVND(coupon.minOrder - subtotal)}
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#166534",
                                fontSize: "10.5px",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              Đủ điều kiện
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
                          {coupon.desc} {coupon.minOrder && coupon.minOrder > 0 ? `(Đơn từ ${formatVND(coupon.minOrder)})` : ""}
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
                            : coupon.minOrder && subtotal < coupon.minOrder
                            ? "#94a3b8"
                            : "var(--primary-color)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {appliedVoucher?.code === coupon.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Đã chọn
                        </>
                      ) : (
                        "Dùng Mã"
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Centered Ineligible Alert Modal on Checkout */}
      {ineligibleModalInfo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIneligibleModalInfo(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "36px 28px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1.5px solid #fee2e2",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "#fff1f2",
                color: "#e11d48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: "28px",
              }}
            >
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.02em" }}>
              Chưa Đủ Điều Kiện Áp Dụng Mã
            </h3>

            <p style={{ fontSize: "14.5px", color: "#475569", lineHeight: 1.6, marginBottom: "24px" }}>
              Bạn chưa đủ điều kiện để áp mã <strong style={{ color: "#0f172a" }}>{ineligibleModalInfo.code}</strong>.<br />
              Bạn cần đặt thêm{" "}
              <strong style={{ color: "#dc2626", fontSize: "16px", fontWeight: 900 }}>
                {formatVND(ineligibleModalInfo.missingAmount)}
              </strong>{" "}
              để có thể áp được mã giảm (Đơn tối thiểu {formatVND(ineligibleModalInfo.minOrder)}).
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setIneligibleModalInfo(null)}
                style={{
                  padding: "11px 22px",
                  borderRadius: "999px",
                  background: "#f1f5f9",
                  color: "#334155",
                  fontWeight: 800,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Đã hiểu
              </button>
              <Link
                href="/products"
                style={{
                  padding: "11px 22px",
                  borderRadius: "999px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
                }}
                onClick={() => setIneligibleModalInfo(null)}
              >
                <ShoppingCart className="w-4 h-4" /> Mua Thêm Sản Phẩm
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
