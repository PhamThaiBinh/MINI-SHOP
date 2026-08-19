import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/blog.css";
import { fixImagePath } from "@/lib/utils";
import { fetchBlogByIdFromSupabase, fetchBlogsFromSupabase } from "@/lib/supabaseBlogs";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { InArticleProductCard } from "@/components/blog/InArticleProductCard";
import { Calendar, User, Clock, Eye, ArrowLeft, Bookmark, Sparkles, BookOpen, Share2 } from "lucide-react";
import { ScrollToTopOnMount } from "@/components/blog/ScrollToTopOnMount";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const resolvedParams = await params;
  const articleId = parseInt(resolvedParams.id, 10);
  const article = await fetchBlogByIdFromSupabase(articleId);
  if (!article) return { title: "Bài viết không tồn tại - Mini Shop" };

  return {
    title: `${article.title} - Mini Shop Journal`,
    description: article.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params;
  const articleId = parseInt(resolvedParams.id, 10);

  const [article, allArticles, allProducts] = await Promise.all([
    fetchBlogByIdFromSupabase(articleId),
    fetchBlogsFromSupabase(),
    fetchProductsFromSupabase(),
  ]);

  if (!article) {
    notFound();
  }

  const featuredProduct = allProducts[0] || {
    id: 18,
    name: "Bộ Bình Gốm Mộc Mỹ Nghệ",
    price: 520000,
    image: "assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
    category: "C0005",
    categoryName: "Trang trí",
  };

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const lookbookImages = [
    "/assets/images/banner/banner-trang-chu-mini-shop.webp",
    "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    "/assets/images/products/do-thu-cong/gio-may-dan.webp",
  ];

  return (
    <main style={{ backgroundColor: "var(--bg-main, #fcfbf9)", minHeight: "100dvh", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: "60px" }}>
      <ScrollToTopOnMount />

      <div className="container" style={{ padding: "30px 16px 0" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 800,
              color: "var(--primary-color, #2e7d32)",
              textDecoration: "none",
              background: "#e8f5e9",
              padding: "6px 14px",
              borderRadius: "999px",
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Tạp chí Bài viết
          </Link>
        </div>

        {/* Article Doppelrand Shell Header */}
        <div className="doppelrand-outer" style={{ marginBottom: "36px" }}>
          <div className="doppelrand-inner" style={{ padding: "32px" }}>
            <span style={{ fontSize: "11px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", background: "#e8f5e9", padding: "4px 12px", borderRadius: "999px", textTransform: "uppercase" }}>
              {article.category}
            </span>

            <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", lineHeight: 1.3, margin: "12px 0 16px" }}>
              {article.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13px", color: "#64748b", flexWrap: "wrap", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "24px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Calendar className="w-4 h-4 text-emerald-700" /> Ngày đăng: {article.date}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><User className="w-4 h-4 text-emerald-700" /> Tác giả: {article.author || "KTS. Lê Hoàng Nam"}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Clock className="w-4 h-4 text-emerald-700" /> {article.readTime || "5 phút đọc"}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Eye className="w-4 h-4 text-emerald-700" /> 1.2k lượt xem</span>
            </div>

            {/* Hero Main Image */}
            <div style={{ borderRadius: "1.5rem", overflow: "hidden", aspectRatio: "16 / 9", border: "1px solid #e2e8f0" }}>
              <img
                src={fixImagePath(article.img)}
                alt={article.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>

        {/* 2-Column Split: Sticky ToC Sidebar + Main Article Body */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "36px", alignItems: "start" }}>
          {/* Left Column: Sticky Table of Contents Sidebar */}
          <aside style={{ position: "sticky", top: "100px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "1.25rem", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
              <BookOpen className="w-4 h-4 text-emerald-700" /> MỤC LỤC BÀI VIẾT
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px" }}>
              <li>
                <a href="#section-1" style={{ color: "var(--primary-color, #2e7d32)", fontWeight: 800, textDecoration: "none" }}>
                  1. Triết lý thiết kế tối giản Nordic
                </a>
              </li>
              <li>
                <a href="#section-2" style={{ color: "#475569", fontWeight: 600, textDecoration: "none" }}>
                  2. Lựa chọn chất liệu gỗ sồi chuẩn xuất khẩu
                </a>
              </li>
              <li>
                <a href="#section-3" style={{ color: "#475569", fontWeight: 600, textDecoration: "none" }}>
                  3. Phối hợp ánh sáng & phụ kiện decor
                </a>
              </li>
              <li>
                <a href="#section-4" style={{ color: "#475569", fontWeight: 600, textDecoration: "none" }}>
                  4. Kết luận & Mẹo bảo quản
                </a>
              </li>
            </ul>
          </aside>

          {/* Right Column: Main Article Body */}
          <div className="doppelrand-outer">
            <div className="doppelrand-inner" style={{ padding: "32px" }}>
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* In-Article Recommended Product Showcase */}
              <InArticleProductCard product={featuredProduct} />

              {/* Showroom Lookbook Photo Gallery */}
              <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: "1px solid #f1f5f9" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles className="w-5 h-5 text-amber-500" /> BỘ SỰU TẬP ẢNH PHỐI CẢNH SHOWROOM
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {lookbookImages.map((imgSrc, idx) => (
                    <div key={idx} style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: "4 / 3", border: "1px solid #e2e8f0" }}>
                      <img src={fixImagePath(imgSrc)} alt={`Lookbook ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Share Footer */}
              <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
                <ShareButtons title={article.title} />
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles Carousel Grid */}
        <section style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", marginBottom: "20px" }}>
            BÀI VIẾT NỔI BẬT KHÁC CÓ THỂ BẠN THÍCH
          </h2>
          <div className="blog-grid">
            {relatedArticles.map((rel) => (
              <div key={rel.id} className="doppelrand-outer">
                <div className="doppelrand-inner" style={{ padding: "16px" }}>
                  <div style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: "16 / 10", marginBottom: "12px" }}>
                    <Link href={`/blog/${rel.id}`}>
                      <img src={fixImagePath(rel.img)} alt={rel.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Link>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--primary-color, #2e7d32)", background: "#e8f5e9", padding: "2px 8px", borderRadius: "4px" }}>
                    {rel.category}
                  </span>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "8px 0" }}>
                    <Link href={`/blog/${rel.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {rel.title}
                    </Link>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
