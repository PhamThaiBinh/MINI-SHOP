"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import "@/styles/product-list.css";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";

import { useSearchParams, useRouter } from "next/navigation";
import { Package, Sofa, Bed, Utensils, Lamp, Sparkles, Box, X, Search, Heart, ArrowRight } from "lucide-react";

function ProductsContent() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const initialCat = searchParams.get("category") || "All";
  const initialPrice = searchParams.get("price") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [currentCategory, setCurrentCategory] = useState<string>(initialCat);
  const [currentPriceRange, setCurrentPriceRange] = useState<string>(initialPrice);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [inStockOnly, setInStockOnly] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync searchParams URL -> State
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCurrentCategory(cat);
    const pr = searchParams.get("price");
    if (pr) setCurrentPriceRange(pr);
    const q = searchParams.get("search");
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Sync state changes to URL SearchParams
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== "All") params.set("category", currentCategory);
    if (currentPriceRange && currentPriceRange !== "all") params.set("price", currentPriceRange);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newUrl);
    }
  }, [currentCategory, currentPriceRange, searchQuery]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProductsFromSupabase();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const categories = [
    { id: "All", label: "Tất cả sản phẩm", icon: <Package className="w-4 h-4" /> },
    { id: "C0001", label: "Phòng khách", icon: <Sofa className="w-4 h-4" /> },
    { id: "C0002", label: "Phòng ngủ", icon: <Bed className="w-4 h-4" /> },
    { id: "C0003", label: "Nhà bếp", icon: <Utensils className="w-4 h-4" /> },
    { id: "C0004", label: "Đèn chiếu sáng", icon: <Lamp className="w-4 h-4" /> },
    { id: "C0005", label: "Trang trí", icon: <Sparkles className="w-4 h-4" /> },
    { id: "C0006", label: "Lưu trữ", icon: <Box className="w-4 h-4" /> },
  ];

  const priceRanges = [
    { id: "all", label: "Tất cả mức giá" },
    { id: "under-500k", label: "Dưới 500.000đ" },
    { id: "500k-1m", label: "500.000đ - 1.000.000đ" },
    { id: "1m-3m", label: "1.000.000đ - 3.000.000đ" },
    { id: "over-3m", label: "Trên 3.000.000đ" },
  ];

  const matchesPriceRange = (price: number, range: string) => {
    if (range === "under-500k") return price < 500000;
    if (range === "500k-1m") return price >= 500000 && price <= 1000000;
    if (range === "1m-3m") return price > 1000000 && price <= 3000000;
    if (range === "over-3m") return price > 3000000;
    return true;
  };

  const matchesCategory = (category: string, activeCategory: string, categoryName?: string) => {
    if (!activeCategory || activeCategory === "All" || activeCategory === "all") return true;
    const target = activeCategory.toLowerCase().trim();
    const prodCat = (category || "").toLowerCase().trim();
    const prodName = (categoryName || "").toLowerCase().trim();

    if (prodCat === target || prodName === target) return true;

    const synonymMap: Record<string, string[]> = {
      "c0001": ["c0001", "living room", "phòng khách", "phong khach", "phong-khach"],
      "living room": ["c0001", "living room", "phòng khách", "phong khach", "phong-khach"],
      "phòng khách": ["c0001", "living room", "phòng khách", "phong khach", "phong-khach"],

      "c0002": ["c0002", "bedroom", "phòng ngủ", "phong ngu", "phong-ngu"],
      "bedroom": ["c0002", "bedroom", "phòng ngủ", "phong ngu", "phong-ngu"],
      "phòng ngủ": ["c0002", "bedroom", "phòng ngủ", "phong ngu", "phong-ngu"],

      "c0003": ["c0003", "kitchen", "nhà bếp", "nha bep", "nha-bep", "phòng ăn"],
      "kitchen": ["c0003", "kitchen", "nhà bếp", "nha bep", "nha-bep", "phòng ăn"],
      "nhà bếp": ["c0003", "kitchen", "nhà bếp", "nha bep", "nha-bep", "phòng ăn"],

      "c0004": ["c0004", "lighting", "đèn chiếu sáng", "den chieu sang", "den-chieu-sang", "đèn"],
      "lighting": ["c0004", "lighting", "đèn chiếu sáng", "den chieu sang", "den-chieu-sang", "đèn"],
      "đèn chiếu sáng": ["c0004", "lighting", "đèn chiếu sáng", "den chieu sang", "den-chieu-sang", "đèn"],

      "c0005": ["c0005", "decor", "trang trí", "trang tri", "trang-tri"],
      "decor": ["c0005", "decor", "trang trí", "trang tri", "trang-tri"],
      "trang trí": ["c0005", "decor", "trang trí", "trang tri", "trang-tri"],

      "c0006": ["c0006", "storage", "lưu trữ", "luu tru", "luu-tru"],
      "storage": ["c0006", "storage", "lưu trữ", "luu tru", "luu-tru"],
      "lưu trữ": ["c0006", "storage", "lưu trữ", "luu tru", "luu-tru"],
    };

    const synonyms = synonymMap[target];
    if (synonyms) {
      return synonyms.includes(prodCat) || synonyms.includes(prodName);
    }

    return prodCat.includes(target) || prodName.includes(target) || target.includes(prodCat);
  };

  // Helper count for category items
  const getCategoryCount = (catId: string) => {
    return products.filter(
      (p) =>
        matchesCategory(p.category, catId, p.categoryName) &&
        matchesPriceRange(p.price, currentPriceRange) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;
  };

  // Helper count for price items
  const getPriceCount = (rangeId: string) => {
    return products.filter(
      (p) =>
        matchesCategory(p.category, currentCategory, p.categoryName) &&
        matchesPriceRange(p.price, rangeId) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchCat = matchesCategory(product.category, currentCategory, product.categoryName);
      const matchSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchPrice = matchesPriceRange(product.price, currentPriceRange);
      return matchCat && matchSearch && matchPrice;
    });

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, currentCategory, currentPriceRange, searchQuery, sortBy]);

  const currentCategoryLabel =
    categories.find((c) => c.id === currentCategory)?.label || "Tất cả sản phẩm";

  return (
    <>
      {/* 3. Main Content Section (Sidebar + Product Catalog) */}
      <div className="container" style={{ paddingTop: "24px" }}>
        <div className="product-page-layout">
          {/* Left Sidebar Filter */}
          <aside className="filter-sidebar">
            {/* Category Filter Group */}
            <div className="filter-group">
              <div className="filter-group-title">Danh mục sản phẩm</div>
              <ul className="filter-list" id="category-filter-list">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={`filter-item ${
                      currentCategory === cat.id ? "active" : ""
                    }`}
                    onClick={() => setCurrentCategory(cat.id)}
                  >
                    <div className="filter-item-left">
                      <span>{cat.icon}</span> {cat.label}
                    </div>
                    <span className="filter-count">
                      {getCategoryCount(cat.id)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--border-color)" }} />

            {/* Price Filter Group (VND) */}
            <div className="filter-group">
              <div className="filter-group-title">Mức giá (VND)</div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                id="price-filter-list"
              >
                {priceRanges.map((range) => (
                  <label
                    key={range.id}
                    className="filter-option"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="radio"
                        name="price-range"
                        value={range.id}
                        checked={currentPriceRange === range.id}
                        onChange={(e) => setCurrentPriceRange(e.target.value)}
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "14px", color: "var(--text-main)" }}>{range.label}</span>
                    </div>
                    <span className="filter-count">
                      {getPriceCount(range.id)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--border-color)" }} />

            {/* Stock Availability Group */}
            <div className="filter-group">
              <div className="filter-group-title">Trạng thái kho</div>
              <label className="filter-option">
                <input
                  type="checkbox"
                  id="stock-checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>Còn hàng</span>
              </label>
            </div>
          </aside>

          {/* Right Main Product Grid Content */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
            const safeCurrentPage = Math.min(currentPage, totalPages);
            const paginatedProducts = filteredProducts.slice(
              (safeCurrentPage - 1) * pageSize,
              safeCurrentPage * pageSize
            );

            return (
              <section className="products-main-content">
                {/* Top Toolbar */}
                <div className="products-main-header">
                  <div>
                    <h1 className="products-page-title" id="page-title-heading">
                      {currentCategoryLabel}
                    </h1>
                    <div className="products-count-text" id="products-count-info">
                      Hiển thị {filteredProducts.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0} -{" "}
                      {Math.min(safeCurrentPage * pageSize, filteredProducts.length)} trong tổng số{" "}
                      {filteredProducts.length} sản phẩm
                    </div>
                  </div>

                  <div className="toolbar-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="toolbar-search">
                      <input
                        type="text"
                        id="catalog-search-input"
                        placeholder="Tìm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <svg viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </div>

                    {(searchQuery || currentCategory !== "all" || currentPriceRange !== "all" || inStockOnly) && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentCategory("all");
                          setCurrentPriceRange("all");
                          setInStockOnly(false);
                          setCurrentPage(1);
                        }}
                        style={{
                          background: "#fee2e2",
                          color: "#b91c1c",
                          border: "1px solid #fca5a5",
                          borderRadius: "6px",
                          padding: "7px 11px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Xóa tất cả bộ lọc"
                      >
                        <X className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    )}

                    <select
                      className="sort-select"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{ cursor: "pointer", fontWeight: 700 }}
                    >
                      <option value={10}>Hiển thị 10 sản phẩm</option>
                      <option value={25}>Hiển thị 25 sản phẩm</option>
                      <option value={50}>Hiển thị 50 sản phẩm</option>
                    </select>

                    <select
                      className="sort-select"
                      id="sort-select-box"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price-asc">Thấp đến cao</option>
                      <option value="price-desc">Cao đến thấp</option>
                    </select>
                  </div>
                </div>

            {/* 4-Column Product Catalog Grid */}
            <div className="catalog-grid" id="product-catalog-grid">
              {loading ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontWeight: 600 }}>
                  Đang tải danh sách sản phẩm...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                    <Search className="w-12 h-12 text-slate-400" />
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: 600 }}>
                    Không tìm thấy sản phẩm phù hợp!
                  </p>
                  <p style={{ fontSize: "13px", marginTop: "4px", marginBottom: "16px" }}>
                    Vui lòng thử tìm kiếm bằng từ khóa khác hoặc bấm nút bên dưới để xem lại tất cả sản phẩm.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentCategory("All");
                      setCurrentPriceRange("all");
                      setSearchQuery("");
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "var(--primary-color)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                paginatedProducts.map((product) => {
                  const wished = isWishlisted(product.id);
                  return (
                    <div key={product.id} className="catalog-card">
                      {product.badge && (
                        <span
                          className={`card-badge ${product.badgeType || ""}`}
                        >
                          {product.badge}
                        </span>
                      )}
                      <button
                        className={`btn-wishlist ${wished ? "active" : ""}`}
                        onClick={() => toggleWishlist(product.id)}
                        title="Thêm vào yêu thích"
                        style={wished ? { color: "#ef4444", display: "inline-flex", alignItems: "center", justifyContent: "center" } : { display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Heart className={`w-4 h-4 ${wished ? "text-red-500 fill-red-500" : "text-slate-400"}`} />
                      </button>
                      <div className="catalog-img-wrapper">
                        <Link href={`/products/${product.id}`}>
                          <img
                            src={fixImagePath(product.image)}
                            alt={product.name}
                          />
                        </Link>
                      </div>
                      <div className="catalog-card-body">
                        <h3 className="catalog-title">
                          <Link
                            href={`/products/${product.id}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {product.name}
                          </Link>
                        </h3>
                        <div className="price-box">
                          <span className="price-current">
                            {formatVND(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="price-old">
                              {formatVND(product.oldPrice)}
                            </span>
                          )}
                        </div>
                        <span className="status-badge">Còn hàng</span>
                        <div
                          className="catalog-card-footer"
                          style={{ display: "flex", gap: "6px" }}
                        >
                          <button
                            onClick={() => addToCart(product)}
                            className="btn-add-cart-sm"
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              background: "var(--primary-color)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            + Giỏ hàng
                          </button>
                          <Link
                            href={`/products/${product.id}`}
                            className="btn-detail-link"
                          >
                            Chi tiết &rsaquo;
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                margin: "32px 0 16px 0",
              }}
            >
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  background: "#fff",
                  fontWeight: 700,
                  cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                  opacity: safeCurrentPage <= 1 ? 0.5 : 1,
                }}
              >
                &lt; Trang trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid",
                    borderColor: p === safeCurrentPage ? "var(--primary-color)" : "var(--border-color)",
                    borderRadius: "6px",
                    background: p === safeCurrentPage ? "var(--primary-color)" : "#fff",
                    color: p === safeCurrentPage ? "#fff" : "var(--text-main)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  background: "#fff",
                  fontWeight: 700,
                  cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                  opacity: safeCurrentPage >= totalPages ? 0.5 : 1,
                }}
              >
                Trang sau &gt;
              </button>
            </div>
          </section>
        );
      })()}
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "40px 15px", textAlign: "center" }}>Đang tải danh sách sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

