"use client";

import React from "react";
import { LiveChatSession } from "@/lib/liveChatService";

interface ChatInputAreaProps {
  selectedSession: LiveChatSession;
  inputText: string;
  cannedResponses: string[];
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  selectedSession,
  inputText,
  cannedResponses,
  onInputChange,
  onSendMessage,
}) => {
  const isHumanMode = selectedSession.mode === "human";

  return (
    <>
      {/* Quick Canned Action Chips */}
      <div
        style={{
          padding: "10px 20px",
          background: "#ffffff",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        {cannedResponses.map((res, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(res)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#334155",
              fontSize: "11.5px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2e7d32";
              e.currentTarget.style.color = "#2e7d32";
              e.currentTarget.style.background = "#f0fdf4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#334155";
              e.currentTarget.style.background = "#f1f5f9";
            }}
          >
            <i className="fa-solid fa-bolt" style={{ color: "#d97706", marginRight: "6px" }}></i>
            {res.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Input Footer Bar */}
      <div
        style={{
          padding: "16px 24px",
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder={
            isHumanMode
              ? "Nhập tin nhắn tư vấn trực tiếp cho khách..."
              : "Bấm 'Tiếp Quản' ở phía trên để nhập tin nhắn trực tiếp..."
          }
          disabled={!isHumanMode}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "14px",
            border: "1.5px solid #cbd5e1",
            fontSize: "13.5px",
            outline: "none",
            background: isHumanMode ? "#ffffff" : "#f8fafc",
            color: "#0f172a",
          }}
        />

        <button
          type="button"
          onClick={() => onSendMessage()}
          disabled={!isHumanMode}
          style={{
            padding: "12px 24px",
            borderRadius: "14px",
            background: isHumanMode ? "#2e7d32" : "#94a3b8",
            color: "#ffffff",
            border: "none",
            fontSize: "13.5px",
            fontWeight: 800,
            cursor: isHumanMode ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: isHumanMode ? "0 4px 14px rgba(46, 125, 50, 0.25)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>Gửi</span>
          <i className="fa-solid fa-paper-plane" style={{ fontSize: "13px" }}></i>
        </button>
      </div>
    </>
  );
};
