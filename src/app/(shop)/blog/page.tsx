import React from "react";
import Link from "next/link";
import "@/styles/blog.css";
import { fixImagePath } from "@/lib/utils";
import { fetchBlogsFromSupabase } from "@/lib/supabaseBlogs";
import { Calendar, BookOpen, ArrowRight } from "lucide-react";

export default async function BlogListPage() {
  const articles = await fetchBlogsFromSupabase();

  return (
    <main
      style={{
        backgroundColor: "var(--bg-main, #fcfbf9)",
        minHeight: "100dvh",
        padding: "40px 16px 80px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header Title Section */}
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "#e0f2fe",
              color: "#0369a1",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>CẨM NANG NỘI THẤT & KHÔNG GIAN SỐNG</span>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Kinh Nghiệm & Mẹo Trang Trí Tổ Ấm
          </h1>
        </div>

        {/* Blog Grid Stream */}
        <div className="blog-grid">
          {articles.map((article) => (
            <article key={article.id} className="blog-card">
              <Link href={`/blog/${article.id}`}>
                <img
                  src={fixImagePath(article.img)}
                  alt={article.title}
                  className="blog-card-img"
                  loading="lazy"
                />
              </Link>
              <div className="blog-card-body">
                <span className="blog-tag">{article.category}</span>
                <h2 className="blog-title">
                  <Link href={`/blog/${article.id}`}>{article.title}</Link>
                </h2>
                <p className="blog-excerpt">{article.excerpt}</p>
                <div className="blog-footer">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                    <Calendar className="w-3.5 h-3.5" /> {article.date}
                  </span>
                  <Link
                    href={`/blog/${article.id}`}
                    style={{
                      color: "var(--primary-color, #2e7d32)",
                      fontWeight: 800,
                      textDecoration: "none",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
