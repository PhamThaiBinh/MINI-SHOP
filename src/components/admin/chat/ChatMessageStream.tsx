"use client";

import React, { RefObject } from "react";
import { LiveChatMessage } from "@/lib/liveChatService";

interface ChatMessageStreamProps {
  messages: LiveChatMessage[];
  chatBodyRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export const ChatMessageStream: React.FC<ChatMessageStreamProps> = ({
  messages,
  chatBodyRef,
  messagesEndRef,
  onScroll,
}) => {
  return (
    <div
      ref={chatBodyRef}
      onScroll={onScroll}
      style={{
        flex: 1,
        padding: "20px 24px",
        overflowY: "auto",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {messages.map((m) => {
        const isCustomer = m.sender_type === "customer";
        const isAdmin = m.sender_type === "admin";
        return (
          <div
            key={m.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isAdmin ? "flex-end" : "flex-start",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>
              {m.sender_name} • {m.created_at}
            </span>

            <div
              style={{
                maxWidth: "75%",
                padding: "12px 18px",
                borderRadius: isAdmin ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                background: isAdmin ? "#2e7d32" : isCustomer ? "#ffffff" : "#f0fdf4",
                color: isAdmin ? "#ffffff" : "#0f172a",
                border: isCustomer ? "1px solid #cbd5e1" : "none",
                fontSize: "13.5px",
                lineHeight: "1.6",
                boxShadow: isAdmin
                  ? "0 4px 12px rgba(46, 125, 50, 0.2)"
                  : "0 2px 8px rgba(15, 23, 42, 0.04)",
                whiteSpace: "pre-line",
              }}
            >
              {m.message}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
