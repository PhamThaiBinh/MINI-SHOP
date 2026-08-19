"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const targetUrl = url || window.location.href;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareFacebook = () => {
    const targetUrl = encodeURIComponent(url || window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${targetUrl}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>
        Chia sẻ bài viết này:
      </h4>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            padding: "8px 16px",
            background: copied ? "#f0fdf4" : "#f8fafc",
            color: copied ? "#15803d" : "#0f172a",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" /> Đã sao chép Link!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600" /> Sao chép Link
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShareFacebook}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Chia sẻ Facebook
        </button>
      </div>
    </div>
  );
};
