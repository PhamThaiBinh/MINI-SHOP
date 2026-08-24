"use client";

import React from "react";
import { LiveChatSession } from "@/lib/liveChatService";
import { useToastAndConfirm } from "@/context/ToastAndConfirmContext";

interface ChatActiveHeaderProps {
  selectedSession: LiveChatSession;
  onToggleMode: () => void;
  onDeleteSession?: (id: string) => void;
}

export const ChatActiveHeader: React.FC<ChatActiveHeaderProps> = ({
  selectedSession,
  onToggleMode,
  onDeleteSession,
}) => {
  const { showConfirm } = useToastAndConfirm();

  const handleDelete = () => {
    showConfirm({
      title: "Xóa cuộc trò chuyện",
      message: `Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện của "${selectedSession.customer_name}"?`,
      confirmText: "Xóa trò chuyện",
      cancelText: "Hủy bỏ",
      type: "danger",
      icon: "fa-solid fa-trash-can",
      onConfirm: () => {
        onDeleteSession?.(selectedSession.id);
      },
    });
  };


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
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "12px" }}>
            <span><i className="fa-solid fa-envelope" style={{ marginRight: "4px" }}></i> {selectedSession.customer_email}</span>
            {selectedSession.customer_phone && (
              <span><i className="fa-solid fa-phone" style={{ marginRight: "4px" }}></i> {selectedSession.customer_phone}</span>
            )}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Toggle Mode Button */}
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {selectedSession.mode === "human" ? (
              <>
                <i className="fa-solid fa-user-tie"></i> Đang Admin Trực (Bấm để chuyển Bot)
              </>
            ) : (
              <>
                <i className="fa-solid fa-robot"></i> Bot Tự Động (Bấm để Tiếp Quản)
              </>
            )}
          </span>
        </button>

        {/* Delete Single Session Button */}
        {onDeleteSession && (
          <button
            type="button"
            onClick={handleDelete}
            title="Xóa cuộc trò chuyện này"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "1px solid #fecaca",
              background: "#fff1f2",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <i className="fa-solid fa-trash-can" style={{ fontSize: "14px" }}></i>
          </button>
        )}
      </div>
    </div>
  );
};
