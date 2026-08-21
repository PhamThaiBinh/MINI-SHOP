"use client";

import React, { useState, useEffect, useRef } from "react";
import "@/styles/admin.css";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  MessageSquare,
  Search,
  User,
  Bot,
  Send,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  Clock,
  Zap,
  Filter,
  ChevronRight,
  Circle,
} from "lucide-react";
import {
  LiveChatSession,
  LiveChatMessage,
  getLocalSessions,
  saveLocalSessions,
  getLocalMessages,
  saveLocalMessages,
} from "@/lib/liveChatService";

export default function AdminLiveChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("session-binh");
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "human" | "bot">("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions on mount
  useEffect(() => {
    const loadedSessions = getLocalSessions();
    setSessions(loadedSessions);
    if (loadedSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(loadedSessions[0].id);
    }
  }, []);

  // Load messages whenever selected session changes
  useEffect(() => {
    if (!selectedSessionId) return;
    const msgs = getLocalMessages(selectedSessionId);
    setMessages(msgs);

    // Clear unread count for selected session
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSessionId ? { ...s, unread_count: 0 } : s))
    );
  }, [selectedSessionId]);

  // Save sessions whenever changed
  useEffect(() => {
    if (sessions.length > 0) {
      saveLocalSessions(sessions);
    }
  }, [sessions]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedSessionId) return;

    const currentTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const newMsg: LiveChatMessage = {
      id: `admin-m-${Date.now()}`,
      session_id: selectedSessionId,
      sender_type: "admin",
      sender_name: "Admin MINI SHOP",
      message: text,
      created_at: currentTime,
    };

    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    saveLocalMessages(selectedSessionId, updatedMsgs);

    // Update last message in sessions list
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? { ...s, last_message: `Admin: ${text}`, last_message_at: currentTime }
          : s
      )
    );

    if (!textToSend) setInputText("");
  };

  const handleToggleMode = () => {
    if (!selectedSessionId) return;
    const newMode = selectedSession?.mode === "human" ? "bot" : "human";

    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSessionId ? { ...s, mode: newMode } : s))
    );

    // Add system notification message
    const sysMsg: LiveChatMessage = {
      id: `sys-${Date.now()}`,
      session_id: selectedSessionId,
      sender_type: "bot",
      sender_name: "Hệ Thống",
      message:
        newMode === "human"
          ? "🧑‍💼 Admin đã tiếp quản cuộc trò chuyện. Chế độ AI Chatbot đã tạm dừng."
          : "🤖 Đã kích hoạt lại AI Chatbot tự động.",
      created_at: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMsgs = [...messages, sysMsg];
    setMessages(updatedMsgs);
    saveLocalMessages(selectedSessionId, updatedMsgs);
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === "human") return matchesSearch && s.mode === "human";
    if (filterMode === "bot") return matchesSearch && s.mode === "bot";
    return matchesSearch;
  });

  const cannedResponses = [
    "Dạ em chào anh/chị, em hỗ trợ gì cho mình ạ?",
    "Sản phẩm này hiện đang sẵn hàng tại kho và giao ngay trong ngày ạ!",
    "MINI SHOP đang có ưu đãi MIỄN PHÍ VẬN CHUYỂN toàn quốc cho đơn từ 500k ạ.",
    "Dạ anh/chị có thể áp dụng mã WELCOME50 để được giảm 50.000đ nhé!",
  ];

  return (
    <div className="admin-wrapper" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* 1. Left Sidebar Component */}
      <AdminSidebar activeMenu="chat" sidebarCollapsed={sidebarCollapsed} />

      {/* 2. Main Layout Shell */}
      <main className="admin-main">
        {/* Top Header */}
        <AdminHeader
          title="💬 Trợ Lý Live Chat & Tư Vấn Khách Hàng Realtime"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Dashboard Body Content Container */}
        <div className="dashboard-content-body" style={{ padding: "84px 32px 32px 32px" }}>
          
          {/* ==================================================================== */}
          {/* HIGH-END DOUBLE-BEZEL ARCHITECTURE (Doppelrand Outer Shell & Core)  */}
          {/* ==================================================================== */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "28px",
              padding: "8px",
              boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
            }}
          >
            {/* Concentric Inner Core */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "20px",
                border: "1px solid #edf2f7",
                display: "grid",
                gridTemplateColumns: "330px 1fr",
                height: "calc(100vh - 170px)",
                minHeight: "620px",
                overflow: "hidden",
              }}
            >
              {/* ------------------------------------------------------------- */}
              {/* LEFT PANEL: Customer Conversations Master List               */}
              {/* ------------------------------------------------------------- */}
              <div
                style={{
                  background: "#ffffff",
                  borderRight: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Panel Header & Eyebrow Tag */}
                <div style={{ padding: "18px 20px 14px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          background: "#f0fdf4",
                          color: "#166534",
                          padding: "2px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        LIVE SUPPORT
                      </span>
                      <h3 style={{ margin: "4px 0 0 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                        Hội Thoại Khách Hàng
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {sessions.length} Cuộc Chat
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: "relative", marginBottom: "10px" }}>
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px 9px 36px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12.5px",
                        outline: "none",
                        background: "#f8fafc",
                        color: "#0f172a",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    {(["all", "human", "bot"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFilterMode(mode)}
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          borderRadius: "10px",
                          border: "none",
                          background: filterMode === mode ? "#2e7d32" : "#f1f5f9",
                          color: filterMode === mode ? "#ffffff" : "#64748b",
                          fontSize: "11.5px",
                          fontWeight: 800,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {mode === "all" ? "Tất cả" : mode === "human" ? "🧑‍💼 Admin trực" : "🤖 Bot trả lời"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session List Stream */}
                <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                  {filteredSessions.length === 0 ? (
                    <div style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                      Không tìm thấy cuộc trò chuyện nào
                    </div>
                  ) : (
                    filteredSessions.map((s) => {
                      const isSelected = s.id === selectedSessionId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSessionId(s.id)}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "16px",
                            marginBottom: "8px",
                            cursor: "pointer",
                            background: isSelected ? "#f0fdf4" : "#ffffff",
                            border: isSelected ? "1.5px solid #a7f3d0" : "1px solid #f1f5f9",
                            boxShadow: isSelected ? "0 4px 14px rgba(46, 125, 50, 0.08)" : "none",
                            transition: "all 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
                          }}
                        >
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            {/* Avatar with Status Ring */}
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

                            {/* Content Info */}
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
                                    maxWidth: "180px",
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

                              <div style={{ marginTop: "4px" }}>
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
                                  {s.mode === "human" ? "🧑‍💼 Admin trực" : "🤖 Bot trả lời"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* RIGHT PANEL: Active 2-Way Live Chat View                      */}
              {/* ------------------------------------------------------------- */}
              {selectedSession ? (
                <div style={{ display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                  {/* Top Header Card */}
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
                        <h3 style={{ margin: 0, fontSize: "16.5px", fontWeight: 800, color: "#0f172a" }}>
                          {selectedSession.customer_name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Mail style={{ width: "13px", height: "13px", color: "#2e7d32" }} /> {selectedSession.customer_email}
                          </span>
                          {selectedSession.customer_phone && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Phone style={{ width: "13px", height: "13px", color: "#2e7d32" }} /> {selectedSession.customer_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mode Switcher CTA Button with Button-in-Button Trailing Icon */}
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      style={{
                        padding: "8px 16px 8px 18px",
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
                        transition: "all 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
                      }}
                    >
                      <span>
                        {selectedSession.mode === "human"
                          ? "🧑‍💼 Đang Admin Tiếp Quản (Bấm để trả về AI)"
                          : "🤖 AI Chatbot Tự Động (Bấm để Tiếp Quản Chat)"}
                      </span>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selectedSession.mode === "human" ? (
                          <User style={{ width: "14px", height: "14px" }} />
                        ) : (
                          <Bot style={{ width: "14px", height: "14px" }} />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Messages History Stream */}
                  <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
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
                              background: isAdmin
                                ? "#2e7d32"
                                : isCustomer
                                ? "#ffffff"
                                : "#f0fdf4",
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
                        onClick={() => handleSendMessage(res)}
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
                        ⚡ {res.slice(0, 32)}...
                      </button>
                    ))}
                  </div>

                  {/* Input Footer */}
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
                        selectedSession.mode === "human"
                          ? "Nhập tin nhắn tư vấn trực tiếp cho khách..."
                          : "Bấm 'Tiếp Quản' ở phía trên để nhập tin nhắn trực tiếp..."
                      }
                      disabled={selectedSession.mode !== "human"}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      style={{
                        flex: 1,
                        padding: "12px 18px",
                        borderRadius: "14px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13.5px",
                        outline: "none",
                        background: selectedSession.mode === "human" ? "#ffffff" : "#f8fafc",
                        color: "#0f172a",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={selectedSession.mode !== "human"}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "14px",
                        background: selectedSession.mode === "human" ? "#2e7d32" : "#94a3b8",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "13.5px",
                        fontWeight: 800,
                        cursor: selectedSession.mode === "human" ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: selectedSession.mode === "human" ? "0 4px 14px rgba(46, 125, 50, 0.3)" : "none",
                      }}
                    >
                      <Send style={{ width: "16px", height: "16px" }} /> Trực Gửi
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "14px" }}>
                  Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu tư vấn
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
