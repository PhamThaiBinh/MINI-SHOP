"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export const ChatEmptyState: React.FC = () => {
  return (
    <div
      className="dashboard-card"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontSize: "14px",
        height: "calc(100vh - 280px)",
        gap: "12px",
      }}
    >
      <MessageSquare className="w-12 h-12 text-slate-300" />
      <p style={{ margin: 0, fontWeight: 600 }}>
        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu tư vấn
      </p>
    </div>
  );
};
