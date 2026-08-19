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
import {
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  Award,
  Star,
  CheckCircle2,
  MapPin,
  Sparkles,
  BookOpen,
  ArrowRight,
  Share2,
  Check,
  Copy,
  Flame,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import { ProductVoucherBox } from "@/components/shop/ProductVoucherBox";
import { ProductComboOffer } from "@/components/shop/ProductComboOffer";

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
    "Hoàng Ngọc Ánh", "Nông Văn Cường", "Phan Gia Hưng", "Trịnh Bảo Ngọc"
  ];

  const comments5Star = [
    "Sản phẩm cực kỳ chất lượng, hoàn thiện sắc nét đúng như mô tả. Đóng gói rất cẩn thận nhiều lớp chống sốc.",
    "Giao hàng siêu nhanh! Đặt chiều hôm trước sáng hôm sau đã nhận được. Chất liệu gỗ gốm sứ cao cấp.",
    "Đáng tiền từng xu! Đặt decor phòng khách ai đến chơi cũng khen đẹp và tinh tế. Shop phục vụ 10/5 sao!",
    "Thiết kế chuẩn phong cách Bắc Âu tối giản, sang trọng. Hàng giao nguyên vẹn không sứt mẻ gì."
  ];

  const list: ReviewItem[] = [];
  const now = new Date(2026, 7, 18);

  for (let i = 0; i < totalCount; i++) {
    const seed = (productId * 9301 + i * 49297) % 233280;
    const name = names[seed % names.length];
    const rating = 5;
    const comment = comments5Star[i % comments5Star.length];
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
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "all">("all");

  // Variant Controls State
  const [selectedColor, setSelectedColor] = useState<"soi" | "occho" | "trangkem">("soi");
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L">("M");
  const [deliveryCity, setDeliveryCity] = useState<"hn" | "hcm" | "dn" | "khac">("hn");
  const [activeInfoTab, setActiveInfoTab] = useState<"showroom" | "baoquan" | "danhgia">("showroom");

  const sizeMultiplier = selectedSize === "S" ? 0.9 : selectedSize === "L" ? 1.2 : 1.0;
  const finalDisplayPrice = Math.round(effectivePrice * sizeMultiplier);

  const totalReviewsCount = currentProduct.reviews || 20;
  const allMockReviews = useMemo(
    () => generateMockReviews(productId, totalReviewsCount),
    [productId, totalReviewsCount]
  );

  const filteredReviews = selectedStarFilter === "all"
    ? allMockReviews
    : allMockReviews.filter((r) => r.rating === selectedStarFilter);

  const galleryImages = [
    currentProduct.image,
    "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
    "/assets/images/products/bo-binh-gom-minimal.webp",
    "/assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp",
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const discountPercent = currentProduct.oldPrice
    ? Math.round((1 - currentProduct.price / currentProduct.oldPrice) * 100)
    : 0;

  const sameCatProducts = allProducts.filter(
    (p) => p.id !== currentProduct.id && (p.category === currentProduct.category || p.categoryName === currentProduct.categoryName)
  );
  const otherProducts = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.category !== currentProduct.category && p.categoryName !== currentProduct.categoryName
  );
  const relatedProducts = [...sameCatProducts, ...otherProducts].slice(0, 4);

  return (
    <>
      <main className="main-content" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
        <div className="container">
          {/* Breadcrumb Bar */}
          <div className="breadcrumb-section" style={{ marginBottom: "20px" }}>
            <ul className="breadcrumb">
              <li><Link href="/">Trang chủ</Link></li>
              <li className="breadcrumb-separator">/</li>
              <li><Link href="/products">Sản phẩm</Link></li>
              <li className="breadcrumb-separator">/</li>
              <li className="breadcrumb-current">{currentProduct.name}</li>
            </ul>
          </div>

          {/* 1. High-End Editorial Split Grid (Double-Bezel Architecture) */}
          <div className="editorial-detail-grid">
            {/* Left Col: Doppelrand Image Gallery Shell */}
            <div className="doppelrand-outer">
              <div className="doppelrand-inner">
                <div className="gallery-wrapper-doppelrand">
                  {/* Vertical Thumbnails */}
                  <div className="gallery-thumbs-vertical">
                    {galleryImages.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className={`thumb-hardware-card ${activeImageIndex === idx ? "active" : ""}`}
                        onClick={() => setActiveImageIndex(idx)}
                      >
                        <div className="thumb-hardware-inner">
                          <img
                            src={fixImagePath(imgSrc)}
                            alt={`Thumb ${idx + 1}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fixImagePath(currentProduct.image);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Display Image */}
                  <div className="gallery-main-hardware">
                    <div className="gallery-main-inner">
                      <img
                        src={fixImagePath(galleryImages[activeImageIndex])}
                        alt={currentProduct.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fixImagePath(currentProduct.image);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Share Bar */}
                <div
                  style={{
                    marginTop: "20px",
                    padding: "12px 16px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Share2 className="w-4 h-4 text-emerald-700" /> Chia sẻ sản phẩm:
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "5px 10px", background: "#1877f2", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none" }}
                    >
                      Facebook
                    </a>
                    <a
                      href={`https://zalo.me/share?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "5px 10px", background: "#0068ff", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none" }}
                    >
                      Zalo
                    </a>
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard.writeText(window.location.href);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 3000);
                        }
                      }}
                      style={{ padding: "5px 10px", background: copied ? "#166534" : "#ffffff", color: copied ? "#fff" : "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                    >
                      {copied ? "Đã chép!" : "Sao chép link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Doppelrand Product Info Shell */}
            <div className="doppelrand-outer">
              <div className="doppelrand-inner">
                {/* Eyebrow Tag */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span className="eyebrow-pill">
                    <Sparkles className="w-3.5 h-3.5" /> NORDIC COLLECTION 2026
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534", background: "#dcfce7", padding: "2px 10px", borderRadius: "999px" }}>
                    Chính Hãng 100%
                  </span>
                </div>

                {/* Product Name */}
                <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: "0 0 10px 0", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                  {currentProduct.name}
                </h1>

                {/* 5 Gold Rating Stars */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <div style={{ display: "inline-flex", gap: "3px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} style={{ width: "16px", height: "16px", color: "#f59e0b", fill: "#f59e0b" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#64748b" }}>
                    ({currentProduct.reviews || 48} đánh giá xác thực)
                  </span>
                </div>

                {/* Price Display Box */}
                <div className="price-display-hero">
                  <span className="price-display-main">{formatVND(finalDisplayPrice)}</span>
                  {currentProduct.oldPrice && (
                    <>
                      <span className="price-display-old">{formatVND(Math.round(currentProduct.oldPrice * sizeMultiplier))}</span>
                      <span className="price-badge-discount">-{discountPercent}%</span>
                    </>
                  )}
                </div>

                {/* Color Swatches Control */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "8px" }}>
                    Tông màu chất liệu:
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { id: "soi", label: "Gỗ Sồi Tự Nhiên 🪵" },
                      { id: "occho", label: "Gỗ Óc Chó Tối 🌰" },
                      { id: "trangkem", label: "Trắng Kem Nordics ⚪" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`swatch-pill-btn ${selectedColor === c.id ? "active" : ""}`}
                        onClick={() => setSelectedColor(c.id as any)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector Control */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "8px" }}>
                    Kích thước tiêu chuẩn:
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { id: "S", label: "Size S (Khu Vực Nhỏ)" },
                      { id: "M", label: "Size M (Standard)" },
                      { id: "L", label: "Size L (Căn Hộ Rộng)" },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        className={`swatch-pill-btn ${selectedSize === sz.id ? "active" : ""}`}
                        onClick={() => setSelectedSize(sz.id as any)}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Estimator Box */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "1rem",
                    padding: "12px 16px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155" }}>Giao đến:</span>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value as any)}
                      style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}
                    >
                      <option value="hn">Hà Nội (Hỏa tốc 2H)</option>
                      <option value="hcm">TP. Hồ Chí Minh (Giao 24h)</option>
                      <option value="dn">Đà Nẵng (Giao 48h)</option>
                      <option value="khac">Tỉnh khác (Freeship)</option>
                    </select>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534" }}>
                    {deliveryCity === "hn" ? "⚡ Giao ngay hôm nay" : "🚚 Nhận trong 2-3 ngày"}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#334155" }}>Số lượng:</span>
                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "999px", overflow: "hidden", background: "#f8fafc" }}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ width: "36px", height: "36px", border: "none", background: "none", fontSize: "16px", fontWeight: 800, cursor: "pointer" }}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      style={{ width: "40px", textAlign: "center", border: "none", background: "none", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      style={{ width: "36px", height: "36px", border: "none", background: "none", fontSize: "16px", fontWeight: 800, cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Button-in-Button (Nested CTA) Action Suite */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                  <button
                    type="button"
                    className="btn-nested-primary"
                    onClick={() => addToCart({ ...currentProduct, price: finalDisplayPrice }, quantity)}
                  >
                    <span>+ Thêm Giỏ Hàng</span>
                    <div className="btn-nested-icon-capsule">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-nested-secondary"
                    onClick={() => {
                      addToCart({ ...currentProduct, price: finalDisplayPrice }, quantity);
                      router.push("/checkout");
                    }}
                  >
                    <span>Mua Ngay Nhanh</span>
                    <div className="btn-nested-icon-capsule">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(currentProduct.id)}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    title="Yêu thích"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted(currentProduct.id) ? "text-red-500 fill-red-500" : "text-slate-400"}`} />
                  </button>
                </div>

                {/* Triple Trust Hardware Items */}
                <div className="trust-doppelrand-grid">
                  <div className="trust-item-card">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <strong style={{ fontSize: "11.5px", display: "block", color: "#0f172a" }}>Miễn phí vận chuyển</strong>
                      <span style={{ fontSize: "10.5px", color: "#64748b" }}>Đơn từ 500k</span>
                    </div>
                  </div>
                  <div className="trust-item-card">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <strong style={{ fontSize: "11.5px", display: "block", color: "#0f172a" }}>Bảo hành 12 tháng</strong>
                      <span style={{ fontSize: "10.5px", color: "#64748b" }}>Đổi trả 1-1 30 ngày</span>
                    </div>
                  </div>
                  <div className="trust-item-card">
                    <Award className="w-4 h-4 text-amber-600" />
                    <div>
                      <strong style={{ fontSize: "11.5px", display: "block", color: "#0f172a" }}>Chính hãng 100%</strong>
                      <span style={{ fontSize: "10.5px", color: "#64748b" }}>Gỗ sồi chuẩn xuất khẩu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. "Complete The Look" Combo Bundle Offer Section */}
          <ProductComboOffer currentProduct={currentProduct} />

          {/* 3. Multi-Tab Info Module (Doppelrand Shell) */}
          <div className="doppelrand-outer" style={{ marginTop: "36px" }}>
            <div className="doppelrand-inner">
              {/* Tab Header Pills */}
              <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid #f1f5f9", paddingBottom: "16px", marginBottom: "24px" }}>
                <button
                  type="button"
                  onClick={() => setActiveInfoTab("showroom")}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 800,
                    border: "none",
                    background: activeInfoTab === "showroom" ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                    color: activeInfoTab === "showroom" ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <BookOpen className="w-4 h-4" /> Mô Tả & Phối Cảnh Showroom
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInfoTab("baoquan")}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 800,
                    border: "none",
                    background: activeInfoTab === "baoquan" ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                    color: activeInfoTab === "baoquan" ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles className="w-4 h-4" /> Hướng Dẫn Bảo Quản
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInfoTab("danhgia")}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 800,
                    border: "none",
                    background: activeInfoTab === "danhgia" ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                    color: activeInfoTab === "danhgia" ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Star style={{ width: "16px", height: "16px", color: activeInfoTab === "danhgia" ? "#ffffff" : "#f59e0b", fill: activeInfoTab === "danhgia" ? "#ffffff" : "#f59e0b" }} /> Đánh Giá Khách Hàng ({totalReviewsCount})
                </button>
              </div>

              {/* Tab 1: Showroom Description */}
              {activeInfoTab === "showroom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <p style={{ fontSize: "15px", color: "#334155", lineHeight: 1.75, margin: 0 }}>
                    {currentProduct.description ||
                      "Sản phẩm được chế tác tỉ mỉ từ dòng gỗ sồi tự nhiên đạt chuẩn sấy an toàn, chống cong vênh mối mọt tối đa. Bề mặt phủ lớp lau sáp mờ mịn màng tôn vinh trọn vẹn vân gỗ ấm áp, mang lại điểm nhấn sang trọng Bắc Âu cho căn hộ của bạn."}
                  </p>
                  <div style={{ borderRadius: "1.5rem", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <img
                      src={fixImagePath("/assets/images/banner/banner-trang-chu-mini-shop.webp")}
                      alt="Phối cảnh Showroom MINI-SHOP"
                      style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Maintenance Guide */}
              {activeInfoTab === "baoquan" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14.5px", color: "#334155", lineHeight: 1.7 }}>
                  <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
                    <strong style={{ color: "#0f172a" }}>1. Vệ sinh định kỳ:</strong> Lau nhẹ bụi bằng khăn microfiber ẩm mềm mịn. Hạn chế dùng hóa chất tẩy rửa mạnh làm ảnh hưởng lớp phủ sáp gỗ mờ.
                  </div>
                  <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
                    <strong style={{ color: "#0f172a" }}>2. Ánh nắng & Độ ẩm:</strong> Tránh đặt sản phẩm trực tiếp dưới ánh nắng gay gắt hoặc môi trường quá ẩm ướt trong thời gian dài.
                  </div>
                  <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
                    <strong style={{ color: "#0f172a" }}>3. Bảo dưỡng chuyên sâu:</strong> Sử dụng dung dịch bảo dưỡng gỗ sồi chuyên dụng 6 tháng/lần để duy trì độ mịn màng bóng bẩy tự nhiên.
                  </div>
                </div>
              )}

              {/* Tab 3: Customer Reviews (⭐ 5 Gold Stars) */}
              {activeInfoTab === "danhgia" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", alignItems: "start" }}>
                  <div style={{ background: "#f8fafc", borderRadius: "1.25rem", padding: "24px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <div style={{ fontSize: "44px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>4.9</div>
                    <div style={{ margin: "8px 0 4px", display: "inline-flex", justifyContent: "center", gap: "3px" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} style={{ width: "16px", height: "16px", color: "#f59e0b", fill: "#f59e0b" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                      Dựa trên {totalReviewsCount} đánh giá xác thực
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto" }}>
                    {filteredReviews.map((rev) => (
                      <div key={rev.id} style={{ padding: "16px", background: "#f8fafc", borderRadius: "1rem", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{rev.name}</strong>
                            <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã mua hàng
                            </span>
                          </div>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{rev.date}</span>
                        </div>
                        <div style={{ fontSize: "13px", marginBottom: "6px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} style={{ width: "14px", height: "14px", color: "#f59e0b", fill: "#f59e0b" }} />
                          ))}
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Related Products Section */}
          <section style={{ marginTop: "48px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                SẢN PHẨM LIÊN QUAN CÙNG BỘ SƯU TẬP
              </h2>
              <Link href="/products" style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary-color, #2e7d32)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              {relatedProducts.map((rel) => (
                <div key={rel.id} className="doppelrand-outer">
                  <div className="doppelrand-inner" style={{ padding: "12px" }}>
                    <div style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: "1rem", overflow: "hidden", marginBottom: "10px" }}>
                      <Link href={`/products/${rel.id}`}>
                        <img src={fixImagePath(rel.image)} alt={rel.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Link>
                    </div>
                    <h3 style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Link href={`/products/${rel.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {rel.name}
                      </Link>
                    </h3>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                      {formatVND(rel.price)}
                    </div>
                    <div style={{ display: "inline-flex", gap: "2px", marginTop: "4px" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} style={{ width: "12px", height: "12px", color: "#f59e0b", fill: "#f59e0b" }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "40px 15px", textAlign: "center" }}>Đang tải chi tiết sản phẩm...</div>}>
      <ProductDetailPageContent params={params} />
    </Suspense>
  );
}
