"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/cart.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToastAndConfirm } from "@/context/ToastAndConfirmContext";
import { formatVND, fixImagePath } from "@/lib/utils";

import { fetchAdminVouchers } from "@/lib/supabaseAdmin";
import {
  Truck,
  ShieldCheck,
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Ticket,
  Gift,
  Sparkles,
  Check,
  AlertTriangle,
  X,
  Minus,
  Plus,
  LogIn,
  Lock,
} from "lucide-react";

import { fetchUserAddressesFromSupabase } from "@/lib/supabaseAddress";

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

export default function CartPageContent() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast, showConfirm } = useToastAndConfirm();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [ineligibleModalInfo, setIneligibleModalInfo] = useState<{
    code: string;
    minOrder: number;
    missingAmount: number;
  } | null>(null);
  const [userProvince, setUserProvince] = useState("Thành phố Hồ Chí Minh");

  useEffect(() => {
    async function loadUserAddr() {
      if (user?.username || user?.email) {
        const addrs = await fetchUserAddressesFromSupabase(user.username || user.email || "binh");
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        if (defaultAddr?.province) {
          setUserProvince(defaultAddr.province);
        }
      }
    }
    loadUserAddr();
  }, [user]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const [systemCoupons, setSystemCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
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

  const activeSystemCoupons = systemCoupons.filter(
    (c) => !user?.usedSystemCoupons?.includes(c.code)
  );

  const allAvailableCoupons: Coupon[] = [
    ...(user?.vouchers.map((v) => {
      const qty = v.quantity || 1;
      const isShipping = v.code.toUpperCase().includes("FREESHIP");
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

  const isInnerCity =
    userProvince.toLowerCase().includes("hà nội") ||
    userProvince.toLowerCase().includes("hồ chí minh") ||
    userProvince.toLowerCase().includes("hcm");

  const shippingFee = subtotal >= 500000 ? 0 : isInnerCity ? 20000 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

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
      if (found.minOrder && subtotal < found.minOrder) {
        const missing = found.minOrder - subtotal;
        setIneligibleModalInfo({
          code: found.code,
          minOrder: found.minOrder,
          missingAmount: missing,
        });
        setCouponMsg(
          `Bạn chưa đủ điều kiện để áp mã. Bạn cần đặt thêm ${formatVND(missing)} để có thể áp được mã giảm.`
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
      setCouponMsg(`Áp dụng thành công mã ${found.code} (${label})`);
      setShowModal(false);
    } else {
      setCouponMsg("Mã ưu đãi không hợp lệ hoặc không có trong Kho quà!");
    }
  };

  // Auto-kick applied voucher if subtotal drops below minOrder when user modifies cart items
  React.useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrder && subtotal < appliedCoupon.minOrder) {
      const kickedCode = appliedCoupon.code;
      const requiredMin = appliedCoupon.minOrder;
      setAppliedCoupon(null);
      setCouponCode("");
      try {
        localStorage.removeItem("mini_shop_applied_coupon");
      } catch (e) {
        console.error(e);
      }
      setCouponMsg(
        `Mã ${kickedCode} đã tự động bị hủy do giá trị đơn hàng (${formatVND(subtotal)}) không còn đủ điều kiện tối thiểu ${formatVND(requiredMin)}.`
      );

    }
  }, [subtotal, appliedCoupon]);

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
          setAppliedCoupon(found);
          setCouponCode(found.code);
          const label = found.fixedDiscount
            ? `Giảm ${found.fixedDiscount.toLocaleString("vi-VN")}đ`
            : `Giảm ${found.percent}%`;
          setCouponMsg(`Áp dụng thành công mã ${found.code} (${label})`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [systemCoupons, user]);

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="container" style={{ padding: "30px 16px 60px" }}>
        {!user ? (
          /* GUEST AUTH REQUIRED GATE (Doppelrand Hardware Architecture) */
          <div
            style={{
              background: "rgba(15, 23, 42, 0.03)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              borderRadius: "2rem",
              padding: "8px",
              maxWidth: "600px",
              margin: "40px auto",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "calc(2rem - 0.5rem)",
                padding: "48px 32px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#e8f5e9",
                  color: "var(--primary-color, #2e7d32)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  border: "1px solid #c8e6c9",
                  boxShadow: "0 6px 20px rgba(46, 125, 50, 0.15)",
                }}
              >
                <ShoppingCart className="w-9 h-9" />
              </div>

              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#0f172a",
                  marginBottom: "12px",
                  letterSpacing: "-0.02em",
                }}
              >
                Yêu Cầu Đăng Nhập Tài Khoản
              </h1>

              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  marginBottom: "32px",
                  maxWidth: "460px",
                  margin: "0 auto 32px",
                }}
              >
                Bạn cần đăng nhập tài khoản khách hàng để xem giỏ hàng, áp dụng mã ưu đãi và tiến hành thanh toán đơn hàng.
              </p>

              <Link
                href="/auth"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  padding: "14px 32px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 8px 25px rgba(46, 125, 50, 0.25)",
                }}
              >
                <i className="fa-solid fa-lock text-emerald-100"></i>
                <span>Đăng Nhập Ngay</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
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
            Giỏ hàng của bạn ({cart.length} sản phẩm)
          </h1>
        </div>

        {/* Empty Cart State */}
        {cart.length === 0 ? (
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
              Hãy khám phá bộ sưu tập nội thất & gia dụng cao cấp của MINI-SHOP và thêm những sản phẩm ưng ý nhất vào giỏ nhé.
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
          <>
            {/* Main Cart Content Grid (2 Columns on Desktop) */}
            <div className="cart-content-grid">
              
              {/* Left Column: Product List Table (Double-Bezel Architecture) */}
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.03)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: "1.75rem",
                  padding: "6px",
                }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "calc(1.75rem - 0.375rem)",
                    padding: "20px 24px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sản phẩm</th>
                        <th style={{ padding: "12px 8px", textAlign: "center", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", width: "120px" }}>Đơn giá</th>
                        <th style={{ padding: "12px 8px", textAlign: "center", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", width: "130px" }}>Số lượng</th>
                        <th style={{ padding: "12px 8px", textAlign: "right", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", width: "130px" }}>Thành tiền</th>
                        <th style={{ padding: "12px 8px", textAlign: "center", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", width: "50px" }}>Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                          {/* Product Info */}
                          <td style={{ padding: "16px 8px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <img
                                src={fixImagePath(item.product.image)}
                                alt={item.product.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
                                }}
                                style={{
                                  width: "64px",
                                  height: "64px",
                                  borderRadius: "12px",
                                  objectFit: "cover",
                                  border: "1px solid #e2e8f0",
                                  flexShrink: 0,
                                }}
                              />
                              <div>
                                <Link
                                  href={`/products/${item.product.id}`}
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: 800,
                                    color: "#0f172a",
                                    textDecoration: "none",
                                    lineHeight: 1.4,
                                    display: "block",
                                  }}
                                >
                                  {item.product.name}
                                </Link>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#64748b",
                                    background: "#f1f5f9",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    display: "inline-block",
                                    marginTop: "4px",
                                  }}
                                >
                                  Mã SP: P00{item.product.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Unit Price */}
                          <td style={{ padding: "16px 8px", textAlign: "center", verticalAlign: "middle", fontSize: "14px", fontWeight: 700, color: "#334155" }}>
                            {formatVND(item.product.price)}
                          </td>

                          {/* Concentric Quantity Controller */}
                          <td style={{ padding: "16px 8px", textAlign: "center", verticalAlign: "middle" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                border: "1px solid #cbd5e1",
                                borderRadius: "999px",
                                background: "#f8fafc",
                                padding: "2px 6px",
                              }}
                            >
                              <button
                                type="button"
                                disabled={item.quantity <= 1}
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  border: "none",
                                  background: "#ffffff",
                                  color: "#0f172a",
                                  cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <input
                                type="number"
                                value={item.quantity}
                                min={1}
                                max={item.product.stock ?? 50}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value, 10);
                                  const maxStock = item.product.stock ?? 50;
                                  if (val > maxStock) {
                                    showToast(`Sản phẩm này chỉ còn ${maxStock} trong kho!`, "warning");
                                    val = maxStock;
                                  }
                                  updateQuantity(item.product.id, isNaN(val) ? 1 : val);
                                }}
                                style={{
                                  width: "36px",
                                  border: "none",
                                  background: "transparent",
                                  textAlign: "center",
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  outline: "none",
                                }}
                              />

                              <button
                                type="button"
                                disabled={item.quantity >= (item.product.stock ?? 50)}
                                onClick={() => {
                                  const maxStock = item.product.stock ?? 50;
                                  if (item.quantity < maxStock) {
                                    updateQuantity(item.product.id, item.quantity + 1);
                                  } else {
                                    showToast(`Sản phẩm này chỉ còn ${maxStock} trong kho!`, "warning");
                                  }
                                }}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  border: "none",
                                  background: "#ffffff",
                                  color: "#0f172a",
                                  cursor: item.quantity >= (item.product.stock ?? 50) ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Item Subtotal */}
                          <td style={{ padding: "16px 8px", textAlign: "right", verticalAlign: "middle", fontSize: "15px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                            {formatVND(item.product.price * item.quantity)}
                          </td>

                          {/* Delete Item */}
                          <td style={{ padding: "16px 8px", textAlign: "center", verticalAlign: "middle" }}>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#94a3b8",
                                transition: "all 0.2s ease",
                                padding: "4px",
                              }}
                              title="Xóa khỏi giỏ hàng"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Clear All Footer */}
                  <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => {
                        showConfirm({
                          title: "Xóa toàn bộ giỏ hàng",
                          message: `Bạn có chắc chắn muốn xóa toàn bộ ${cart.length} sản phẩm khỏi giỏ hàng không?`,
                          confirmText: "Xóa hết",
                          cancelText: "Giữ lại",
                          type: "danger",
                          icon: "fa-solid fa-trash-can",
                          onConfirm: () => {
                            clearCart();
                            showToast("Đã làm trống giỏ hàng thành công!", "info");
                          },
                        });
                      }}
                      style={{
                        background: "none",
                        border: "1px solid #fca5a5",
                        color: "#dc2626",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 800,
                        borderRadius: "999px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả sản phẩm
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (Double-Bezel Architecture) */}
              <aside
                style={{
                  background: "rgba(15, 23, 42, 0.03)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: "1.75rem",
                  padding: "6px",
                }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "calc(1.75rem - 0.375rem)",
                    padding: "24px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0, paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                    TỔNG ĐƠN HÀNG
                  </h2>

                  {/* Subtotal Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569" }}>
                    <span>Tạm tính:</span>
                    <strong style={{ color: "#0f172a", fontSize: "15px" }}>{formatVND(subtotal)}</strong>
                  </div>

                  {/* Shipping Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569" }}>
                    <span>Phí giao hàng:</span>
                    <strong style={{ color: shippingFee === 0 ? "var(--primary-color, #2e7d32)" : "#0f172a" }}>
                      {shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}
                    </strong>
                  </div>

                  {/* Applied Coupon Row */}
                  {appliedCoupon && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569" }}>
                      <span>Giảm giá ({appliedCoupon.code}):</span>
                      <strong style={{ color: "#dc2626" }}>-{formatVND(discountAmount)}</strong>
                    </div>
                  )}

                  {/* Coupon Box */}
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", marginTop: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Ticket className="w-4 h-4 text-emerald-700" /> Mã ưu đãi:
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        style={{
                          background: "#e0f2fe",
                          color: "#0369a1",
                          border: "1px solid #bae6fd",
                          borderRadius: "999px",
                          padding: "3px 10px",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Gift className="w-3.5 h-3.5" /> Chọn từ Kho Quà ({totalAvailableItemsCount})
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Nhập hoặc chọn mã..."
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          fontSize: "13px",
                          borderRadius: "0.5rem",
                          border: "1px solid #cbd5e1",
                          outline: "none",
                          textTransform: "uppercase",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        style={{
                          padding: "8px 14px",
                          fontSize: "13px",
                          fontWeight: 800,
                          color: "#ffffff",
                          background: "var(--primary-color, #2e7d32)",
                          border: "none",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Áp dụng
                      </button>
                    </div>

                    {couponMsg && (
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          marginTop: "6px",
                          color: couponMsg.includes("thành công") ? "#15803d" : "#dc2626",
                        }}
                      >
                        {couponMsg}
                      </div>
                    )}
                  </div>

                  {/* Total Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #f1f5f9", paddingTop: "16px", marginTop: "6px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 900, color: "#0f172a" }}>TỔNG TIỀN:</span>
                    <span style={{ fontSize: "22px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                      {formatVND(total)}
                    </span>
                  </div>

                  {/* Island CTA Button */}
                  <Link
                    href="/checkout"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "12px 24px",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      fontSize: "15px",
                      fontWeight: 900,
                      borderRadius: "999px",
                      textDecoration: "none",
                      boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
                      boxSizing: "border-box",
                      marginTop: "6px",
                    }}
                  >
                    <span>Tiến hành Thanh toán</span>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </Link>

                  <Link
                    href="/products"
                    style={{
                      textAlign: "center",
                      fontSize: "13px",
                      color: "#64748b",
                      textDecoration: "underline",
                      marginTop: "2px",
                    }}
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}

        {/* KHO QUÀ MODAL POPUP */}
        {showModal && (
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
                maxWidth: "520px",
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                  borderTopLeftRadius: "1.75rem",
                  borderTopRightRadius: "1.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Gift className="w-5 h-5 text-emerald-700" />
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Chọn Mã Ưu Đãi Từ Kho Quà
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Modal List */}
              <div style={{ padding: "20px" }}>
                {allAvailableCoupons.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b", fontSize: "14px" }}>
                    Chưa có mã ưu đãi nào trong Kho Quà của bạn.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {allAvailableCoupons.map((c) => {
                      const isApplied = appliedCoupon?.code === c.code;
                      const minOrder = c.minOrder || 0;
                      const isEligible = subtotal >= minOrder;
                      const missingAmount = minOrder > subtotal ? minOrder - subtotal : 0;
                      const label = c.fixedDiscount
                        ? `Giảm ${c.fixedDiscount.toLocaleString("vi-VN")}đ`
                        : `Giảm ${c.percent}%`;
                      return (
                        <div
                          key={c.code}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "1rem",
                            border: isApplied
                              ? "2px solid var(--primary-color, #2e7d32)"
                              : !isEligible
                              ? "1px dashed #cbd5e1"
                              : "1px solid #e2e8f0",
                            background: isApplied
                              ? "#f0fdf4"
                              : !isEligible
                              ? "#f8fafc"
                              : "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            opacity: isEligible || isApplied ? 1 : 0.85,
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>
                                {c.code} ({label})
                              </span>
                              {!isEligible ? (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#b45309",
                                    background: "#fffbeb",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #fde68a",
                                  }}
                                >
                                  Cần thêm {formatVND(missingAmount)}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#166534",
                                    background: "#dcfce7",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  Đủ điều kiện
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                              {c.desc} {minOrder > 0 && `(Đơn từ ${formatVND(minOrder)})`}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: 800,
                              background: isApplied
                                ? "#dc2626"
                                : isEligible
                                ? "var(--primary-color, #2e7d32)"
                                : "#94a3b8",
                              color: "#ffffff",
                              border: "none",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isApplied ? "Bỏ áp dụng" : "Áp dụng"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Centered Ineligible Alert Modal */}
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
          </>
        )}
      </div>
    </main>
  );
}
