"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fixImagePath } from "@/lib/utils";
import { fetchBlogsFromSupabase, BlogArticle } from "@/lib/supabaseBlogs";
import { BookOpen, Calendar, ArrowRight, Clock } from "lucide-react";

export const HomeBlogJournal: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchBlogsFromSupabase();
      setBlogs(data);
    }
    loadData();
  }, []);

  if (blogs.length === 0) return null;

  const mainArticle = blogs[0];
  const sideArticles = blogs.slice(1, 4);

  return (
    <section style={{ marginBottom: "48px" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "#fef3c7",
                color: "#b45309",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>MINI-SHOP JOURNAL & DECOR</span>
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Cẩm Nang & Mẹo Trang Trí Tổ Ấm
            </h2>
          </div>

          <Link
            href="/blog"
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "var(--primary-color, #2e7d32)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Xem tất cả bài viết <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial Journal Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
          {/* Main Featured Article (7 Cols) */}
          <div
            style={{
              gridColumn: "span 7",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "1.75rem",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ position: "relative", paddingTop: "55%", overflow: "hidden" }}>
              <img
                src={fixImagePath(mainArticle.img)}
                alt={mainArticle.title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: "999px",
                }}
              >
                {mainArticle.category}
              </span>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar className="w-3.5 h-3.5" /> {mainArticle.date}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "10px", lineHeight: 1.35 }}>
                <Link href={`/blog/${mainArticle.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                  {mainArticle.title}
                </Link>
              </h3>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "20px", flexGrow: 1 }}>
                {mainArticle.excerpt}
              </p>
              <div>
                <Link
                  href={`/blog/${mainArticle.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--primary-color, #2e7d32)",
                    fontWeight: 800,
                    fontSize: "13px",
                    textDecoration: "none",
                  }}
                >
                  Đọc tiếp chi tiết bài viết <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Side Articles Stack (5 Cols) */}
          <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "16px" }}>
            {sideArticles.map((article) => (
              <div
                key={article.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "1.25rem",
                  padding: "16px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                }}
              >
                <img
                  src={fixImagePath(article.img)}
                  alt={article.title}
                  style={{ width: "90px", height: "90px", borderRadius: "1rem", objectFit: "cover", flexShrink: 0 }}
                />
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#0369a1", background: "#e0f2fe", padding: "2px 8px", borderRadius: "999px" }}>
                    {article.category}
                  </span>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: "6px 0 4px", lineHeight: 1.35 }}>
                    <Link href={`/blog/${article.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {article.title}
                    </Link>
                  </h4>
                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar className="w-3 h-3" /> {article.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
