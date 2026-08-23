"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  index: number;
}

interface ArticleToCProps {
  content: string;
}

export const ArticleToC: React.FC<ArticleToCProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (typeof document === "undefined") return;

    const parseHeadings = () => {
      const container = document.querySelector(".article-body");
      if (!container) return;

      const h2Elements = container.querySelectorAll("h2");
      const items: TocItem[] = [];

      h2Elements.forEach((h2, index) => {
        const id = `heading-section-${index + 1}`;
        h2.id = id;
        // Also add smooth scroll anchor style
        h2.style.scrollMarginTop = "110px";
        items.push({
          id,
          text: h2.textContent || `Mục ${index + 1}`,
          index: index + 1,
        });
      });

      setHeadings(items);
      if (items.length > 0 && !activeId) {
        setActiveId(items[0].id);
      }
    };

    // Run once and on timeout to ensure hydration
    parseHeadings();
    const timer = setTimeout(parseHeadings, 100);

    // ScrollSpy observer
    const handleScroll = () => {
      const h2Elements = document.querySelectorAll(".article-body h2");
      if (h2Elements.length === 0) return;

      const scrollPosition = window.scrollY + 140;

      for (let i = h2Elements.length - 1; i >= 0; i--) {
        const el = h2Elements[i] as HTMLElement;
        if (el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [content]);

  // Handle smooth scroll when clicking ToC link
  const scrollToHeading = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -105;
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
        border: "1.5px solid #e2e8f0",
        borderRadius: "1.25rem",
        padding: "20px 18px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
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
          gap: "7px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "12px",
          letterSpacing: "-0.01em",
        }}
      >
        <BookOpen className="w-4 h-4 text-emerald-700 flex-shrink-0" />
        <span>MỤC LỤC BÀI VIẾT</span>
      </h3>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
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
                  background: isActive ? "#f0fdf4" : "transparent",
                  border: isActive ? "1px solid #bbf7d0" : "1px solid transparent",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  textAlign: "left",
                  fontSize: "12.5px",
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "var(--primary-color, #2e7d32)" : "#475569",
                  cursor: "pointer",
                  lineHeight: "1.4",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    background: isActive ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                    color: isActive ? "#ffffff" : "#64748b",
                    fontSize: "11px",
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {item.index}
                </span>
                <span style={{ flex: 1 }}>{item.text.replace(/^\d+\.\s*/, "")}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
