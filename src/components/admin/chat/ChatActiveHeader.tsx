"use client";

import React from "react";
import { User, Bot } from "lucide-react";
import { LiveChatSession } from "@/lib/liveChatService";

interface ChatActiveHeaderProps {
  selectedSession: LiveChatSession;
  onToggleMode: () => void;
}

export const ChatActiveHeader: React.FC<ChatActiveHeaderProps> = ({
  selectedSession,
  onToggleMode,
}) => {
  return (
    <div
      style={{
        padding: "16px 24px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            background: selectedSession.avatar_bg || "#2e7d32",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(46, 125, 50, 0.2)",
          }}
        >
          {selectedSession.avatar_text || selectedSession.customer_name.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
            {selectedSession.customer_name}
          </h3>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            📧 {selectedSession.customer_email} • 📞 {selectedSession.customer_phone}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleMode}
        style={{
          padding: "8px 16px",
          borderRadius: "999px",
          border: "none",
          background: selectedSession.mode === "human" ? "#d97706" : "#2e7d32",
          color: "#ffffff",
          fontSize: "12.5px",
          fontWeight: 800,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
          transition: "all 0.2s ease",
        }}
      >
        <span>
          {selectedSession.mode === "human"
            ? "🧑‍💼 Đang Admin Tiếp Quản (Bấm để trả về AI)"
            : "🤖 AI Chatbot Tự Động (Bấm để Tiếp Quản Chat)"}
        </span>
        <div
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selectedSession.mode === "human" ? (
            <User style={{ width: "13px", height: "13px" }} />
          ) : (
            <Bot style={{ width: "13px", height: "13px" }} />
          )}
        </div>
      </button>
    </div>
  );
};
