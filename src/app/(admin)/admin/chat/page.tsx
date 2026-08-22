"use client";

import React, { useState, useEffect, useRef } from "react";
import "@/styles/admin.css";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  LiveChatSession,
  LiveChatMessage,
  saveLocalSessions,
  fetchSupabaseSessions,
  fetchSupabaseMessages,
  syncInsertMessageToSupabase,
  syncUpdateSessionModeInSupabase,
  deleteChatSession,
  clearAllChatSessions,
} from "@/lib/liveChatService";
import { ChatSessionList } from "@/components/admin/chat/ChatSessionList";
import { ChatActiveHeader } from "@/components/admin/chat/ChatActiveHeader";
import { ChatMessageStream } from "@/components/admin/chat/ChatMessageStream";
import { ChatInputArea } from "@/components/admin/chat/ChatInputArea";
import { ChatEmptyState } from "@/components/admin/chat/ChatEmptyState";

export default function AdminLiveChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "human" | "bot">("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const userHasScrolledUpRef = useRef<boolean>(false);

  const handleScroll = () => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    userHasScrolledUpRef.current = !isNearBottom;
  };

  const scrollToBottom = (force = false) => {
    if (!chatBodyRef.current) return;
    if (force || !userHasScrolledUpRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Realtime Supabase Database Sync & Polling Engine (800ms)
  useEffect(() => {
    const syncData = async () => {
      const latestSessions = await fetchSupabaseSessions();
      setSessions(latestSessions);

      // If no session selected and sessions exist, default to first session
      if (!selectedSessionId && latestSessions.length > 0) {
        setSelectedSessionId(latestSessions[0].id);
      }

      if (selectedSessionId) {
        const latestMsgs = await fetchSupabaseMessages(selectedSessionId);
        setMessages(latestMsgs);
        scrollToBottom(false);
      }
    };

    syncData();
    const interval = setInterval(syncData, 800);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "minishop_live_chat_sessions" || e.key?.startsWith("minishop_live_chat_messages_")) {
        syncData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [selectedSessionId]);

  // Load messages & clear unread when selected session changes
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }
    userHasScrolledUpRef.current = false;
    fetchSupabaseMessages(selectedSessionId).then((msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollToBottom(true), 50);
    });

    fetchSupabaseSessions().then((latestSessions) => {
      const updatedSessions = latestSessions.map((s) =>
        s.id === selectedSessionId ? { ...s, unread_count: 0 } : s
      );
      setSessions(updatedSessions);
      saveLocalSessions(updatedSessions);
    });
  }, [selectedSessionId]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleSendMessage = async (textToSend?: string) => {
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

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");
    userHasScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom(true), 50);

    await syncInsertMessageToSupabase(newMsg, {
      id: selectedSessionId,
      customer_name: selectedSession?.customer_name || "Khách Hàng",
      customer_email: selectedSession?.customer_email || "khach@minishop.vn",
      customer_phone: selectedSession?.customer_phone || "",
      mode: selectedSession?.mode || "human",
      last_message: `Admin: ${text}`,
      last_message_at: currentTime,
      unread_count: 0,
    });
  };

  const handleToggleMode = async () => {
    if (!selectedSessionId) return;
    const newMode = selectedSession?.mode === "human" ? "bot" : "human";

    await syncUpdateSessionModeInSupabase(selectedSessionId, newMode);

    const latestSessions = await fetchSupabaseSessions();
    const updatedSessions = latestSessions.map((s) =>
      s.id === selectedSessionId ? { ...s, mode: newMode as "bot" | "human" } : s
    );
    setSessions(updatedSessions);
    saveLocalSessions(updatedSessions);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteChatSession(sessionId);
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(updated.length > 0 ? updated[0].id : "");
      setMessages([]);
    }
  };

  const handleClearAllSessions = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử tất cả các cuộc trò chuyện tư vấn không?")) {
      await clearAllChatSessions();
      setSessions([]);
      setSelectedSessionId("");
      setMessages([]);
    }
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
      {/* 1. Left Sidebar Navigation Menu */}
      <AdminSidebar activeMenu="chat" sidebarCollapsed={sidebarCollapsed} />

      {/* 2. Right Main Content Area */}
      <main className="admin-main">
        {/* Top Fixed Header Bar */}
        <AdminHeader
          title="Trợ Lý Live Chat & Tư Vấn Khách Hàng Realtime"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Tìm kiếm tên, email khách hàng tư vấn..."
        />

        {/* Dashboard Content Body */}
        <div className="dashboard-content-body" style={{ padding: "100px 32px 24px 32px", height: "100vh", boxSizing: "border-box", overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "330px 1fr",
              gap: "24px",
              height: "calc(100vh - 130px)",
              alignItems: "stretch",
            }}
          >
            {/* Left Conversations List Panel */}
            <ChatSessionList
              sessions={sessions}
              filteredSessions={filteredSessions}
              selectedSessionId={selectedSessionId}
              searchQuery={searchQuery}
              filterMode={filterMode}
              onSearchChange={setSearchQuery}
              onFilterChange={setFilterMode}
              onSelectSession={setSelectedSessionId}
              onDeleteSession={handleDeleteSession}
              onClearAll={handleClearAllSessions}
            />

            {/* Right Active Chat Card Panel */}
            {selectedSession ? (
              <div
                className="dashboard-card"
                style={{
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <ChatActiveHeader
                  selectedSession={selectedSession}
                  onToggleMode={handleToggleMode}
                  onDeleteSession={handleDeleteSession}
                />

                <ChatMessageStream
                  messages={messages}
                  chatBodyRef={chatBodyRef}
                  messagesEndRef={messagesEndRef}
                  onScroll={handleScroll}
                />

                <ChatInputArea
                  selectedSession={selectedSession}
                  inputText={inputText}
                  cannedResponses={cannedResponses}
                  onInputChange={setInputText}
                  onSendMessage={handleSendMessage}
                />
              </div>
            ) : (
              <ChatEmptyState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
