"use client";

import React, { useState, use, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import "@/styles/product-detail.css";
import { PRODUCTS_DATA } from "@/data/products";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";
import { fetchProductByIdFromSupabase, fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { ShoppingCart, Zap, Heart, Truck, ShieldCheck, RefreshCw, Award, Copy, Check, AlertCircle, Flame, Bell, Star, Edit3, Share2, MessageSquare, CheckCircle2 } from "lucide-react";

interface ReviewItem {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

function generateMockReviews(productId: number, totalCount: number): ReviewItem[] {
  const names = [
    "Nguyễn Minh Anh", "Trần Hoàng Nam", "Lê Thu Thủy", "Đặng Quốc Bảo",
    "Phạm Hải Yến", "Vũ Hoàng Long", "Bùi Khánh Linh", "Đỗ Đức Mạnh",
    "Hoàng Ngọc Ánh", "Nông Văn Cường", "Phan Gia Hưng", "Trịnh Bảo Ngọc",
    "Dương Thành Trung", "Võ Mỹ Duyên", "Lý Thái Tông", "Ngô Quỳnh Trang"
  ];

  const comments5Star = [
    "Sản phẩm cực kỳ chất lượng, hoàn thiện sắc nét đúng như mô tả hình ảnh. Đóng gói rất cẩn thận nhiều lớp chống sốc. Rất hài lòng!",
    "Giao hàng siêu nhanh! Đặt chiều hôm trước sáng hôm sau đã nhận được. Chất liệu gỗ gốm sứ cao cấp, mịn màng đẹp mắt.",
    "Đáng tiền từng xu! Đặt decor phòng khách ai đến chơi cũng khen đẹp và tinh tế. Shop phục vụ tận tình 10/5 sao!",
    "Thiết kế chuẩn phong cách Bắc Âu tối giản, sang trọng. Hàng giao nguyên vẹn không sứt mẻ gì."
  ];

  const comments4Star = [
    "Sản phẩm đẹp, khớp với hình ảnh trên website. Thời gian giao hàng mất 2 ngày nhưng bù lại chất lượng rất ổn.",
    "Chất lượng sản phẩm tốt, màu sắc ngoài đời hơi đậm hơn hình chút nhưng tổng thể vẫn rất ưng ý."
  ];

  const comments3Star = [
    "Sản phẩm đúng mô tả, tuy nhiên hộp đóng gói hơi móp nhẹ. Thần may sản phẩm bên trong không sao."
  ];

  const list: ReviewItem[] = [];
  const now = new Date(2026, 7, 18);

  for (let i = 0; i < totalCount; i++) {
    const seed = (productId * 9301 + i * 49297) % 233280;
    const name = names[seed % names.length];
    
    let rating = 5;
    if (i % 7 === 5) rating = 4;
    else if (i % 15 === 14) rating = 3;

    let comment = comments5Star[i % comments5Star.length];
    if (rating === 4) comment = comments4Star[i % comments4Star.length];
    if (rating === 3) comment = comments3Star[i % comments3Star.length];

    const daysAgo = i * 2 + (seed % 3);
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    list.push({
      id: i + 1,
      name,
      rating,
      date: dateStr,
      comment,
      isVerified: true,
    });
  }

  return list;
}

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
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "all">("all");

  const totalReviewsCount = currentProduct.reviews || 20;
  const allMockReviews = useMemo(
    () => generateMockReviews(productId, totalReviewsCount),
    [productId, totalReviewsCount]
  );

  const count5Star = allMockReviews.filter((r) => r.rating === 5).length;
  const count4Star = allMockReviews.filter((r) => r.rating === 4).length;
  const count3Star = allMockReviews.filter((r) => r.rating === 3).length;
  const count2Star = allMockReviews.filter((r) => r.rating === 2).length;
  const count1Star = allMockReviews.filter((r) => r.rating === 1).length;

  const filteredReviews = selectedStarFilter === "all"
    ? allMockReviews
    : allMockReviews.filter((r) => r.rating === selectedStarFilter);

  // Gallery Images (Primary image + thumbnail variations)
  const galleryImages = [
    currentProduct.image,
    "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
    "/assets/images/products/bo-binh-gom-minimal.webp",
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
            {/* Column 1: Image Gallery & Social Share */}
            <div>
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

              {/* Social Share Bar Under Image Gallery (2 Rows) */}
              <div
                className="product-share-bar"
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Share2 className="w-4 h-4 text-emerald-700" /> Chia sẻ sản phẩm qua các ứng dụng:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Row 1: 4 apps */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "6px 4px", background: "#1877f2", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                    <a
                      href={`https://zalo.me/share?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "6px 4px", background: "#0068ff", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <span style={{ fontSize: "9px", fontWeight: 900, background: "#fff", color: "#0068ff", padding: "1px 3px", borderRadius: "2px" }}>Zalo</span>
                      Zalo
                    </a>
                    <a
                      href={`https://m.me/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "6px 4px", background: "linear-gradient(45deg, #0084ff, #a033ff)", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.304 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.889-3.259-6.56 6.964z"/>
                      </svg>
                      Messenger
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "6px 4px", background: "#25d366", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </div>

                  {/* Row 2: 3 apps */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "6px" }}>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "6px 4px", background: "#229ed9", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.14 10.08c-.16.73-.59.91-1.2.57l-3.28-2.42-1.58 1.52c-.17.17-.32.32-.66.32l.24-3.34 6.08-5.5c.26-.23-.06-.36-.41-.13l-7.52 4.73-3.24-1.01c-.7-.22-.72-.7.15-1.04l12.67-4.88c.59-.22 1.11.14.92.98z"/>
                      </svg>
                      Telegram
                    </a>
                    <a
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "6px 4px", background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard.writeText(window.location.href);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 3000);
                        }
                      }}
                      style={{ padding: "6px 8px", background: copied ? "#166534" : "#ffffff", color: copied ? "#fff" : "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Đã chép!" : "Sao chép link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Product Info & Purchase Actions */}
            <div className="product-info-col">
              <div className="product-meta-tags">
                {(product.stock ?? 50) === 0 ? (
                  <span className="badge-stock" style={{ background: "#fee2e2", color: "#b91c1c", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> Hết hàng trong kho
                  </span>
                ) : (
                  <span className="badge-stock" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Chỉ còn {product.stock ?? 50} sản phẩm trong kho
                  </span>
                )}
                <span className="tag-category">{product.categoryName}</span>
              </div>

              <h1 className="product-detail-title">{product.name}</h1>

              <div className="rating-box">
                <span className="stars" style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: "16px", height: "16px", color: "#f59e0b", fill: "#f59e0b" }} />
                  ))}
                </span>
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
                      fontWeight: 800,
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Zap className="w-3.5 h-3.5 fill-red-600 text-red-600" /> ƯU ĐÃI DEAL GIỜ VÀNG FLASH SALE
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

              {/* Action CTA Buttons (3 Equal Buttons with Island Architecture) */}
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
                    gap: "8px",
                    fontWeight: 800,
                    fontSize: "14px",
                    opacity: (product.stock ?? 50) === 0 ? 0.5 : 1,
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                  }}
                >
                  <span style={{ display: "inline-flex", padding: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "999px" }}>
                    <ShoppingCart className="w-4 h-4" />
                  </span>
                  Thêm vào giỏ
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
                    gap: "8px",
                    fontWeight: 800,
                    fontSize: "14px",
                    opacity: (product.stock ?? 50) === 0 ? 0.5 : 1,
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <span style={{ display: "inline-flex", padding: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "999px" }}>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </span>
                  Mua ngay
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
                    borderColor: isWishlisted(product.id)
                      ? "#ef4444"
                      : "var(--border-color)",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? "text-red-500 fill-red-500" : "text-slate-500"}`} /> Yêu thích
                  </span>
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
                  <div style={{ fontWeight: 800, fontSize: "14px", color: "#c2410c", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Bell className="w-4 h-4 text-orange-600" /> Nhận thông báo ngay khi có hàng trở lại
                  </div>
                  <p style={{ fontSize: "13px", color: "#7c2d12", margin: "0 0 10px 0" }}>
                    Sản phẩm hiện đang tạm hết hàng. Nhập email của bạn để hệ thống tự động gửi tin nhắn ngay khi hàng vừa xuất kho lại:
                  </p>
                  {subscribed ? (
                    <div style={{ color: "#166534", fontWeight: 800, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Check className="w-4 h-4 text-emerald-600" /> Cảm ơn bạn! Chúng tôi sẽ gửi email thông báo ngay khi sản phẩm có hàng.
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

              {/* Horizontal 3 Trust Badges Row (Requirement 5) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-color)",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    padding: "10px 8px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#dcfce7",
                      color: "#15803d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    <strong style={{ fontSize: "12px", whiteSpace: "nowrap", display: "block", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Miễn phí vận chuyển
                    </strong>
                    <span style={{ fontSize: "11px", whiteSpace: "nowrap", display: "block", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Cho đơn hàng từ 500k
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 8px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    <strong style={{ fontSize: "12px", whiteSpace: "nowrap", display: "block", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Đổi trả 30 ngày
                    </strong>
                    <span style={{ fontSize: "11px", whiteSpace: "nowrap", display: "block", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Dễ dàng & nhanh chóng
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 8px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#fef3c7",
                      color: "#b45309",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    <strong style={{ fontSize: "12px", whiteSpace: "nowrap", display: "block", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Thanh toán an toàn
                    </strong>
                    <span style={{ fontSize: "11px", whiteSpace: "nowrap", display: "block", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Bảo mật 100%
                    </span>
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
                  <Star style={{ width: "20px", height: "20px", color: "#f59e0b", fill: "#f59e0b" }} /> ĐÁNH GIÁ & NHẬN XÉT TỪ KHÁCH HÀNG
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", alignItems: "start" }}>
                {/* Left Column: Overall Rating Score Breakdown */}
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "44px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                    4.9
                  </div>
                  <div style={{ margin: "8px 0 4px", display: "inline-flex", justifyContent: "center", gap: "3px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} style={{ width: "16px", height: "16px", color: "#f59e0b", fill: "#f59e0b" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                    Dựa trên {totalReviewsCount} đánh giá xác thực
                  </div>

                  {/* Rating progress bars */}
                  <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#475569" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>5 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count5Star / totalReviewsCount) * 100)}%`, height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>{Math.round((count5Star / totalReviewsCount) * 100)}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>4 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count4Star / totalReviewsCount) * 100)}%`, height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>{Math.round((count4Star / totalReviewsCount) * 100)}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>3 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count3Star / totalReviewsCount) * 100)}%`, height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>{Math.round((count3Star / totalReviewsCount) * 100)}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>2 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count2Star / totalReviewsCount) * 100)}%`, height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>{Math.round((count2Star / totalReviewsCount) * 100)}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "35px" }}>1 sao</span>
                      <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count1Star / totalReviewsCount) * 100)}%`, height: "100%", background: "#eab308" }} />
                      </div>
                      <span style={{ width: "35px", textAlign: "right" }}>{Math.round((count1Star / totalReviewsCount) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Review Form + Filter Pills + Customer Comments List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được ghi nhận.");
                      setProduct((prev) => ({
                        ...prev,
                        reviews: (prev.reviews || 0) + 1,
                      }));
                    }}
                    style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "14px" }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Edit3 className="w-4 h-4 text-emerald-700" /> Viết đánh giá của bạn:
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Chọn số sao:</span>
                      <select
                        defaultValue="5"
                        style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit", cursor: "pointer" }}
                      >
                        <option value="5">5 Sao (Tuyệt vời)</option>
                        <option value="4">4 Sao (Rất tốt)</option>
                        <option value="3">3 Sao (Bình thường)</option>
                        <option value="2">2 Sao (Kém)</option>
                        <option value="1">1 Sao (Rất kém)</option>
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
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Edit3 className="w-4 h-4" /> Gửi Đánh Giá Ngay
                      </button>
                    </div>
                  </form>

                  {/* Star Filter Pills & Customer Review List Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                        <MessageSquare className="w-4 h-4 text-emerald-700" /> Nhận xét từ khách hàng ({filteredReviews.length}/{totalReviewsCount}):
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Mới nhất trước</span>
                    </div>

                    {/* Star Filter Pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedStarFilter("all")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "1px solid",
                          borderColor: selectedStarFilter === "all" ? "var(--primary-color)" : "#cbd5e1",
                          background: selectedStarFilter === "all" ? "var(--primary-color)" : "#ffffff",
                          color: selectedStarFilter === "all" ? "#ffffff" : "#334155",
                          cursor: "pointer",
                        }}
                      >
                        Tất cả ({totalReviewsCount})
                      </button>
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = allMockReviews.filter((r) => r.rating === star).length;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedStarFilter(star)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 700,
                              border: "1px solid",
                              borderColor: selectedStarFilter === star ? "var(--primary-color)" : "#cbd5e1",
                              background: selectedStarFilter === star ? "var(--primary-color)" : "#ffffff",
                              color: selectedStarFilter === star ? "#ffffff" : "#334155",
                              cursor: "pointer",
                            }}
                          >
                            {star} Sao ({count})
                          </button>
                        );
                      })}
                    </div>

                    {/* Reviews List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "480px", overflowY: "auto", paddingRight: "4px" }}>
                      {filteredReviews.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "13px" }}>
                          Không có nhận xét nào với số sao đã chọn.
                        </div>
                      ) : (
                        filteredReviews.map((rev) => (
                          <div key={rev.id} style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{rev.name}</strong>
                                {rev.isVerified && (
                                  <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã mua hàng
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: "12px", color: "#94a3b8" }}>{rev.date}</span>
                            </div>
                            <div style={{ fontSize: "13px", marginBottom: "6px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    color: i < rev.rating ? "#f59e0b" : "#cbd5e1",
                                    fill: i < rev.rating ? "#f59e0b" : "#f1f5f9",
                                  }}
                                />
                              ))}
                            </div>
                            <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      )}
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
                    <div className="related-stars" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>5.0 ({relProd.reviews || 25})</span>
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
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 15px" }}>Đang tải thông tin sản phẩm...</div>}>
      <ProductDetailPageContent {...props} />
    </Suspense>
  );
}
