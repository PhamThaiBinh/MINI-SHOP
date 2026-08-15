import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/blog.css";
import { BLOG_ARTICLES } from "@/data/blogs";
import { fixImagePath } from "@/lib/utils";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params;
  const articleId = parseInt(resolvedParams.id, 10);
  const article = BLOG_ARTICLES.find((a) => a.id === articleId);

  if (!article) {
    notFound();
  }

  return (
    <main className="article-container">
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
