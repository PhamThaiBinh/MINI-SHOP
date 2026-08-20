"use client";

import React, { useState, use, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Sparkles,
  BookOpen,
  ArrowRight,
  Share2,
  Check,
  Ruler,
  Send,
  MessageSquare,
} from "lucide-react";

import { ProductComboOffer } from "@/components/shop/ProductComboOffer";
import { ProductSizeChartModal } from "@/components/shop/ProductSizeChartModal";

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
  const searchParams = useSearchParams();
  const flashSalePriceParam = searchParams ? searchParams.get("flashSalePrice") : null;
  const flashSalePrice = flashSalePriceParam ? parseInt(flashSalePriceParam, 10) : null;

  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10) || 1;

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
  const isFlashSaleActive = flashSalePrice !== null && !isNaN(flashSalePrice);
  const effectivePrice = isFlashSaleActive ? flashSalePrice : currentProduct.price;

  const displayOldPrice = isFlashSaleActive
    ? currentProduct.price
    : currentProduct.oldPrice;

  const discountPercent = isFlashSaleActive
    ? Math.round(((currentProduct.price - flashSalePrice) / currentProduct.price) * 100)
    : currentProduct.oldPrice
    ? Math.round(((currentProduct.oldPrice - currentProduct.price) / currentProduct.oldPrice) * 100)
    : 0;

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Variant Controls State
  const [selectedColor, setSelectedColor] = useState<"soi" | "occho" | "trangkem">("soi");
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L">("M");
  const [activeInfoTab, setActiveInfoTab] = useState<"showroom" | "baoquan" | "danhgia">("showroom");

  // Dynamic Price Multiplier based on Size
  const sizeMultiplier = selectedSize === "S" ? 0.9 : selectedSize === "L" ? 1.2 : 1.0;
  const finalDisplayPrice = Math.round(effectivePrice * sizeMultiplier);

  const totalReviewsCount = currentProduct.reviews || 20;
  const initialReviews = useMemo(
    () => generateMockReviews(productId, totalReviewsCount),
    [productId, totalReviewsCount]
  );

  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews);

  // Review Form Input States
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerComment, setReviewerComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    const newRev: ReviewItem = {
      id: Date.now(),
      name: reviewerName.trim(),
      rating: reviewRating,
      date: "Vừa xong",
      comment: reviewerComment.trim(),
      isVerified: true,
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewerName("");
    setReviewerComment("");
    setReviewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const galleryImages = [
    currentProduct.image,
    "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
    "/assets/images/products/bo-binh-gom-minimal.webp",
    "/assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp",
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
          {toastMsg && (
            <div
              style={{
                padding: "12px 18px",
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                borderRadius: "1rem",
                fontSize: "13.5px",
                fontWeight: 800,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 14px rgba(22, 101, 52, 0.1)",
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

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
                      type="button"
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
                    ({reviewsList.length} đánh giá xác thực)
                  </span>
                </div>

                {/* Price Display Box */}
                {isFlashSaleActive && (
                  <div style={{ fontSize: "12px", fontWeight: 900, color: "#dc2626", background: "#fee2e2", padding: "4px 12px", borderRadius: "999px", width: "fit-content", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Zap className="w-3.5 h-3.5 fill-red-600" /> GIÁ ƯU ĐÃI FLASH SALE
                  </div>
                )}
                <div className="price-display-hero">
                  <span className="price-display-main">{formatVND(finalDisplayPrice)}</span>
                  {displayOldPrice && (
                    <>
                      <span className="price-display-old">{formatVND(Math.round(displayOldPrice * sizeMultiplier))}</span>
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

                {/* Size Selector Control & Size Chart Button */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#334155" }}>
                      Kích thước tiêu chuẩn:
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSizeChartOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "var(--primary-color, #2e7d32)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        textDecoration: "underline",
                      }}
                    >
                      <Ruler className="w-3.5 h-3.5" /> Bảng Tra Kích Thước S, M, L
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { id: "S", label: "Size S" },
                      { id: "M", label: "Size M" },
                      { id: "L", label: "Size L" },
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
                    onClick={() => {
                      addToCart({ ...currentProduct, price: finalDisplayPrice }, quantity);
                      setAddedToCart(true);
                      setToastMsg(`Đã thêm ${quantity} sản phẩm "${currentProduct.name}" vào giỏ hàng thành công!`);
                      setTimeout(() => {
                        setAddedToCart(false);
                        setToastMsg("");
                      }, 2500);
                    }}
                    style={{
                      background: addedToCart ? "#166534" : "var(--primary-color, #2e7d32)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>{addedToCart ? `✓ Đã Thêm Giỏ Hàng (${quantity})!` : "+ Thêm Giỏ Hàng"}</span>
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
                      <Zap className="w-4 h-4 text-slate-900" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(currentProduct.id)}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: isWishlisted(currentProduct.id) ? "1.5px solid #fecaca" : "1px solid #cbd5e1",
                      background: isWishlisted(currentProduct.id) ? "#fef2f2" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: isWishlisted(currentProduct.id) ? "0 4px 14px rgba(239, 68, 68, 0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: isWishlisted(currentProduct.id) ? "scale(1.08)" : "scale(1)",
                    }}
                    title={isWishlisted(currentProduct.id) ? "Đã yêu thích - Bấm để bỏ" : "Thêm vào danh sách yêu thích"}
                  >
                    <Heart
                      style={{
                        width: "20px",
                        height: "20px",
                        color: isWishlisted(currentProduct.id) ? "#ef4444" : "#94a3b8",
                        fill: isWishlisted(currentProduct.id) ? "#ef4444" : "none",
                        transition: "all 0.2s ease",
                        transform: isWishlisted(currentProduct.id) ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </button>
                </div>

                {/* Refined Triple Trust Hardware Grid */}
                <div className="trust-doppelrand-grid">
                  <div className="trust-item-card">
                    <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" style={{ marginTop: "2px" }} />
                    <div className="trust-item-text">
                      <strong className="trust-item-title">Miễn phí vận chuyển</strong>
                      <span>Đơn từ 500k toàn quốc</span>
                    </div>
                  </div>
                  <div className="trust-item-card">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" style={{ marginTop: "2px" }} />
                    <div className="trust-item-text">
                      <strong className="trust-item-title">Bảo hành 12 tháng</strong>
                      <span>Đổi trả 1-1 trong 30 ngày</span>
                    </div>
                  </div>
                  <div className="trust-item-card">
                    <Award className="w-4 h-4 text-amber-600 flex-shrink-0" style={{ marginTop: "2px" }} />
                    <div className="trust-item-text">
                      <strong className="trust-item-title">Chính hãng 100%</strong>
                      <span>Gỗ sồi xuất khẩu</span>
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
                  <Star style={{ width: "16px", height: "16px", color: activeInfoTab === "danhgia" ? "#ffffff" : "#f59e0b", fill: activeInfoTab === "danhgia" ? "#ffffff" : "#f59e0b" }} /> Đánh Giá Khách Hàng ({reviewsList.length})
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
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fixImagePath(currentProduct.image);
                      }}
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

              {/* Tab 3: Customer Reviews & Interactive Review Form */}
              {activeInfoTab === "danhgia" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
                  {/* Left: Score Breakdown & Review Submission Form */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ background: "#f8fafc", borderRadius: "1.25rem", padding: "24px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                      <div style={{ fontSize: "44px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>4.9</div>
                      <div style={{ margin: "8px 0 4px", display: "inline-flex", justifyContent: "center", gap: "3px" }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} style={{ width: "16px", height: "16px", color: "#f59e0b", fill: "#f59e0b" }} />
                        ))}
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                        Dựa trên {reviewsList.length} đánh giá xác thực
                      </div>
                    </div>

                    {/* Interactive Review Form */}
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "1.25rem", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 900, color: "#0f172a", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                        <MessageSquare className="w-4 h-4 text-emerald-700" /> Viết Đánh Giá Của Bạn
                      </h4>

                      {reviewSubmitted ? (
                        <div style={{ padding: "14px", background: "#dcfce7", color: "#15803d", borderRadius: "10px", fontSize: "13px", fontWeight: 800, textAlign: "center" }}>
                          ✓ Cảm ơn bạn! Đánh giá của bạn đã được đăng thành công.
                        </div>
                      ) : (
                        <form onSubmit={handleAddReview} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "4px" }}>
                              Đánh giá số sao:
                            </label>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                                >
                                  <Star
                                    style={{
                                      width: "22px",
                                      height: "22px",
                                      color: star <= (hoverRating || reviewRating) ? "#f59e0b" : "#cbd5e1",
                                      fill: star <= (hoverRating || reviewRating) ? "#f59e0b" : "#f1f5f9",
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Họ và tên của bạn *"
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              required
                              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                            />
                          </div>

                          <div>
                            <textarea
                              placeholder="Chia sẻ cảm nhận chi tiết về chất liệu, độ đặn và chất lượng sản phẩm..."
                              rows={3}
                              value={reviewerComment}
                              onChange={(e) => setReviewerComment(e.target.value)}
                              required
                              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" }}
                            />
                          </div>

                          <button
                            type="submit"
                            style={{
                              padding: "10px 16px",
                              borderRadius: "8px",
                              background: "var(--primary-color, #2e7d32)",
                              color: "#ffffff",
                              fontSize: "13px",
                              fontWeight: 800,
                              border: "none",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <Send className="w-3.5 h-3.5" /> Gửi Đánh Giá Ngay
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Right: Reviews List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "540px", overflowY: "auto" }}>
                    {reviewsList.map((rev) => (
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
                        <img
                          src={fixImagePath(rel.image)}
                          alt={rel.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/images/products/bo-binh-gom-minimal.webp";
                          }}
                        />
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

      {/* Interactive Size Chart Modal */}
      <ProductSizeChartModal
        product={currentProduct}
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
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
