"use client";

import React from "react";
import { Search } from "lucide-react";
import { LiveChatSession } from "@/lib/liveChatService";
import { useToastAndConfirm } from "@/context/ToastAndConfirmContext";


interface ChatSessionListProps {
  sessions: LiveChatSession[];
  filteredSessions: LiveChatSession[];
  selectedSessionId: string;
  searchQuery: string;
  filterMode: "all" | "human" | "bot";
  onSearchChange: (q: string) => void;
  onFilterChange: (mode: "all" | "human" | "bot") => void;
  onSelectSession: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onClearAll?: () => void;
}

export const ChatSessionList: React.FC<ChatSessionListProps> = ({
  sessions,
  filteredSessions,
  selectedSessionId,
  searchQuery,
  filterMode,
  onSearchChange,
  onFilterChange,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  const { showConfirm } = useToastAndConfirm();
  return (

    <div
      className="dashboard-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div className="card-header-row" style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-header-title" style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
          <i className="fa-solid fa-list-check" style={{ color: "#2e7d32" }}></i> Danh Sách Hội Thoại
        </h3>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: 800,
              background: "#e8f5e9",
              color: "#2e7d32",
              padding: "3px 10px",
              borderRadius: "999px",
            }}
          >
            {sessions.length}
          </span>

          {sessions.length > 0 && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              title="Xóa toàn bộ cuộc trò chuyện"
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#ef4444",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "3px 8px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="fa-solid fa-trash-can"></i> Xóa hết
            </button>
          )}
        </div>
      </div>

      {/* Search Box */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <Search
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "15px",
            height: "15px",
            color: "#94a3b8",
          }}
        />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 12px 9px 36px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            fontSize: "12.5px",
            outline: "none",
            background: "#f8fafc",
            color: "#0f172a",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Filter Pills */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {(["all", "human", "bot"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onFilterChange(mode)}
            style={{
              flex: 1,
              padding: "6px 4px",
              borderRadius: "10px",
              border: "none",
              background: filterMode === mode ? "#2e7d32" : "#f1f5f9",
              color: filterMode === mode ? "#ffffff" : "#64748b",
              fontSize: "11.5px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            {mode === "all" ? (
              <>
                <i className="fa-solid fa-comments"></i> Tất cả
              </>
            ) : mode === "human" ? (
              <>
                <i className="fa-solid fa-user-tie"></i> Admin
              </>
            ) : (
              <>
                <i className="fa-solid fa-robot"></i> Bot
              </>
            )}
          </button>
        ))}
      </div>

      {/* Conversations Items Stream */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        {filteredSessions.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: "28px", display: "block", marginBottom: "8px", color: "#cbd5e1" }}></i>
            Chưa có cuộc trò chuyện nào
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isSelected = s.id === selectedSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  background: isSelected ? "#f0fdf4" : "#ffffff",
                  border: isSelected ? "1.5px solid #a7f3d0" : "1px solid #e2e8f0",
                  boxShadow: isSelected ? "0 4px 14px rgba(46, 125, 50, 0.08)" : "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {/* Avatar with status indicator */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: s.avatar_bg || "#2e7d32",
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {s.avatar_text || s.customer_name.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2px solid #ffffff",
                      }}
                    />
                  </div>

                  {/* Detail Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "13.5px",
                          fontWeight: 800,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.customer_name}
                      </h4>
                      <span style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: 600 }}>{s.last_message_at}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "140px",
                        }}
                      >
                        {s.last_message}
                      </p>
                      {s.unread_count > 0 && (
                        <span
                          style={{
                            background: "#ef4444",
                            color: "#ffffff",
                            fontSize: "10px",
                            fontWeight: 900,
                            padding: "2px 6px",
                            borderRadius: "999px",
                          }}
                        >
                          {s.unread_count}
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: "999px",
                          background: s.mode === "human" ? "#fef3c7" : "#e0f2fe",
                          color: s.mode === "human" ? "#b45309" : "#0369a1",
                        }}
                      >
                        {s.mode === "human" ? (
                          <>
                            <i className="fa-solid fa-user-tie"></i> Admin trực
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-robot"></i> Bot trả lời
                          </>
                        )}
                      </span>

                      {/* Quick Delete Single Item */}
                      {onDeleteSession && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm({
                              title: "Xóa cuộc trò chuyện",
                              message: `Xóa cuộc trò chuyện của "${s.customer_name}"?`,
                              confirmText: "Xóa",
                              cancelText: "Hủy",
                              type: "danger",
                              icon: "fa-solid fa-trash-can",
                              onConfirm: () => {
                                onDeleteSession(s.id);
                              },
                            });
                          }}
                          title="Xóa cuộc trò chuyện này"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "2px 4px",
                            fontSize: "11px",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
