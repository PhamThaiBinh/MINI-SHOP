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
  CheckCircle2,
  Clock,
  Zap,
  Filter,
  Users,
  Headphones,
  Activity,
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

  // Stats Metrics
  const totalSessions = sessions.length;
  const humanSessionsCount = sessions.filter((s) => s.mode === "human").length;
  const botSessionsCount = sessions.filter((s) => s.mode === "bot").length;
  const unreadTotal = sessions.reduce((acc, s) => acc + (s.unread_count || 0), 0);

  return (
    <div className="admin-wrapper" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* 1. Left Sidebar Navigation Menu */}
      <AdminSidebar activeMenu="chat" sidebarCollapsed={sidebarCollapsed} />

      {/* 2. Right Main Content Area */}
      <main className="admin-main">
        {/* Top Fixed Header Bar */}
        <AdminHeader
          title="💬 Trợ Lý Live Chat & Tư Vấn Khách Hàng Realtime"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Tìm kiếm tên, email khách hàng tư vấn..."
        />

        {/* Standard Dashboard Content Body */}
        <div className="dashboard-content-body">
          
          {/* ==================================================================== */}
          {/* 1. TOP KPI SUMMARY METRIC CARDS ROW (Matching Overview Page)       */}
          {/* ==================================================================== */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* KPI Card 1: Total Chat Sessions */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                border: "1.5px solid #bbf7d0",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(22, 101, 52, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Tổng Cuộc Chat
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#14532d", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {totalSessions} <span style={{ fontSize: "14px", fontWeight: 700 }}>hội thoại</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    {unreadTotal > 0 ? `${unreadTotal} tin chưa đọc` : "Đã phản hồi hết"}
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#2e7d32", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(46, 125, 50, 0.2)" }}>
                <MessageSquare style={{ width: "24px", height: "24px" }} />
              </div>
            </div>

            {/* KPI Card 2: Admin Live Active */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
                border: "1.5px solid #fde68a",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(180, 83, 9, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Admin Đang Trực
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#78350f", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {humanSessionsCount} <span style={{ fontSize: "14px", fontWeight: 700 }}>khách</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Tư vấn trực tiếp
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#d97706", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.2)" }}>
                <Headphones style={{ width: "24px", height: "24px" }} />
              </div>
            </div>

            {/* KPI Card 3: AI Bot Automated */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                border: "1.5px solid #bae6fd",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(3, 105, 161, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  AI Bot Tự Động
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#0c4a6e", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {botSessionsCount} <span style={{ fontSize: "14px", fontWeight: 700 }}>hội thoại</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Trả lời 24/7 tự động
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(2, 132, 199, 0.2)" }}>
                <Bot style={{ width: "24px", height: "24px" }} />
              </div>
            </div>

            {/* KPI Card 4: Response Rate */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)",
                border: "1.5px solid #fecaca",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(225, 29, 72, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#be123c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Tốc Độ Phản Hồi
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#881337", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  Instant <span style={{ fontSize: "14px", fontWeight: 700 }}>~1s</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#ffe4e6", color: "#be123c", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Tốc độ xử lý tức thì
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#e11d48", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(225, 29, 72, 0.2)" }}>
                <Activity style={{ width: "24px", height: "24px" }} />
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 2. MAIN CHAT WORKSTATION (Structured standard Admin Card Grid)    */}
          {/* ==================================================================== */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "330px 1fr",
              gap: "24px",
              minHeight: "650px",
              alignItems: "start",
            }}
          >
            {/* LEFT CONTAINER: Conversation List Card */}
            <div
              className="dashboard-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 280px)",
                minHeight: "600px",
              }}
            >
              <div className="card-header-row" style={{ marginBottom: "14px" }}>
                <h3 className="card-header-title" style={{ fontSize: "16px" }}>
                  📋 Danh Sách Hội Thoại
                </h3>
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
                    onClick={() => setFilterMode(mode)}
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
                    }}
                  >
                    {mode === "all" ? "Tất cả" : mode === "human" ? "🧑‍💼 Admin" : "🤖 Bot"}
                  </button>
                ))}
              </div>

              {/* Conversations Items Stream */}
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                {filteredSessions.length === 0 ? (
                  <div style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                    Không có cuộc trò chuyện phù hợp
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
                          borderRadius: "14px",
                          marginBottom: "8px",
                          cursor: "pointer",
                          background: isSelected ? "#f0fdf4" : "#ffffff",
                          border: isSelected ? "1.5px solid #a7f3d0" : "1px solid #e2e8f0",
                          boxShadow: isSelected ? "0 4px 14px rgba(46, 125, 50, 0.08)" : "none",
                          transition: "all 0.2s ease",
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
                                  maxWidth: "160px",
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

            {/* RIGHT CONTAINER: Active Chat Interaction Card */}
            {selectedSession ? (
              <div
                className="dashboard-card"
                style={{
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                  height: "calc(100vh - 280px)",
                  minHeight: "600px",
                  overflow: "hidden",
                }}
              >
                {/* Active Chat Header */}
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

                  {/* Toggle Mode Button */}
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

                {/* Messages Stream Area */}
                <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "14px" }}>
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
              <div
                className="dashboard-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "14px",
                  height: "calc(100vh - 280px)",
                }}
              >
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu tư vấn
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
