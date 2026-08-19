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
  RefreshCw,
  Award,
  Copy,
  Check,
  AlertCircle,
  Flame,
  Bell,
  Star,
  Edit3,
  Share2,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Sparkles,
  BookOpen,
  Maximize2,
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
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "all">("all");
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Interactive Variant States
  const [selectedColor, setSelectedColor] = useState<"soi" | "occho" | "trangkem">("soi");
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L">("M");
  const [deliveryCity, setDeliveryCity] = useState<"hn" | "hcm" | "dn" | "khac">("hn");
  const [activeInfoTab, setActiveInfoTab] = useState<"showroom" | "baoquan" | "danhgia">("showroom");

  // Dynamic Price Multiplier based on Size
  const sizeMultiplier = selectedSize === "S" ? 0.9 : selectedSize === "L" ? 1.2 : 1.0;
  const finalDisplayPrice = Math.round(effectivePrice * sizeMultiplier);

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

  // Gallery Images
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
      <main className="main-content" style={{ paddingTop: "24px" }}>
        <div className="container">
          {/* 1. Main Product Hero Section (3 Columns Layout) */}
          <div className="product-detail-hero">
            {/* Column 1: Image Gallery & Social Share */}
            <div>
              <div className="product-gallery">
                {/* Thumbnails list */}
                <div className="gallery-thumbnails" id="gallery-thumbs">
                  {galleryImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className={`thumb-item ${activeImageIndex === idx ? "active" : ""}`}
                      onClick={() => setActiveImageIndex(idx)}
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
                <div className="gallery-main-image" style={{ position: "relative" }}>
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

              {/* Social Share Bar Under Image Gallery */}
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
                  <Share2 className="w-4 h-4 text-emerald-700" /> Chia sẻ sản phẩm qua ứng dụng:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 4px", background: "#1877f2", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://zalo.me/share?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 4px", background: "#0068ff", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    Zalo
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "6px 4px", background: "#229ed9", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    Telegram
                  </a>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                      }
                    }}
                    style={{ padding: "6px 4px", background: copied ? "#166534" : "#ffffff", color: copied ? "#fff" : "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    {copied ? "Đã chép!" : "Sao chép"}
                  </button>
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
                  ({product.reviews || 48} đánh giá xác thực)
                </span>
              </div>

              {/* Price Box */}
              <div className="price-detail-box" style={{ marginBottom: "14px" }}>
                <span className="price-main" style={{ fontSize: "26px" }}>{formatVND(finalDisplayPrice)}</span>
                {product.oldPrice && (
                  <>
                    <span className="price-original">
                      {formatVND(Math.round(product.oldPrice * sizeMultiplier))}
                    </span>
                    <span className="badge-discount">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Product Voucher Offer Box */}
              <ProductVoucherBox />

              {/* Color Swatches Control */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "8px" }}>
                  Tông màu chất liệu:
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[
                    { id: "soi", label: "Gỗ Sồi Tự Nhiên 🪵", color: "#d97706" },
                    { id: "occho", label: "Gỗ Óc Chó Tối 🌰", color: "#78350f" },
                    { id: "trangkem", label: "Trắng Kem Nordics ⚪", color: "#f1f5f9" },
                  ].map((c) => {
                    const isSelected = selectedColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.id as any)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: isSelected ? "2px solid var(--primary-color)" : "1px solid #cbd5e1",
                          background: isSelected ? "#f0fdf4" : "#ffffff",
                          color: isSelected ? "var(--primary-color)" : "#334155",
                          cursor: "pointer",
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Picker Control */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "8px" }}>
                  Chọn kích thước tiêu chuẩn:
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[
                    { id: "S", label: "Size S (Khu Vực Nhỏ)" },
                    { id: "M", label: "Size M (Chuẩn Phòng Khách)" },
                    { id: "L", label: "Size L (Căn Hộ Rộng)" },
                  ].map((sz) => {
                    const isSelected = selectedSize === sz.id;
                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setSelectedSize(sz.id as any)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: isSelected ? "2px solid var(--primary-color)" : "1px solid #cbd5e1",
                          background: isSelected ? "var(--primary-color)" : "#ffffff",
                          color: isSelected ? "#ffffff" : "#334155",
                          cursor: "pointer",
                        }}
                      >
                        {sz.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Estimator Box */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "18px",
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
                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}
                  >
                    <option value="hn">Hà Nội (Hỏa tốc 2H)</option>
                    <option value="hcm">TP. Hồ Chí Minh (Giao trong 24h)</option>
                    <option value="dn">Đà Nẵng (Giao trong 48h)</option>
                    <option value="khac">Tỉnh thành khác (Freeship)</option>
                  </select>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534" }}>
                  {deliveryCity === "hn" ? "⚡ Giao ngay hôm nay" : "🚚 Nhận trong 2-3 ngày"}
                </span>
              </div>

              <p className="product-short-desc">
                {product.description ||
                  "Bộ bình gốm sứ trang trí mang phong cách tối giản hiện đại. Bề mặt phủ men mờ mịn màng cùng màu sắc pastel hài hòa tinh tế."}
              </p>

              {/* Quantity & Action Buttons */}
              <div className="quantity-wrapper">
                <span className="quantity-label">Số lượng:</span>
                <div className="quantity-controls">
                  <button className="btn-qty" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                  <input type="text" className="input-qty" value={quantity} readOnly />
                  <button className="btn-qty" onClick={() => setQuantity((q) => q + 1)}>+</button>
                </div>
              </div>

              <div className="action-buttons-wrapper">
                <button
                  className="btn-add-cart-main"
                  onClick={() => addToCart({ ...currentProduct, price: finalDisplayPrice }, quantity)}
                >
                  <ShoppingCart className="w-5 h-5 text-white" /> Thêm Vào Giỏ Hàng
                </button>
                <button
                  className="btn-buy-now-main"
                  onClick={() => {
                    addToCart({ ...currentProduct, price: finalDisplayPrice }, quantity);
                    router.push("/checkout");
                  }}
                >
                  <Zap className="w-5 h-5 text-white" /> Mua Ngay Nhanh
                </button>
                <button
                  className={`btn-wishlist-detail ${isWishlisted(currentProduct.id) ? "active" : ""}`}
                  onClick={() => toggleWishlist(currentProduct.id)}
                  title="Thêm vào yêu thích"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted(currentProduct.id) ? "text-red-500 fill-red-500" : "text-slate-400"}`} />
                </button>
              </div>

              {/* Horizontal 3 Trust Badges Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <strong style={{ fontSize: "11.5px", display: "block", color: "#0f172a" }}>Miễn phí giao hàng</strong>
                    <span style={{ fontSize: "10.5px", color: "#64748b" }}>Đơn từ 500k</span>
                  </div>
                </div>
                <div style={{ padding: "8px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <strong style={{ fontSize: "11.5px", display: "block", color: "#0f172a" }}>Bảo hành 12 tháng</strong>
                    <span style={{ fontSize: "10.5px", color: "#64748b" }}>Đổi trả 1-1 30 ngày</span>
                  </div>
                </div>
                <div style={{ padding: "8px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award className="w-4 h-4 text-amber-600" />
                  <div>
                    <strong style={{ fontSize: "11.5px", display: "block", color: "#0f172a" }}>Chính hãng 100%</strong>
                    <span style={{ fontSize: "10.5px", color: "#64748b" }}>Gỗ sồi chọn lọc</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Product Specifications Cards */}
            <div className="specifications-col">
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
                          <td className="spec-value">Gỗ sồi tự nhiên / Tre đan</td>
                        </tr>
                        <tr>
                          <td className="spec-label">Màu sắc</td>
                          <td className="spec-value">Kem mờ, Xanh ngọc, Trắng</td>
                        </tr>
                        <tr>
                          <td className="spec-label">Kích thước</td>
                          <td className="spec-value">Chuẩn phòng khách Nordics</td>
                        </tr>
                        <tr>
                          <td className="spec-label">Trọng lượng</td>
                          <td className="spec-value">1.2 - 15 kg</td>
                        </tr>
                        <tr>
                          <td className="spec-label">Xuất xứ</td>
                          <td className="spec-value">Việt Nam (Hàng xuất khẩu)</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="spec-card">
                <div className="spec-card-title">GIAO HÀNG & BẢO HÀNH</div>
                <ul className="spec-delivery-list">
                  <li>
                    <strong>Giao hàng toàn quốc:</strong>
                    <span> Nhận hàng sau 2-4 ngày làm việc.</span>
                  </li>
                  <li>
                    <strong>Kiểm tra khi nhận:</strong>
                    <span> Được đồng kiểm sản phẩm trước khi thanh toán.</span>
                  </li>
                  <li>
                    <strong>Bảo hành chính hãng:</strong>
                    <span> 12 tháng cho lỗi từ nhà sản xuất.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. "Complete The Look" Combo Offer Recommendation Section */}
          <ProductComboOffer currentProduct={currentProduct} />

          {/* 3. Multi-Tab Deep Info Section */}
          <div style={{ marginTop: "36px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "1.5rem", padding: "28px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            {/* Tab Navigation Header */}
            <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #f1f5f9", paddingBottom: "14px", marginBottom: "24px" }}>
              <button
                type="button"
                onClick={() => setActiveInfoTab("showroom")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 800,
                  border: "none",
                  background: activeInfoTab === "showroom" ? "var(--primary-color)" : "#f1f5f9",
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
                  padding: "10px 20px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 800,
                  border: "none",
                  background: activeInfoTab === "baoquan" ? "var(--primary-color)" : "#f1f5f9",
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
                  padding: "10px 20px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 800,
                  border: "none",
                  background: activeInfoTab === "danhgia" ? "var(--primary-color)" : "#f1f5f9",
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
                <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                  <img
                    src={fixImagePath("/assets/images/banner/banner-trang-chu-mini-shop.webp")}
                    alt="Phối cảnh Showroom MINI-SHOP"
                    style={{ width: "100%", maxHeight: "380px", objectFit: "cover" }}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Care Instructions */}
            {activeInfoTab === "baoquan" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14.5px", color: "#334155", lineHeight: 1.7 }}>
                <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <strong style={{ color: "#0f172a" }}>1. Vệ sinh hằng ngày:</strong> Lau nhẹ bụi bằng khăn sợi microfiber ẩm mềm mịn. Hạn chế dùng hóa chất tẩy rửa mạnh làm ảnh hưởng lớp phủ men sáp.
                </div>
                <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <strong style={{ color: "#0f172a" }}>2. Độ ẩm & Ánh nắng:</strong> Tránh đặt sản phẩm trực tiếp dưới ánh nắng mặt trời gay gắt hoặc khu vực quá ẩm ướt trong thời gian dài.
                </div>
                <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <strong style={{ color: "#0f172a" }}>3. Bảo dưỡng định kỳ:</strong> Sử dụng sáp dưỡng gỗ tự nhiên chuyên dụng 6 tháng/lần để giữ cho bề mặt sản phẩm luôn sáng bóng như mới.
                </div>
              </div>
            )}

            {/* Tab 3: Customer Reviews (⭐ 5 Gold Stars) */}
            {activeInfoTab === "danhgia" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", alignItems: "start" }}>
                {/* Score Breakdown */}
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "44px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>4.9</div>
                  <div style={{ margin: "8px 0 4px", display: "inline-flex", justifyContent: "center", gap: "3px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} style={{ width: "16px", height: "16px", color: "#f59e0b", fill: "#f59e0b" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                    Dựa trên {totalReviewsCount} đánh giá xác thực
                  </div>

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
                  </div>
                </div>

                {/* Reviews List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                    {[5, 4, 3].map((star) => {
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

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto" }}>
                    {filteredReviews.map((rev) => (
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
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Related Products Section */}
          <section className="related-products-section" style={{ marginTop: "48px" }}>
            <div className="related-header">
              <h2 className="related-title">SẢN PHẨM LIÊN QUAN</h2>
            </div>

            <div className="related-grid">
              {relatedProducts.map((rel) => {
                return (
                  <div key={rel.id} className="related-card">
                    <div className="related-img-wrapper">
                      <Link href={`/products/${rel.id}`}>
                        <img src={fixImagePath(rel.image)} alt={rel.name} />
                      </Link>
                    </div>
                    <div className="related-info">
                      <h3 className="related-product-title">
                        <Link href={`/products/${rel.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {rel.name}
                        </Link>
                      </h3>
                      <div className="related-price">{formatVND(rel.price)}</div>
                      <div className="related-stars" style={{ display: "inline-flex", gap: "2px" }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} style={{ width: "12px", height: "12px", color: "#f59e0b", fill: "#f59e0b" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
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
