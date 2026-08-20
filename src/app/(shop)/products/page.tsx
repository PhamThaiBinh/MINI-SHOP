"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import "@/styles/product-list.css";
import { formatVND, fixImagePath } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Sofa,
  Bed,
  Utensils,
  Lamp,
  Sparkles,
  Box,
  X,
  Search,
  Heart,
  ArrowRight,
  LayoutGrid,
  List as ListIcon,
  Check,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Zap,
} from "lucide-react";

function ProductsContent() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedId, setAddedId] = useState<number | null>(null);

  const initialCat = searchParams.get("category") || "All";
  const initialPrice = searchParams.get("price") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [currentCategory, setCurrentCategory] = useState<string>(initialCat);
  const [currentPriceRange, setCurrentPriceRange] = useState<string>(initialPrice);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

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

  const materials = [
    { id: "all", label: "Tất cả chất liệu" },
    { id: "go-soi", label: "Gỗ sồi tự nhiên" },
    { id: "may-tre", label: "Mây tre đan" },
    { id: "gom-su", label: "Gốm sứ men mờ" },
    { id: "vai-ni", label: "Vải nỉ cao cấp" },
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
      "c0002": ["c0002", "bedroom", "phòng ngủ", "phong ngu", "phong-ngu"],
      "c0003": ["c0003", "kitchen", "nhà bếp", "nha bep", "nha-bep", "phòng ăn"],
      "c0004": ["c0004", "lighting", "đèn chiếu sáng", "den chieu sang", "den-chieu-sang", "đèn"],
      "c0005": ["c0005", "decor", "trang trí", "trang tri", "trang-tri"],
      "c0006": ["c0006", "storage", "lưu trữ", "luu tru", "luu-tru"],
    };

    const synonyms = synonymMap[target];
    if (synonyms) {
      return synonyms.includes(prodCat) || synonyms.includes(prodName);
    }

    return prodCat.includes(target) || prodName.includes(target) || target.includes(prodCat);
  };

  const matchesMaterial = (product: Product, mat: string) => {
    if (mat === "all") return true;
    const text = `${product.name} ${product.description || ""}`.toLowerCase();
    if (mat === "go-soi") return text.includes("gỗ") || text.includes("wood") || text.includes("sồi");
    if (mat === "may-tre") return text.includes("mây") || text.includes("tre") || text.includes("bamboo");
    if (mat === "gom-su") return text.includes("gốm") || text.includes("sứ") || text.includes("ceramic");
    if (mat === "vai-ni") return text.includes("nỉ") || text.includes("vải") || text.includes("sofa");
    return true;
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => matchesCategory(p.category, currentCategory, p.categoryName))
      .filter((p) => matchesPriceRange(p.price, currentPriceRange))
      .filter((p) => matchesMaterial(p, selectedMaterial))
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return b.id - a.id;
      });
  }, [products, currentCategory, currentPriceRange, selectedMaterial, searchQuery, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, currentPriceRange, selectedMaterial, searchQuery, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setCurrentCategory("All");
    setCurrentPriceRange("all");
    setSelectedMaterial("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  const isFilterActive =
    currentCategory !== "All" ||
    currentPriceRange !== "all" ||
    selectedMaterial !== "all" ||
    searchQuery.trim() !== "";

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        paddingBottom: "60px",
      }}
    >
      <div className="container" style={{ padding: "30px 16px 0" }}>

        {/* 1. Header Directory Banner (Flush Left Aligned) */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Danh Mục Nội Thất & Đồ Trang Trí Bắc Âu
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0, maxWidth: "600px" }}>
              Tuyển chọn các thiết kế gỗ sồi Mỹ, mây tre thủ công và gốm sứ mộc mạc cao cấp.
            </p>
          </div>

          {/* Search Box inside Header */}
          <div style={{ position: "relative", minWidth: "280px" }}>
            <Search className="w-4 h-4 text-slate-400" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 38px",
                borderRadius: "999px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                background: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            />
          </div>
        </div>

        {/* 2. Category Pill Tabs Stream */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-pill-btn ${isActive ? "active" : ""}`}
                onClick={() => setCurrentCategory(cat.id)}
              >
                {cat.icon}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3. Main Split Layout: Doppelrand Sidebar + Product Stream */}
        <div className="product-page-split" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px", alignItems: "start" }}>
          
          {/* Left Doppelrand Filter Sidebar */}
          <aside className="doppelrand-outer" style={{ position: "sticky", top: "90px" }}>
            <div className="doppelrand-inner" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", flexWrap: "nowrap", gap: "8px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                  <SlidersHorizontal className="w-4 h-4 text-emerald-700" /> BỘ LỌC NÂNG CAO
                </h3>
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{ background: "none", border: "none", fontSize: "12.5px", fontWeight: 800, color: "#dc2626", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
                  </button>
                )}
              </div>

              {/* Price Range Filter Group */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                  Mức Giá Ưu Đãi:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {priceRanges.map((pr) => {
                    const isActive = currentPriceRange === pr.id;
                    return (
                      <button
                        key={pr.id}
                        type="button"
                        className={`filter-chip-btn ${isActive ? "active" : ""}`}
                        style={{ textAlign: "left" }}
                        onClick={() => setCurrentPriceRange(pr.id)}
                      >
                        {pr.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Material Filter Group */}
              <div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                  Chất Liệu Đặc Trưng:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {materials.map((mat) => {
                    const isActive = selectedMaterial === mat.id;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        className={`filter-chip-btn ${isActive ? "active" : ""}`}
                        style={{ textAlign: "left" }}
                        onClick={() => setSelectedMaterial(mat.id)}
                      >
                        {mat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Product Stream Section */}
          <div>
            {/* Controls Bar: Results Count + Sort Select + View Switcher */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                background: "#ffffff",
                padding: "12px 20px",
                borderRadius: "1.25rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a" }}>
                Hiển thị <span style={{ color: "var(--primary-color, #2e7d32)" }}>{filteredProducts.length}</span> sản phẩm phù hợp
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#334155",
                    outline: "none",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                  <option value="name">Tên sản phẩm A-Z</option>
                </select>

                {/* View Mode Grid/List Switcher */}
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Chế độ Lưới"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                    title="Chế độ Danh sách"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div style={{ padding: "60px 0", textAlign: "center", fontSize: "14px", fontWeight: 800, color: "#64748b" }}>
                Đang tải dữ liệu sản phẩm...
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="doppelrand-outer" style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="doppelrand-inner" style={{ padding: "40px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>
                    Không tìm thấy sản phẩm nào phù hợp bộ lọc!
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "999px",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Xóa toàn bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              /* Doppelrand Product Cards Stream */
              <div className={viewMode === "grid" ? "products-grid-layout" : "products-list-layout"}>
                {paginatedProducts.map((product) => {
                  const wishlisted = isWishlisted(product.id);
                  const isAdded = addedId === product.id;

                  return (
                    <div key={product.id} className="doppelrand-outer">
                      <div className="doppelrand-inner" style={{ padding: "16px", display: "flex", flexDirection: viewMode === "grid" ? "column" : "row", gap: "16px", height: "100%", boxSizing: "border-box" }}>
                        
                        {/* Image Container with Wishlist Heart */}
                        <div style={{ position: "relative", borderRadius: "1rem", overflow: "hidden", width: viewMode === "grid" ? "100%" : "180px", aspectRatio: "1 / 1", flexShrink: 0, background: "#f8fafc" }}>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product.id)}
                            title={wishlisted ? "Đã yêu thích - Bấm để bỏ" : "Thêm vào yêu thích"}
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              width: "34px",
                              height: "34px",
                              borderRadius: "999px",
                              background: wishlisted ? "#fef2f2" : "#ffffff",
                              border: wishlisted ? "1.5px solid #fecaca" : "1px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: wishlisted ? "0 4px 12px rgba(239, 68, 68, 0.2)" : "0 2px 8px rgba(0,0,0,0.12)",
                              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                              transform: wishlisted ? "scale(1.08)" : "scale(1)",
                              zIndex: 10,
                            }}
                          >
                            <Heart className={`w-4 h-4 transition-all duration-200 ${wishlisted ? "text-red-500 fill-red-500 scale-110" : "text-slate-400 fill-none"}`} />
                          </button>

                          {product.oldPrice && (
                            <span style={{ position: "absolute", top: "10px", left: "10px", background: "#dc2626", color: "#fff", fontSize: "11px", fontWeight: 900, padding: "2px 8px", borderRadius: "4px", zIndex: 10 }}>
                              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                            </span>
                          )}

                          <Link href={`/products/${product.id}`}>
                            <img
                              src={fixImagePath(product.image)}
                              alt={product.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/images/products/bo-binh-gom-minimal.webp";
                              }}
                            />
                          </Link>
                        </div>

                        {/* Details Info & Actions */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "4px", display: "block" }}>
                              {product.categoryName}
                            </span>

                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", lineHeight: 1.4, margin: "0 0 8px" }}>
                              <Link href={`/products/${product.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                {product.name}
                              </Link>
                            </h3>

                            {viewMode === "list" && (
                              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px", lineHeight: 1.5 }}>
                                {product.description}
                              </p>
                            )}

                            {/* Price */}
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
                              <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                                {formatVND(product.price)}
                              </span>
                              {product.oldPrice && (
                                <span style={{ fontSize: "12px", textDecoration: "line-through", color: "#94a3b8", fontWeight: 700 }}>
                                  {formatVND(product.oldPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Button-in-Button CTA */}
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(product, 1);
                              setAddedId(product.id);
                              setTimeout(() => setAddedId(null), 1800);
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 16px",
                              borderRadius: "999px",
                              background: isAdded ? "#166534" : "var(--primary-color, #2e7d32)",
                              color: "#ffffff",
                              fontSize: "13px",
                              fontWeight: 800,
                              border: "none",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {isAdded ? (
                              <><Check className="w-4 h-4" /> Đã Thêm Giỏ Hàng!</>
                            ) : (
                              <><ShoppingCart className="w-4 h-4" /> + Thêm Giỏ Hàng</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "36px" }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: currentPage === 1 ? "#cbd5e1" : "#334155",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ChevronLeft className="w-4 h-4" /> Trang trước
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  const isActive = currentPage === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: isActive ? "var(--primary-color, #2e7d32)" : "#cbd5e1",
                        background: isActive ? "var(--primary-color, #2e7d32)" : "#ffffff",
                        color: isActive ? "#ffffff" : "#334155",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: currentPage === totalPages ? "#cbd5e1" : "#334155",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Trang sau <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "40px 15px", textAlign: "center" }}>Đang tải danh mục sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
