import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/blog.css";
import { fixImagePath } from "@/lib/utils";
import { fetchBlogByIdFromSupabase } from "@/lib/supabaseBlogs";
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
    title: `${article.title} - Mini Shop`,
    description: article.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params;
  const articleId = parseInt(resolvedParams.id, 10);
  const article = await fetchBlogByIdFromSupabase(articleId);

  if (!article) {
    notFound();
  }

  return (
    <main className="article-container">
      <ScrollToTopOnMount />
      <Link href="/blog" className="back-to-blog-btn">
        &lsaquo; Quay lại danh sách bài viết
      </Link>

      <article>
        <div className="article-header">
          <span className="article-category-tag">{article.category}</span>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span>📅 Ngày đăng: {article.date}</span>
            <span>✍️ Tác giả: {article.author}</span>
            <span>⏱️ {article.readTime}</span>
            <span>👁️ 1.2k lượt xem</span>
          </div>
        </div>

        <img
          src={fixImagePath(article.img)}
          alt={article.title}
          className="article-hero-img"
        />

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </main>
  );
}

