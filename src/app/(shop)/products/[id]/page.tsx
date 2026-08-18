"use client";

import React, { useState, use, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import "@/styles/product-detail.css";
import { PRODUCTS_DATA } from "@/data/products";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";
import { fetchProductByIdFromSupabase, fetchProductsFromSupabase } from "@/lib/supabaseProducts";

function ProductDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10) || 1;
  const searchParams = useSearchParams();
  const flashParam = searchParams.get("flashSalePrice");
  const flashSalePrice = flashParam ? parseInt(flashParam, 10) : null;

  const [product, setProduct] = useState<Product>(PRODUCTS_DATA[0]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    async function loadData() {
      setLoading(true);
      const [fetchedProduct, fetchedList] = await Promise.all([
        fetchProductByIdFromSupabase(productId),
        fetchProductsFromSupabase(),
      ]);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        if (typeof document !== "undefined") {
          document.title = `${fetchedProduct.name} - Mini Shop`;
        }
      }
      if (fetchedList && fetchedList.length > 0) {
        setAllProducts(fetchedList);
      }
      setLoading(false);
    }

    loadData();
  }, [productId]);

  const currentProduct = product || PRODUCTS_DATA[0];

  const effectivePrice = flashSalePrice || currentProduct.price;

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Gallery Images (Primary image + thumbnail variations)
  const galleryImages = [
    currentProduct.image,
    "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
    "/assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp",
    "/assets/images/products/do-thu-cong/khay-go-trang-tri.webp",
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const discountPercent = currentProduct.oldPrice
    ? Math.round((1 - currentProduct.price / currentProduct.oldPrice) * 100)
    : 0;

  const effectiveDiscount = flashSalePrice
    ? Math.round((1 - effectivePrice / (currentProduct.oldPrice || currentProduct.price)) * 100)
    : discountPercent;

  const sameCatProducts = allProducts.filter(
    (p) => p.id !== currentProduct.id && (p.category === currentProduct.category || p.categoryName === currentProduct.categoryName)
  );
  const otherProducts = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.category !== currentProduct.category && p.categoryName !== currentProduct.categoryName
  );
  const relatedProducts = [...sameCatProducts, ...otherProducts].slice(0, 4);


  return (
    <>
      {/* 3. Main Product Hero Section (3 Columns Layout) */}
      <main className="main-content" style={{ paddingTop: "24px" }}>
        <div className="container">
          <div className="product-detail-hero">
            {/* Column 1: Image Gallery */}
            <div className="product-gallery">
              {/* Thumbnails list */}
              <div className="gallery-thumbnails" id="gallery-thumbs">
                {galleryImages.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    className={`thumb-item ${
                      activeImageIndex === idx ? "active" : ""
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveImageIndex(idx);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Xem hình ảnh ${idx + 1}`}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={fixImagePath(imgSrc)}
                      alt={`Thumb ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fixImagePath(currentProduct.image);
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Main display image */}
              <div className="gallery-main-image">
                <img
                  id="main-detail-image"
                  src={fixImagePath(galleryImages[activeImageIndex])}
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fixImagePath(currentProduct.image);
                  }}
                />
              </div>
            </div>

            {/* Column 2: Product Info & Purchase Actions */}
            <div className="product-info-col">
              <div className="product-meta-tags">
                {(product.stock ?? 50) === 0 ? (
                  <span className="badge-stock" style={{ background: "#fee2e2", color: "#b91c1c" }}>
                    ❌ Hết hàng trong kho
                  </span>
                ) : (
                  <span className="badge-stock">
                    🔥 Chỉ còn {product.stock ?? 50} sản phẩm trong kho
                  </span>
                )}
                <span className="tag-category">{product.categoryName}</span>
              </div>

              <h1 className="product-detail-title">{product.name}</h1>

              <div className="rating-box">
                <span className="stars">★★★★★</span>
                <span className="review-count">
                  ({product.reviews || 48} đánh giá)
                </span>
              </div>

              {flashSalePrice ? (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#dc2626",
                      fontWeight: 900,
                      marginBottom: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    ⚡ ƯU ĐÃI DEAL GIỜ VÀNG FLASH SALE
                  </div>
                  <div className="price-detail-box" style={{ margin: 0 }}>
                    <span
                      className="price-main"
                      style={{ color: "#dc2626", fontSize: "24px" }}
                    >
                      {formatVND(effectivePrice)}
                    </span>
                    <span
                      className="price-original"
                      style={{
                        textDecoration: "line-through",
                        color: "#94a3b8",
                        marginLeft: "10px",
                      }}
                    >
                      {formatVND(product.price)}
                    </span>
                    <span
                      className="badge-discount"
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        marginLeft: "10px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      -{effectiveDiscount}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="price-detail-box">
                  <span className="price-main">{formatVND(product.price)}</span>
                  {product.oldPrice && (
                    <>
                      <span className="price-original">
                        {formatVND(product.oldPrice)}
                      </span>
                      <span className="badge-discount">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              )}

              <p className="product-short-desc">
                {product.description ||
                  "Bộ bình gốm sứ trang trí mang phong cách tối giản hiện đại. Bề mặt phủ men mờ mịn màng cùng màu sắc pastel hài hòa tinh tế."}
              </p>

              {/* Quantity Control */}
              <div className="quantity-wrapper">
                <span className="quantity-label">Số lượng:</span>
                <div className="quantity-controls">
                  <button
                    className="btn-qty"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="input-qty"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="btn-qty"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action CTA Buttons (3 Equal Buttons) */}
              <div className="action-buttons-group" style={{ display: "flex", gap: "10px", width: "100%", marginTop: "20px" }}>
                <button
                  className="btn-add-cart"
                  disabled={(product.stock ?? 50) === 0}
                  onClick={() =>
                    addToCart({ ...product, price: effectivePrice }, quantity)
                  }
                  style={{
                    flex: 1,
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    fontWeight: 800,
                    fontSize: "14px",
                    opacity: (product.stock ?? 50) === 0 ? 0.5 : 1,
                  }}
                >
                  <span>🛒</span> Thêm vào giỏ hàng
                </button>
                <button
                  className="btn-add-cart"
                  disabled={(product.stock ?? 50) === 0}
                  onClick={() => {
                    addToCart({ ...product, price: effectivePrice }, quantity);
                    router.push("/checkout");
                  }}
                  style={{
                    flex: 1,
                    height: "48px",
                    backgroundColor: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    fontWeight: 800,
                    fontSize: "14px",
                    opacity: (product.stock ?? 50) === 0 ? 0.5 : 1,
                  }}
                >
                  <span>⚡</span> Mua ngay
                </button>
                <button
                  className="btn-detail-wishlist"
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    flex: 1,
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    fontWeight: 800,
                    fontSize: "14px",
                    color: isWishlisted(product.id) ? "#ef4444" : "inherit",
                    borderColor: isWishlisted(product.id)
                      ? "#ef4444"
                      : "var(--border-color)",
                  }}
                >
                  <span>{isWishlisted(product.id) ? "♥" : "♡"}</span> Yêu thích
                </button>
              </div>

              {/* Social Share Bar */}
              <div
                className="product-share-bar"
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🔗</span> Chia sẻ sản phẩm qua các ứng dụng:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 12px", background: "#1877f2", color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    📘 Facebook
                  </a>
                  <a
                    href={`https://zalo.me/share?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 12px", background: "#0068ff", color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    💬 Zalo
                  </a>
                  <a
                    href={`https://m.me/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 12px", background: "#0084ff", color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    ⚡ Messenger
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 12px", background: "#25d366", color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    🟢 WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 12px", background: "#229ed9", color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    ✈️ Telegram
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 12px", background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    📷 Instagram
                  </a>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                      }
                    }}
                    style={{ padding: "6px 12px", background: copied ? "#166534" : "#ffffff", color: copied ? "#fff" : "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    {copied ? "✅ Đã chép link!" : "📋 Sao chép đường link"}
                  </button>
                </div>
              </div>

              {/* Back-In-Stock Email Notification Box (When stock is 0) */}
              {(product.stock ?? 50) === 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "14px", color: "#c2410c", marginBottom: "6px" }}>
                    🔔 Nhận thông báo ngay khi có hàng trở lại
                  </div>
                  <p style={{ fontSize: "13px", color: "#7c2d12", margin: "0 0 10px 0" }}>
                    Sản phẩm hiện đang tạm hết hàng. Nhập email của bạn để hệ thống tự động gửi tin nhắn ngay khi hàng vừa xuất kho lại:
                  </p>
                  {subscribed ? (
                    <div style={{ color: "#166534", fontWeight: 800, fontSize: "13px" }}>
                      ✅ Cảm ơn bạn! Chúng tôi sẽ gửi email thông báo ngay khi sản phẩm có hàng.
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (notifyEmail.trim()) {
                          try {
                            const saved = localStorage.getItem("mini_shop_out_of_stock_subscriptions");
                            const list = saved ? JSON.parse(saved) : [];
                            list.push({
                              productId: product.id,
                              productName: product.name,
                              email: notifyEmail.trim(),
                              date: new Date().toISOString(),
                            });
                            localStorage.setItem("mini_shop_out_of_stock_subscriptions", JSON.stringify(list));
                          } catch (err) {
                            console.error(err);
                          }
                          setSubscribed(true);
                        }
                      }}
                      style={{ display: "flex", gap: "8px" }}
                    >
                      <input
                        type="email"
                        placeholder="Nhập địa chỉ email của bạn..."
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #fdba74",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: "8px 16px",
                          background: "#ea580c",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Đăng Ký Thông Báo
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Trust Commitments (Formatted like Home page badge-item) */}
              <div className="hero-badges" style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="badge-item">
                  <div className="badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  </div>
                  <div className="badge-text">
                    <strong>Miễn phí vận chuyển</strong>
                    <span>Cho đơn hàng từ 500.000đ</span>
                  </div>
                </div>
                <div className="badge-item">
                  <div className="badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    </svg>
                  </div>
                  <div className="badge-text">
                    <strong>🔄 Đổi trả 30 ngày</strong>
                    <span>Đổi trả dễ dàng & nhanh chóng</span>
                  </div>
                </div>
                <div className="badge-item">
                  <div className="badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  </div>
                  <div className="badge-text">
                    <strong>🛡️ Thanh toán an toàn</strong>
                    <span>Bảo mật 100% khi thanh toán</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Product Specifications Cards */}
            <div className="specifications-col">
              {/* Detail Spec Card */}
              <div className="spec-card">
                <div className="spec-card-title">THÔNG SỐ CHI TIẾT</div>
                <table className="spec-table">
                  <tbody>
                    {product.specs && typeof product.specs === "object" && Object.keys(product.specs).length > 0 ? (
                      Object.entries(product.specs).map(([key, val]) => (
                        <tr key={key}>
                          <td className="spec-label">{key}</td>
                          <td className="spec-value">{val}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="spec-label">Chất liệu</td>
                          <td className="spec-value">Gốm sứ cao cấp</td>
                        </tr>
                        <tr>
                          <td className="spec-label">Màu sắc</td>
                          <td className="spec-value">
                            Kem mờ, Xanh ngọc, Trắng tinh khôi
                          </td>
                        </tr>
                        <tr>
                          <td className="spec-label">Kích thước</td>
                          <td className="spec-value">
                            Cao: 20cm, Vừa: 15cm, Nhỏ: 10cm
                          </td>
                        </tr>
                        <tr>
                          <td className="spec-label">Trọng lượng</td>
                          <td className="spec-value">1.2 kg (bộ)</td>
                        </tr>
                        <tr>
                          <td className="spec-label">Xuất xứ</td>
                          <td className="spec-value">Việt Nam</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Delivery Spec Card */}
              <div className="spec-card">
                <div className="spec-card-title">GIAO HÀNG & BẢO HÀNH</div>
                <ul className="delivery-info-list">
                  <li>Thời gian giao hàng tiêu chuẩn: 2–5 ngày làm việc</li>
                  <li>Giao hàng hỏa tốc: 1–2 ngày làm việc</li>
                  <li>
                    Phí vận chuyển:{" "}
                    {effectivePrice >= 500000 ? (
                      <span style={{ color: "var(--primary-color)", fontWeight: 800 }}>Miễn phí giao hàng (Đơn từ 500.000đ)</span>
                    ) : (
                      "20.000đ (Nội thành) / 30.000đ (Tỉnh)"
                    )}
                  </li>
                </ul>
                <Link href="/policy?tab=shipping" className="link-delivery-more">
                  Xem thêm chính sách giao hàng
                </Link>
              </div>
            </div>

            {/* Interactive Product Reviews Form Section (Redesigned Bento Layout) */}
            <div style={{ gridColumn: "1 / -1", marginTop: "32px", padding: "28px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <div style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "16px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⭐</span> ĐÁNH GIÁ & NHẬN XÉT TỪ KHÁCH HÀNG
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", alignItems: "start" }}>
                {/* Left Column: Overall Rating Score Breakdown */}
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "44px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                    4.9
                  </div>
                  <div style={{ color: "#eab308", fontSize: "20px", margin: "8px 0 4px" }}>
                    ★★★★★
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                    Dựa trên {product.reviews || 48} đánh giá xác thực
                  </div>

                  {/* Rating progress bars */}
                  <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#475569" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>5 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: "88%", height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>88%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>4 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: "8%", height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>8%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>3 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: "4%", height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>4%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>2 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: "0%", height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>0%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>1 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: "0%", height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>0%</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Review Form + Customer Comments List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("✅ Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được ghi nhận.");
                      setProduct((prev) => ({
                        ...prev,
                        reviews: (prev.reviews || 0) + 1,
                      }));
                    }}
                    style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "14px" }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>✍️ Viết đánh giá của bạn:</div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Chọn số sao:</span>
                      <select
                        defaultValue="5"
                        style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit", cursor: "pointer" }}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                        <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                        <option value="3">⭐⭐⭐ (3 sao)</option>
                        <option value="2">⭐⭐ (2 sao)</option>
                        <option value="1">⭐ (1 sao)</option>
                      </select>
                    </div>

                    <textarea
                      placeholder="Nhập cảm nhận chi tiết của bạn về chất lượng sản phẩm..."
                      required
                      rows={3}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
                    />

                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                      <button
                        type="submit"
                        style={{
                          padding: "10px 32px",
                          backgroundColor: "var(--primary-color, #2e7d32)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: 800,
                          cursor: "pointer",
                          fontSize: "14px",
                          boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                        }}
                      >
                        ✍️ Gửi Đánh Giá Ngay
                      </button>
                    </div>
                  </form>

                  {/* Customer Review List Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>💬 Nhận xét gần đây:</div>
                    
                    <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "14px", color: "#0f172a" }}>Nguyễn Minh Anh</strong>
                          <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>✓ Đã mua hàng</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>15/08/2026</span>
                      </div>
                      <div style={{ color: "#eab308", fontSize: "13px", marginBottom: "6px" }}>★★★★★</div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                        Sản phẩm giao cực kỳ đóng gói cẩn thận, đúng như mô tả hình ảnh. Đặt hôm trước hôm sau đã nhận được hàng. Rất hài lòng!
                      </p>
                    </div>

                    <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "14px", color: "#0f172a" }}>Trần Hoàng Nam</strong>
                          <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>✓ Đã mua hàng</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>12/08/2026</span>
                      </div>
                      <div style={{ color: "#eab308", fontSize: "13px", marginBottom: "6px" }}>★★★★★</div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                        Chất liệu hoàn thiện sắc nét, màu sắc tinh tế chuẩn Bắc Âu. Đội ngũ nhân viên tư vấn nhiệt tình chu đáo. Sẽ tiếp tục ủng hộ shop!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Related Products Carousel Section */}
          <section className="related-products-section">
            <div className="related-header">
              <h2 className="related-title">SẢN PHẨM LIÊN QUAN</h2>
              <div className="carousel-nav-btns">
                <button className="btn-carousel-prev" aria-label="Previous">
                  &lt;
                </button>
                <button className="btn-carousel-next" aria-label="Next">
                  &gt;
                </button>
              </div>
            </div>

            <div className="related-grid" id="related-products-grid">
              {relatedProducts.map((relProd) => (
                <Link
                  key={relProd.id}
                  href={`/products/${relProd.id}`}
                  className="related-card"
                >
                  <div className="related-img-wrapper">
                    <img
                      src={fixImagePath(relProd.image)}
                      alt={relProd.name}
                    />
                  </div>
                  <div className="related-info">
                    <h3 className="related-product-title">{relProd.name}</h3>
                    <div className="related-price">
                      {formatVND(relProd.price)}
                    </div>
                    <div className="related-stars">
                      ★★★★★ ({relProd.reviews || 25})
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 15px" }}>⏳ Đang tải thông tin sản phẩm...</div>}>
      <ProductDetailPageContent {...props} />
    </Suspense>
  );
}
