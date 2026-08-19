"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/cart.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatVND, fixImagePath } from "@/lib/utils";
import { getSystemVouchers } from "@/utils/voucherStorage";
import { Truck, ShieldCheck, ShoppingCart, ShoppingBag, ArrowRight } from "lucide-react";

interface Coupon {
  code: string;
  percent?: number;
  fixedDiscount?: number;
  desc: string;
  minOrder?: number;
  isRedeemed?: boolean;
  quantity?: number;
}

const AVAILABLE_COUPONS: Coupon[] = [
  { code: "DISCOUNT10", percent: 10, desc: "Giảm 10% cho tất cả đơn hàng" },
  { code: "MINISHOP20", percent: 20, desc: "Giảm 20% cho đơn hàng đầu tiên" },
  { code: "HE2026", percent: 15, desc: "Ưu đãi chào hè giảm 15%" },
];

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const [systemCoupons, setSystemCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
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
  if (appliedCoupon) {
    if (appliedCoupon.fixedDiscount) {
      discountAmount = appliedCoupon.fixedDiscount;
    } else if (appliedCoupon.percent) {
      discountAmount = (subtotal * appliedCoupon.percent) / 100;
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  const totalAvailableItemsCount =
    (user?.vouchers.reduce((sum, v) => sum + (v.quantity || 1), 0) || 0) +
    activeSystemCoupons.length;

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMsg("");
    try {
      localStorage.removeItem("mini_shop_applied_coupon");
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const targetCode = (
      codeToApply !== undefined ? codeToApply : couponCode
    )
      .trim()
      .toUpperCase();
    setCouponCode(targetCode);
    if (!targetCode) {
      handleRemoveCoupon();
      return;
    }

    if (appliedCoupon?.code.toUpperCase() === targetCode) {
      handleRemoveCoupon();
      return;
    }

    const found = allAvailableCoupons.find((c) => c.code.trim().toUpperCase() === targetCode);
    if (found) {
      // REQUIREMENT 1: Check minOrder
      if (found.minOrder && subtotal < found.minOrder) {
        setCouponMsg(
          `⚠️ Mã này chỉ áp dụng cho đơn hàng từ ${found.minOrder.toLocaleString(
            "vi-VN"
          )}đ trở lên!`
        );
        return;
      }

      setAppliedCoupon(found);
      setCouponCode(found.code);
      try {
        localStorage.setItem("mini_shop_applied_coupon", found.code);
      } catch (e) {
        console.error(e);
      }
      const label = found.fixedDiscount
        ? `Giảm ${found.fixedDiscount.toLocaleString("vi-VN")}đ`
        : `Giảm ${found.percent}%`;
      setCouponMsg(`✅ Áp dụng thành công mã ${found.code} (${label})`);
      setShowModal(false);
    } else {
      setCouponMsg("❌ Mã ưu đãi không hợp lệ hoặc không có trong Kho quà!");
    }
  };

  React.useEffect(() => {
    try {
      const savedCode = localStorage.getItem("mini_shop_applied_coupon");
      if (savedCode) {
        const found = allAvailableCoupons.find((c) => c.code === savedCode);
        if (found) {
          setAppliedCoupon(found);
          setCouponCode(found.code);
          const label = found.fixedDiscount
            ? `Giảm ${found.fixedDiscount.toLocaleString("vi-VN")}đ`
            : `Giảm ${found.percent}%`;
          setCouponMsg(`✅ Áp dụng thành công mã ${found.code} (${label})`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [systemCoupons, user]);

  return (
    <>
      <main className="main-content">
        <div className="container">
          <div className="cart-page-section">
            <h1 className="cart-title-heading">Giỏ hàng của bạn</h1>

            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="cart-empty-box" id="cart-empty-state">
                <div className="cart-empty-icon">🛒</div>
                <h2 className="cart-empty-title">
                  Giỏ hàng của bạn đang trống!
                </h2>
                <p className="cart-empty-desc">
                  Hãy khám phá các sản phẩm tuyệt vời của Mini Shop và thêm vào giỏ
                  nhé.
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
              <>
                {/* Free Shipping Progress Bar */}
                {(() => {
                  const freeShipThreshold = 1500000;
                  const progressPct = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));
                  const needed = freeShipThreshold - subtotal;
                  return (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                        border: "1px solid #bbf7d0",
                        borderRadius: "var(--radius-lg)",
                        padding: "16px 20px",
                        marginBottom: "24px",
                        boxShadow: "0 4px 12px rgba(46, 125, 50, 0.08)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Truck className="w-5 h-5 text-emerald-700" />
                          {subtotal >= freeShipThreshold ? (
                            <span>🎉 Chúc mừng! Đơn hàng của bạn đã đủ điều kiện <strong>Miễn phí vận chuyển toàn quốc</strong>!</span>
                          ) : (
                            <span>Mua thêm <strong>{formatVND(needed)}</strong> để nhận ưu đãi <strong>MIỄN PHÍ VẬN CHUYỂN</strong></span>
                          )}
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534" }}>{progressPct}%</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "rgba(22, 101, 52, 0.15)", borderRadius: "999px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #2e7d32 0%, #16a34a 100%)",
                            borderRadius: "999px",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Main Cart Layout (2 Columns) */}
                <div className="cart-layout" id="cart-main-layout">
                {/* Left: Products List Table */}
                <div className="cart-table-card">
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th style={{ textAlign: "center" }}>Xóa</th>
                      </tr>
                    </thead>
                    <tbody id="cart-table-body">
                      {cart.map((item) => (
                        <tr key={item.product.id}>
                          <td>
                            <div className="cart-product-cell">
                              <img
                                src={fixImagePath(item.product.image)}
                                alt={item.product.name}
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp";
                                }}
                              />
                              <div>
                                <h3 className="cart-product-title">
                                  {item.product.name}
                                </h3>
                                <div className="cart-product-price-mobile">
                                  {formatVND(item.product.price)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="cart-price-cell">
                            {item.product.oldPrice && item.product.oldPrice > item.product.price && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                {formatVND(item.product.oldPrice)}
                              </div>
                            )}
                            <div style={{ fontWeight: 800, color: "var(--primary-color)" }}>
                              {formatVND(item.product.price)}
                            </div>
                          </td>
                          <td>
                            <div className="cart-qty-control">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={item.product.stock ?? 50}
                                value={item.quantity}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value, 10);
                                  const maxStock = item.product.stock ?? 50;
                                  if (val > maxStock) {
                                    alert(`⚠️ Sản phẩm này chỉ còn ${maxStock} trong kho!`);
                                    val = maxStock;
                                  }
                                  updateQuantity(item.product.id, isNaN(val) ? 1 : val);
                                }}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (isNaN(val) || val <= 0) {
                                    updateQuantity(item.product.id, 1);
                                  }
                                }}
                                style={{ width: "45px", textAlign: "center" }}
                              />
                              <button
                                type="button"
                                disabled={item.quantity >= (item.product.stock ?? 50)}
                                onClick={() => {
                                  const maxStock = item.product.stock ?? 50;
                                  if (item.quantity < maxStock) {
                                    updateQuantity(item.product.id, item.quantity + 1);
                                  } else {
                                    alert(`⚠️ Sản phẩm này chỉ còn ${maxStock} trong kho!`);
                                  }
                                }}
                                style={{ opacity: item.quantity >= (item.product.stock ?? 50) ? 0.4 : 1 }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="cart-subtotal-cell">
                            {formatVND(item.product.price * item.quantity)}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="btn-remove-item"
                              onClick={() => removeFromCart(item.product.id)}
                              title="Xóa khỏi giỏ hàng"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-color)", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`⚠️ Bạn có chắc chắn muốn xóa toàn bộ ${cart.length} sản phẩm khỏi giỏ hàng không?`)) {
                          clearCart();
                        }
                      }}
                      style={{
                        background: "none",
                        border: "1px solid #fca5a5",
                        color: "#dc2626",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Xóa tất cả giỏ hàng
                    </button>
                  </div>
                </div>

                {/* Right Summary Card */}
                <aside className="cart-summary-card">
                  <div className="summary-title">TỔNG ĐƠN HÀNG</div>

                  <div className="summary-row">
                    <span className="summary-label">Tạm tính:</span>
                    <strong id="cart-summary-subtotal">
                      {formatVND(subtotal)}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Phí giao hàng:</span>
                    <strong
                      id="cart-summary-shipping"
                      style={{ color: subtotal >= 500000 ? "var(--primary-color)" : "var(--text-main)" }}
                    >
                      {subtotal >= 500000 ? "Miễn phí" : "20.000đ - 30.000đ"}
                    </strong>
                  </div>

                  {appliedCoupon && (
                    <div className="summary-row">
                      <span className="summary-label">
                        Giảm giá ({appliedCoupon.code}):
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ color: "#ef4444" }}>
                          -{formatVND(discountAmount)}
                        </strong>
                        {appliedCoupon.percent && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            (Ưu đãi giảm {appliedCoupon.percent}%)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mã giảm giá */}
                  <div style={{ margin: "8px 0" }}>
                    <div className="coupon-header-line">
                      <label className="coupon-label-title">
                        🎟️ Mã ưu đãi:
                      </label>
                      <button
                        type="button"
                        className="btn-kho-qua-pill"
                        onClick={() => setShowModal(true)}
                        title="Mở danh sách mã ưu đãi & quà đã đổi"
                      >
                        📋 Chọn từ Kho Quà ({totalAvailableItemsCount})
                      </button>
                    </div>
                    <div className="coupon-box">
                      <input
                        type="text"
                        id="input-cart-coupon"
                        placeholder="Nhập hoặc chọn mã..."
                        style={{ textTransform: "uppercase" }}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleApplyCoupon()}
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
                    {couponMsg && (
                      <div
                        id="cart-coupon-msg"
                        style={{
                          fontSize: "12px",
                          color: couponMsg.startsWith("✅")
                            ? "#166534"
                            : "#ef4444",
                          fontWeight: 700,
                          marginTop: "4px",
                        }}
                      >
                        {couponMsg}
                      </div>
                    )}
                  </div>

                  <div className="summary-row-total">
                    <span className="total-label">TỔNG TIỀN:</span>
                    <span className="total-price" id="cart-summary-total">
                      {formatVND(total)}
                    </span>
                  </div>

                  <Link href="/checkout" className="btn-checkout">
                    Tiến hành Thanh toán &rarr;
                  </Link>
                  <Link
                    href="/products"
                    style={{
                      textAlign: "center",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      textDecoration: "underline",
                      marginTop: "4px",
                    }}
                  >
                    Tiếp tục mua sắm
                  </Link>
                </aside>
              </div>
            </>
          )}
          </div>
        </div>
      </main>

      {/* MODAL CHỌN MÃ ƯU ĐÃI & KHO QUÀ */}
      {showModal && (
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
                onClick={() => setShowModal(false)}
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
                    onClick={() => handleApplyCoupon(coupon.code)}
                    style={{
                      border:
                        appliedCoupon?.code === coupon.code
                          ? "2px solid var(--primary-color)"
                          : coupon.isRedeemed
                          ? "2px dashed var(--primary-color)"
                          : "1px dashed var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      background:
                        appliedCoupon?.code === coupon.code
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
                        name="cart-modal-coupon"
                        checked={appliedCoupon?.code === coupon.code}
                        onChange={() => handleApplyCoupon(coupon.code)}
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
                        {coupon.minOrder && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: subtotal >= coupon.minOrder ? "#166534" : "#dc2626",
                              fontWeight: 700,
                              marginTop: "2px",
                            }}
                          >
                            📌 Đơn tối thiểu {formatVND(coupon.minOrder)} {subtotal < coupon.minOrder ? "(Chưa đủ điều kiện)" : "(Đủ điều kiện)"}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyCoupon(coupon.code);
                      }}
                      style={{
                        padding: "6px 14px",
                        background:
                          appliedCoupon?.code === coupon.code
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
                      {appliedCoupon?.code === coupon.code
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
    </>
  );
}
