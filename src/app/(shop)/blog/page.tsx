import React from "react";
import Link from "next/link";
import "@/styles/blog.css";
import { BLOG_ARTICLES } from "@/data/blogs";
import { fixImagePath } from "@/lib/utils";

export default function BlogListPage() {
  return (
    <>
      {/* 2. Breadcrumb & Blog Hero */}
      <section className="blog-hero">
        <div className="container">
          <ul className="breadcrumb" style={{ marginBottom: "12px" }}>
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-separator">&rsaquo;</li>
            <li className="breadcrumb-current">Bài viết & Cẩm nang</li>
          </ul>
          <h1 className="blog-hero-title">Cẩm Nang Không Gian Sống</h1>
          <p className="blog-hero-desc">
            Khám phá các bí quyết trang trí nội thất Bắc Âu, mẹo bảo quản đồ
            thủ công mây tre và xu hướng trang trí nhà cửa mới nhất.
          </p>
        </div>
      </section>

      {/* 3. Blog List Grid Section */}
      <main className="main-content">
        <div className="container">
          <div className="blog-grid">
            {BLOG_ARTICLES.map((article) => (
              <article key={article.id} className="blog-card">
                <Link href={`/blog/${article.id}`}>
                  <img
                    src={fixImagePath(article.img)}
                    alt={article.title}
                    className="blog-card-img"
                  />
                </Link>
                <div className="blog-card-body">
                  <span className="blog-tag">{article.category}</span>
                  <h2 className="blog-title">
                    <Link href={`/blog/${article.id}`}>{article.title}</Link>
                  </h2>
                  <p className="blog-excerpt">{article.excerpt}</p>
                  <div className="blog-footer">
                    <span>📅 {article.date}</span>
                    <Link
                      href={`/blog/${article.id}`}
                      style={{
                        color: "var(--primary-color)",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Đọc tiếp &rsaquo;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
