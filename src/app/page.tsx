"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/home.css";
import "@/styles/product-list.css";
import { HeroShoppableSlider } from "@/components/home/HeroShoppableSlider";
import { ValuePropositionBar } from "@/components/home/ValuePropositionBar";
import { HomeFlashSale } from "@/components/home/HomeFlashSale";
import { BentoLookbook } from "@/components/home/BentoLookbook";
import { HomeBlogJournal } from "@/components/home/HomeBlogJournal";
import { CustomerTestimonials } from "@/components/home/CustomerTestimonials";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase, fetchCategoriesFromSupabase } from "@/lib/supabaseProducts";
import { PRODUCTS_DATA } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatVND, fixImagePath } from "@/lib/utils";
import {
  ArrowRight,
  Heart,
  ShoppingCart,
  Check,
} from "lucide-react";

interface CategoryFilterItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const getCategoryIcon = (iconName: string, id: string): React.ReactNode => {
  const name = (iconName || "").toLowerCase();
  const catId = (id || "").toLowerCase();
  if (catId === "all" || name.includes("package") || name.includes("boxes")) return <i className="fa-solid fa-boxes-stacked w-4 h-4 text-center inline-block" />;
  if (name.includes("sofa") || name.includes("couch") || name.includes("phong-khach") || name.includes("khách") || catId === "c0001") return <i className="fa-solid fa-couch w-4 h-4 text-center inline-block" />;
  if (name.includes("bed") || name.includes("phong-ngu") || name.includes("ngủ") || catId === "c0002") return <i className="fa-solid fa-bed w-4 h-4 text-center inline-block" />;
  if (name.includes("utensil") || name.includes("bếp") || name.includes("phong-an") || name.includes("ăn") || catId === "c0003") return <i className="fa-solid fa-utensils w-4 h-4 text-center inline-block" />;
  if (name.includes("lamp") || name.includes("đèn") || catId === "c0004") return <i className="fa-solid fa-lightbulb w-4 h-4 text-center inline-block" />;
  if (name.includes("sparkle") || name.includes("decor") || name.includes("trang-tri") || name.includes("trí") || catId === "c0005") return <i className="fa-solid fa-wand-magic-sparkles w-4 h-4 text-center inline-block" />;
  if (name.includes("box") || name.includes("storage") || name.includes("luu-tru") || name.includes("trữ") || catId === "c0006") return <i className="fa-solid fa-box-archive w-4 h-4 text-center inline-block" />;
  if (name.includes("rem") || name.includes("slider") || name.includes("curtain") || catId === "c0007") return <i className="fa-solid fa-sliders w-4 h-4 text-center inline-block" />;
  if (name.includes("lavabo") || name.includes("tam") || catId === "c0008") return <i className="fa-solid fa-sink w-4 h-4 text-center inline-block" />;
  if (iconName && iconName.startsWith("fa-")) return <i className={`${iconName} w-4 h-4 text-center inline-block`} />;
  return <i className="fa-solid fa-folder w-4 h-4 text-center inline-block" />;
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryFilterItem[]>([
    { id: "All", label: "Tất cả sản phẩm", icon: <i className="fa-solid fa-boxes-stacked w-4 h-4 text-center inline-block" /> },
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedId, setAddedId] = useState<number | null>(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchCategoriesFromSupabase(),
      ]);
      setProducts(prods.length > 0 ? prods : PRODUCTS_DATA);
      if (cats && cats.length > 0) {
        setCategories(
          cats.map((c) => ({
            id: c.id,
            label: c.label,
            icon: getCategoryIcon(c.icon, c.id),
          }))
        );
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const isCategoryMatch = (productCategory: string, activeCategory: string, categoryName?: string) => {
    if (!activeCategory || activeCategory === "All" || activeCategory === "all") return true;
    const target = activeCategory.toLowerCase().trim();
    const prodCat = (productCategory || "").toLowerCase().trim();
    const prodName = (categoryName || "").toLowerCase().trim();

    if (prodCat === target || prodName === target) return true;

    // Check matched category label/id from dynamic Supabase categories
    const matchedCategory = categories.find((c) => c.id.toLowerCase() === target || c.label.toLowerCase() === target);
    if (matchedCategory) {
      const catLabel = matchedCategory.label.toLowerCase().trim();
      const catId = matchedCategory.id.toLowerCase().trim();
      if (prodCat === catId || prodCat === catLabel || prodName === catLabel || prodName === catId) {
        return true;
      }
    }

    const synonymMap: Record<string, string[]> = {
      "c0001": ["c0001", "living room", "phòng khách", "phong khach", "phong-khach"],
      "c0002": ["c0002", "bedroom", "phòng ngủ", "phong ngu", "phong-ngu"],
      "c0003": ["c0003", "kitchen", "nhà bếp", "nha bep", "nha-bep", "phòng ăn"],
      "c0004": ["c0004", "lighting", "đèn chiếu sáng", "den chieu sang", "den-chieu-sang", "đèn"],
      "c0005": ["c0005", "decor", "trang trí", "trang tri", "trang-tri"],
      "c0006": ["c0006", "storage", "lưu trữ", "luu tru", "luu-tru"],
      "c0007": ["c0007", "rèm", "màn cửa", "rem cua", "curtain"],
      "c0008": ["c0008", "phòng tắm", "phong tam", "bathroom"],
    };

    const synonyms = synonymMap[target];
    if (synonyms) {
      return synonyms.includes(prodCat) || synonyms.includes(prodName);
    }

    return prodCat.includes(target) || prodName.includes(target) || target.includes(prodCat);
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products.slice(0, 8)
      : products.filter((p) => isCategoryMatch(p.category, selectedCategory, p.categoryName)).slice(0, 8);

  return (
    <main style={{ backgroundColor: "var(--bg-main, #fcfbf9)", minHeight: "100dvh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* 1. Hero Shoppable Slider Section */}
      <div className="container" style={{ padding: "30px 16px 0" }}>
        <HeroShoppableSlider />
      </div>

      {/* 2. Value Proposition VIP Bar */}
      <ValuePropositionBar />

      {/* 3. Flash Sale Deals Stream */}
      <HomeFlashSale />

      {/* 4. Flush-Left Category Filter Bar & Featured Products Stream */}
      <section className="products-section" style={{ marginBottom: "56px" }}>
        <div className="container" style={{ padding: "0 16px" }}>
          
          {/* Section Header Banner */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Bộ Sưu Tập Nội Thất Nổi Bật 2026
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                Thiết kế tinh tế phong cách Bắc Âu cho mọi không gian sống hiện đại.
              </p>
            </div>
            <Link
              href={selectedCategory !== "All" ? `/products?category=${selectedCategory}` : "/products"}
              style={{
                fontSize: "13.5px",
                fontWeight: 800,
                color: "var(--primary-color, #2e7d32)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 16px",
                borderRadius: "999px",
                background: "#e8f5e9",
                transition: "all 0.2s ease",
              }}
            >
              Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Pill Tabs Stream */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Featured Products Doppelrand Grid */}
          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center", fontSize: "14px", color: "#64748b", fontWeight: 800 }}>
              Đang tải danh sách sản phẩm nổi bật...
            </div>
          ) : (
            <div className="products-grid-layout" id="home-featured-products-grid">
              {filteredProducts.map((product) => {
                const wishlisted = isWishlisted(product.id);
                const isAdded = addedId === product.id;

                return (
                  <div key={product.id} className="doppelrand-outer">
                    <div className="doppelrand-inner" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box" }}>
                      
                      {/* Image Wrapper */}
                      <div style={{ position: "relative", borderRadius: "1rem", overflow: "hidden", aspectRatio: "1 / 1", background: "#f8fafc", marginBottom: "14px" }}>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          title={wishlisted ? "Đã yêu thích - Bấm để bỏ" : "Thêm vào danh sách yêu thích"}
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
                          <Heart
                            style={{
                              width: "16px",
                              height: "16px",
                              color: wishlisted ? "#ef4444" : "#94a3b8",
                              fill: wishlisted ? "#ef4444" : "none",
                              transition: "all 0.2s ease",
                              transform: wishlisted ? "scale(1.1)" : "scale(1)",
                            }}
                          />
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

                      {/* Product Content & CTA */}
                      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "4px", display: "block" }}>
                            {product.categoryName}
                          </span>

                          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", lineHeight: 1.4, margin: "0 0 10px" }}>
                            <Link href={`/products/${product.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                              {product.name}
                            </Link>
                          </h3>

                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "17px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
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
        </div>
      </section>

      {/* 5. Bento Grid Editorial Lookbook */}
      <BentoLookbook />

      {/* 6. Mini-Shop Decor Journal */}
      <HomeBlogJournal />

      {/* 7. Customer Testimonials */}
      <CustomerTestimonials />
    </main>
  );
}
