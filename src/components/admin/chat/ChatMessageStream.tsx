"use client";

import React, { RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { LiveChatMessage } from "@/lib/liveChatService";
import { PRODUCTS_DATA } from "@/data/products";
import { fixImagePath } from "@/lib/utils";


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
  const getMatchedProducts = (messageText: string) => {
    if (!messageText) return [];
    const found = PRODUCTS_DATA.filter((p) =>
      messageText.toLowerCase().includes(p.name.toLowerCase())
    );
    return found.slice(0, 3);
  };

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
        const isBot = m.sender_type === "bot";
        const matchedProducts = isBot ? getMatchedProducts(m.message) : [];

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

            {/* Product Cards Container in Admin Live Chat */}
            {matchedProducts.length > 0 && (
              <div
                style={{
                  maxWidth: "75%",
                  width: "360px",
                  marginTop: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {matchedProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "56px",
                        height: "56px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#f1f5f9",
                      }}
                    >
                      <img
                        src={fixImagePath(p.image)}
                        alt={p.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5
                        style={{
                          margin: "0 0 2px 0",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.name}
                      </h5>
                      <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#2e7d32" }}>
                        {p.price.toLocaleString("vi-VN")}đ
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <Link
                          href={`/products/${p.id}`}
                          target="_blank"
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "11px",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <ExternalLink style={{ width: "11px", height: "11px" }} /> Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
