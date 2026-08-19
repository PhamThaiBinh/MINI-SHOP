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
