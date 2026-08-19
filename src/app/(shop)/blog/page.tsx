"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import "@/styles/blog.css";
import { fixImagePath } from "@/lib/utils";
import { fetchBlogsFromSupabase, BlogArticle } from "@/lib/supabaseBlogs";
import { Calendar, BookOpen, ArrowRight, Search, Sparkles, User, Clock, Eye, Bookmark } from "lucide-react";

export default function BlogListPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Tất cả");

  useEffect(() => {
    async function loadBlogs() {
      const data = await fetchBlogsFromSupabase();
      if (data && data.length > 0) {
        setArticles(data);
      }
    }
    loadBlogs();
  }, []);

  const topics = [
    "Tất cả",
    "Mẹo Decor Phòng Khách",
    "Bảo Quản Đồ Gỗ",
    "Giải Pháp Căn Hộ Nhỏ",
    "Xu Hướng Nội Thất 2026",
  ];

  const featuredArticle = articles[0] || {
    id: 1,
    title: "Xu Hướng Thiết Kế Nội Thất Tối Giản Bắc Âu Nordic 2026",
    excerpt: "Khám phá bí quyết phối hợp ánh sáng tự nhiên và chất liệu gỗ sồi tạo nên không gian sống tối giản nhưng vô cùng ấm cúng.",
    category: "Xu Hướng Nội Thất 2026",
    date: "18/08/2026",
    author: "KTS. Lê Hoàng Nam",
    img: "/assets/images/banner/banner-trang-chu-mini-shop.webp",
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic =
        selectedTopic === "Tất cả" || art.category.toLowerCase().includes(selectedTopic.toLowerCase());
      return matchesSearch && matchesTopic;
    });
  }, [articles, searchQuery, selectedTopic]);

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
        {/* Magazine Editorial Title Header */}
        <div style={{ marginBottom: "28px", textAlign: "left" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--primary-color, #2e7d32)", background: "#e8f5e9", padding: "4px 12px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            MINI-SHOP EDITORIAL JOURNAL
          </span>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#0f172a",
              margin: "8px 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Kinh Nghiệm & Mẹo Trang Trí Tổ Ấm Bắc Âu
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Tổng hợp cẩm nang mua sắm, mẹo phối màu và kiến thức bảo quản đồ gỗ từ chuyên gia nội thất.
          </p>
        </div>

        {/* 1. Magazine Editorial Hero Banner (Featured Article of the Week) */}
        {featuredArticle && (
          <div className="doppelrand-outer" style={{ marginBottom: "36px" }}>
            <div className="doppelrand-inner" style={{ padding: "28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "32px", alignItems: "center" }}>
                {/* Left: Featured Image */}
                <div style={{ borderRadius: "1.5rem", overflow: "hidden", aspectRatio: "16 / 10", border: "1px solid #e2e8f0" }}>
                  <Link href={`/blog/${featuredArticle.id}`}>
                    <img
                      src={fixImagePath(featuredArticle.img)}
                      alt={featuredArticle.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
                      }}
                    />
                  </Link>
                </div>

                {/* Right: Featured Meta & Title */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 900, background: "#fef3c7", color: "#b45309", padding: "3px 10px", borderRadius: "999px" }}>
                      ⭐ CHUYÊN MỤC TIÊU ĐIỂM
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                      {featuredArticle.category}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", lineHeight: 1.3, margin: "0 0 12px" }}>
                    <Link href={`/blog/${featuredArticle.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7, margin: "0 0 20px" }}>
                    {featuredArticle.excerpt}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", display: "flex", gap: "14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Calendar className="w-3.5 h-3.5" /> {featuredArticle.date}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <User className="w-3.5 h-3.5" /> {featuredArticle.author || "Mini Shop"}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${featuredArticle.id}`}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "999px",
                        background: "var(--primary-color, #2e7d32)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 800,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(46, 125, 50, 0.2)",
                      }}
                    >
                      Đọc Tạp Chí 1-Click <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Topic Filter Pills & Live Search Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {topics.map((top) => (
              <button
                key={top}
                type="button"
                onClick={() => setSelectedTopic(top)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 800,
                  border: "1px solid",
                  borderColor: selectedTopic === top ? "var(--primary-color, #2e7d32)" : "#cbd5e1",
                  background: selectedTopic === top ? "var(--primary-color, #2e7d32)" : "#ffffff",
                  color: selectedTopic === top ? "#ffffff" : "#334155",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {top}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search className="w-4 h-4 text-slate-400" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 38px",
                borderRadius: "999px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* 3. Articles Grid Stream (Doppelrand Cards) */}
        <div className="blog-grid">
          {filteredArticles.map((article) => (
            <div key={article.id} className="doppelrand-outer">
              <div className="doppelrand-inner" style={{ padding: "16px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
                <div style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: "16 / 10", marginBottom: "14px" }}>
                  <Link href={`/blog/${article.id}`}>
                    <img
                      src={fixImagePath(article.img)}
                      alt={article.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
                      }}
                    />
                  </Link>
                </div>

                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--primary-color, #2e7d32)", background: "#e8f5e9", padding: "2px 8px", borderRadius: "4px", width: "fit-content", marginBottom: "8px" }}>
                  {article.category}
                </span>

                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", lineHeight: 1.4, margin: "0 0 8px 0" }}>
                  <Link href={`/blog/${article.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {article.title}
                  </Link>
                </h3>

                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: "0 0 16px 0", flex: 1 }}>
                  {article.excerpt}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Calendar className="w-3.5 h-3.5" /> {article.date}
                  </span>
                  <Link
                    href={`/blog/${article.id}`}
                    style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--primary-color, #2e7d32)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
