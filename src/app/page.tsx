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
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { PRODUCTS_DATA } from "@/data/products";
import { Package, Sofa, Bed, Utensils, Lamp, Sparkles, Box, ArrowRight } from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProductsFromSupabase();
      setProducts(data.length > 0 ? data : PRODUCTS_DATA);
      setLoading(false);
    }
    loadData();
  }, []);

  const categories = [
    { id: "All", label: "Tất cả", icon: <Package className="w-4 h-4" /> },
    { id: "C0001", label: "Phòng khách", icon: <Sofa className="w-4 h-4" /> },
    { id: "C0002", label: "Phòng ngủ", icon: <Bed className="w-4 h-4" /> },
    { id: "C0003", label: "Nhà bếp", icon: <Utensils className="w-4 h-4" /> },
    { id: "C0004", label: "Đèn chiếu sáng", icon: <Lamp className="w-4 h-4" /> },
    { id: "C0005", label: "Trang trí", icon: <Sparkles className="w-4 h-4" /> },
    { id: "C0006", label: "Lưu trữ", icon: <Box className="w-4 h-4" /> },
  ];

  const isCategoryMatch = (productCategory: string, activeCategory: string, categoryName?: string) => {
    if (!activeCategory || activeCategory === "All" || activeCategory === "all") return true;
    const target = activeCategory.toLowerCase().trim();
    const prodCat = (productCategory || "").toLowerCase().trim();
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

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => isCategoryMatch(p.category, selectedCategory, p.categoryName));

  return (
    <>
      {/* 1. Hero Shoppable Slider Section */}
      <div className="container">
        <HeroShoppableSlider />
      </div>

      {/* 2. Value Proposition VIP Bar */}
      <ValuePropositionBar />

      {/* 3. Flash Sale Deals Stream */}
      <HomeFlashSale />

      {/* 4. Category Filter Bar */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Products Grid */}
      <section className="products-section" style={{ marginBottom: "48px" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
            <Link
              href={selectedCategory !== "All" ? `/products?category=${selectedCategory}` : "/products"}
              className="view-all-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontSize: "14px", color: "var(--text-muted)", fontWeight: 700 }}>
              Đang tải danh sách sản phẩm...
            </div>
          ) : (
            <div className="products-grid" id="home-featured-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} hideQuickView={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Bento Grid Editorial Lookbook */}
      <BentoLookbook />

      {/* 7. Mini-Shop Decor Journal */}
      <HomeBlogJournal />

      {/* 8. Customer Testimonials */}
      <CustomerTestimonials />
    </>
  );
}

