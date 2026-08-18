"use client";

import React, { useState } from "react";

interface ShareButtonsProps {
  title: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  return (
    <div
      style={{
        marginTop: "30px",
        paddingTop: "20px",
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
        📢 Chia sẻ bài viết này:
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            padding: "8px 16px",
            background: copied ? "#dcfce7" : "#f1f5f9",
            color: copied ? "#15803d" : "#0f172a",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copied ? "✅ Đã sao chép Link!" : "📋 Sao chép Link"}
        </button>

        <button
          type="button"
          onClick={handleShareFacebook}
          style={{
            padding: "8px 16px",
            background: "#1877f2",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          📘 Chia sẻ Facebook
        </button>
      </div>
    </div>
  );
};
