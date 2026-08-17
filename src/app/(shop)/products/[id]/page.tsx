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
      {/* 2. Breadcrumb Navigation Section */}
      <div className="breadcrumb-section">
        <div className="container">
          <ul className="breadcrumb">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-separator">&rsaquo;</li>
            <li>
              <Link href="/products">{product.categoryName}</Link>
            </li>
            <li className="breadcrumb-separator">&rsaquo;</li>
            <li className="breadcrumb-current">{product.name}</li>
          </ul>
        </div>
      </div>

      {/* 3. Main Product Hero Section (3 Columns Layout) */}
      <main className="main-content">
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

              {/* Action CTA Buttons */}
              <div className="action-buttons-group">
                <button
                  className="btn-add-cart"
                  disabled={(product.stock ?? 50) === 0}
                  onClick={() =>
                    addToCart({ ...product, price: effectivePrice }, quantity)
                  }
                  style={{ opacity: (product.stock ?? 50) === 0 ? 0.5 : 1 }}
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
                    backgroundColor: "#ef4444",
                    opacity: (product.stock ?? 50) === 0 ? 0.5 : 1,
                  }}
                >
                  <span>⚡</span> Mua ngay
                </button>
                <button
                  className="btn-detail-wishlist"
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    color: isWishlisted(product.id) ? "#ef4444" : "inherit",
                    borderColor: isWishlisted(product.id)
                      ? "#ef4444"
                      : "var(--border-color)",
                  }}
                >
                  <span>{isWishlisted(product.id) ? "♥" : "♡"}</span> Yêu thích
                </button>
                <button
                  className="btn-detail-wishlist"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }
                  }}
                  title="Sao chép liên kết chia sẻ"
                  style={{
                    borderColor: copied ? "#166534" : "var(--border-color)",
                    color: copied ? "#166534" : "inherit",
                  }}
                >
                  <span>{copied ? "✅" : "🔗"}</span> {copied ? "Đã chép link!" : "Chia sẻ"}
                </button>
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

              {/* Trust Commitments */}
              <div className="trust-commitments">
                <div className="commitment-item">
                  <div className="commitment-icon">🚚</div>
                  <div className="commitment-text">
                    <strong>Miễn phí vận chuyển</strong>
                    <span>Cho đơn hàng từ 500.000đ</span>
                  </div>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">🔄</div>
                  <div className="commitment-text">
                    <strong>Đổi trả 30 ngày</strong>
                    <span>Đổi trả dễ dàng & nhanh chóng</span>
                  </div>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">🛡️</div>
                  <div className="commitment-text">
                    <strong>Thanh toán an toàn</strong>
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
                  <li>Phí vận chuyển: 30.000đ</li>
                </ul>
                <Link href="/policy" className="link-delivery-more">
                  Xem thêm chính sách giao hàng
                </Link>
              </div>
            </div>

            {/* Interactive Product Reviews Form Section */}
            <div style={{ marginTop: "32px", padding: "24px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                ⭐ Đánh Giá & Nhận Xét Từ Khách Hàng
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                Hãy chia sẻ cảm nhận của bạn về sản phẩm này:
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("✅ Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được ghi nhận.");
                  setProduct((prev) => ({
                    ...prev,
                    reviews: (prev.reviews || 0) + 1,
                  }));
                }}
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>Chọn số sao:</span>
                  <select
                    defaultValue="5"
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit" }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5 sao - Rất tốt)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5 sao - Tốt)</option>
                    <option value="3">⭐⭐⭐ (3/5 sao - Bình thường)</option>
                    <option value="2">⭐⭐ (2/5 sao - Tạm được)</option>
                    <option value="1">⭐ (1/5 sao - Cần cải thiện)</option>
                  </select>
                </div>
                <textarea
                  placeholder="Nhập cảm nhận của bạn về chất lượng sản phẩm..."
                  required
                  rows={3}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit" }}
                />
                <div>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "var(--primary-color, #2e7d32)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ✍️ Gửi Đánh Giá Ngay
                  </button>
                </div>
              </form>
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
