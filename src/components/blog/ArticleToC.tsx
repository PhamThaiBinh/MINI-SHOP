"use client";

import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
}

interface ArticleToCProps {
  content: string;
}

export const ArticleToC: React.FC<ArticleToCProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Parse h2 elements inside article-body
    const container = document.querySelector(".article-body");
    if (!container) return;

    const h2Elements = container.querySelectorAll("h2");
    const items: TocItem[] = [];

    h2Elements.forEach((h2, index) => {
      const id = `heading-section-${index + 1}`;
      h2.id = id;
      items.push({
        id,
        text: h2.textContent || `Mục ${index + 1}`,
      });
    });

    setHeadings(items);
    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, [content]);

  // Handle smooth scroll when clicking ToC link
  const scrollToHeading = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside
      style={{
        position: "sticky",
        top: "100px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "1.25rem",
        padding: "20px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
      }}
    >
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 900,
          color: "#0f172a",
          margin: "0 0 14px 0",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "10px",
        }}
      >
        <BookOpen className="w-4 h-4 text-emerald-700" /> MỤC LỤC BÀI VIẾT
      </h3>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontSize: "13px",
        }}
      >
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToHeading(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                  fontSize: "12.5px",
                  fontWeight: isActive ? 900 : 600,
                  color: isActive ? "var(--primary-color, #2e7d32)" : "#475569",
                  cursor: "pointer",
                  lineHeight: 1.4,
                  transition: "all 0.2s ease",
                  display: "block",
                  width: "100%",
                }}
              >
                {item.text}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
