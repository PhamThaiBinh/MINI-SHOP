"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  Ticket,
  Truck,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Copy,
  ArrowRight,
  User,
  Bot,
  LogIn,
  Lock,
  ExternalLink,
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { processUserQuery, ChatMessage, VOUCHERS_DATA } from "@/lib/chatbotKnowledge";
import { PRODUCTS_DATA } from "@/data/products";
import {
  getLocalMessages,
  saveLocalMessages,
  getLocalSessions,
  saveLocalSessions,
  fetchSupabaseMessages,
  fetchSupabaseSessions,
  syncInsertMessageToSupabase,
  LiveChatMessage,
  LiveChatSession,
} from "@/lib/liveChatService";

import { useAuth } from "@/context/AuthContext";

export const ChatbotWidget: React.FC = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize guest token on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      let token = sessionStorage.getItem("minishop_guest_token");
      if (!token) {
        token = Math.floor(1000 + Math.random() * 9000).toString();
        sessionStorage.setItem("minishop_guest_token", token);
      }
      setGuestToken(token);
    }
  }, []);

  // Compute Per-User Dynamic Session ID & Info
  const activeSessionId = user
    ? `session-${user.email.replace(/[^a-zA-Z0-9]/g, "_")}`
    : `session-guest-${guestToken || "default"}`;

  const activeCustomerName = user ? user.name : `Khách Vãng Lai ${guestToken ? "#" + guestToken : ""}`;
  const activeCustomerEmail = user ? user.email : `guest_${guestToken || "visitor"}@minishop.vn`;
  const activeCustomerPhone = user ? user.phone || "" : "";
  const activeAvatarText = user ? user.name.charAt(0).toUpperCase() : "K";
  const activeAvatarBg = user ? "#2e7d32" : "#64748b";

  // Initial welcome message template
  const welcomeMsg: ChatMessage = {
    id: "init-1",
    sender: "bot",
    text: user
      ? `Xin chào ${user.name}! Em là Trợ Lý AI của MINI SHOP.\nEm có thể giúp gì cho anh/chị hôm nay ạ?`
      : "Xin chào! Em là Trợ Lý AI của MINI SHOP.\nEm có thể giúp anh/chị chọn đồ nội thất đẹp, tra cứu đơn hàng hoặc săn mã giảm giá hôm nay!",
    timestamp: "Vừa xong",
    quickReplies: ["Gợi ý Bàn ghế & Sofa", "Tra cứu đơn hàng", "Lấy mã giảm giá", "Chính sách bảo hành"],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const userHasScrolledUpRef = useRef<boolean>(false);

  // Track scroll position to prevent auto-scrolling down when user is reading old messages
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

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom(true);
    }
  }, [isOpen]);

  // Sync with Supabase Database for Active User Session
  useEffect(() => {
    if (!activeSessionId || !user) return;

    const syncWithSupabase = async () => {
      const liveMsgs = await fetchSupabaseMessages(activeSessionId);
      if (liveMsgs.length > 0) {
        const formattedLive: ChatMessage[] = liveMsgs.map((lm) => {
          const isBot = lm.sender_type === "bot";
          const matchedProducts = isBot
            ? PRODUCTS_DATA.filter((p) => lm.message.toLowerCase().includes(p.name.toLowerCase())).slice(0, 3)
            : [];

          const matchedVouchers =
            isBot && (lm.message.toLowerCase().includes("ma giam gia") || lm.message.toLowerCase().includes("voucher"))
              ? VOUCHERS_DATA
              : undefined;

          return {
            id: lm.id,
            sender: lm.sender_type === "customer" ? "user" : "bot",
            text: lm.message,
            timestamp: lm.created_at,
            products: matchedProducts.length > 0 ? matchedProducts : undefined,
            vouchers: matchedVouchers,
          };
        });
        setMessages(formattedLive);
        // Only scroll if user hasn't scrolled up to read old history
        scrollToBottom(false);
      } else {
        setMessages([welcomeMsg]);
      }
    };

    syncWithSupabase();
    const interval = setInterval(syncWithSupabase, 800);
    return () => clearInterval(interval);
  }, [activeSessionId, user]);

  const handleSendMessage = async (textToSend?: string) => {
    if (!user) return;
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    userHasScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom(true), 50);

    // Fetch existing session mode from Supabase DB to respect Admin toggle
    const sessions = await fetchSupabaseSessions();
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const activeMode = currentSession?.mode || "bot";

    // Sync customer message to Supabase Database & Live Chat storage for Admin Dashboard
    const newLiveMsg: LiveChatMessage = {
      id: `user-m-${Date.now()}`,
      session_id: activeSessionId,
      sender_type: "customer",
      sender_name: activeCustomerName,
      message: text,
      created_at: userTime,
    };

    await syncInsertMessageToSupabase(newLiveMsg, {
      id: activeSessionId,
      customer_name: activeCustomerName,
      customer_email: activeCustomerEmail,
      customer_phone: activeCustomerPhone,
      avatar_bg: activeAvatarBg,
      avatar_text: activeAvatarText,
      mode: activeMode,
      last_message: text,
      last_message_at: userTime,
      unread_count: 1,
    });

    // If Admin has taken over in Human mode, skip auto AI bot response completely!
    if (activeMode === "human") {
      return;
    }

    setIsTyping(true);

    // Simulate realistic typing latency for AI Bot when in Bot mode
    setTimeout(async () => {
      const botResponse = processUserQuery(text);
      setMessages((prev) => [...prev, botResponse]);
      userHasScrolledUpRef.current = false;
      setTimeout(() => scrollToBottom(true), 50);

      // Sync Bot response to Supabase Database for Admin & Customer Realtime view
      const botLiveMsg: LiveChatMessage = {
        id: botResponse.id,
        session_id: activeSessionId,
        sender_type: "bot",
        sender_name: "Trợ Lý MINI SHOP",
        message: botResponse.text,
        created_at: botResponse.timestamp,
      };

      await syncInsertMessageToSupabase(botLiveMsg, {
        id: activeSessionId,
        customer_name: activeCustomerName,
        customer_email: activeCustomerEmail,
        customer_phone: activeCustomerPhone,
        avatar_bg: activeAvatarBg,
        avatar_text: activeAvatarText,
        mode: "bot",
        last_message: botResponse.text,
        last_message_at: botResponse.timestamp,
        unread_count: 0,
      });

      setIsTyping(false);
    }, 600);
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* 1. Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: "relative",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 10px 25px -5px rgba(46, 125, 50, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <MessageSquare style={{ width: "28px", height: "28px" }} />

          {/* Unread Badge Indicator */}
          {hasUnread && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ef4444",
                border: "2.5px solid #ffffff",
              }}
            />
          )}

          {/* Pulsing Glow Animation */}
          <span
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "rgba(46, 125, 50, 0.4)",
              zIndex: -1,
              animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        </button>
      )}

      {/* 2. Chatbot Window Box */}
      {isOpen && (
        <div
          style={{
            width: "380px",
            height: "560px",
            maxHeight: "calc(100vh - 40px)",
            maxWidth: "calc(100vw - 32px)",
            background: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  position: "relative",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Sparkles style={{ width: "22px", height: "22px", color: "#fef08a" }} />
                <span
                  style={{
                    position: "absolute",
                    bottom: "1px",
                    right: "1px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "2px solid #ffffff",
                  }}
                />
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                  Trợ Lý MINI SHOP
                </h4>
                <span style={{ fontSize: "11px", color: "#bbf7d0", fontWeight: 600 }}>🟢 Trực tuyến 24/7 (AI Support)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          </div>

          {/* Require Login Screen Guard */}
          {!user ? (
            <div
              style={{
                flex: 1,
                padding: "32px 24px",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(217, 119, 6, 0.2)",
                }}
              >
                <Lock style={{ width: "32px", height: "32px" }} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: "1.15rem", color: "#0f172a" }}>
                Yêu Cầu Đăng Nhập Tài Khoản
              </h4>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b", lineHeight: 1.5, maxWidth: "260px" }}>
                Vui lòng đăng nhập tài khoản để nhắn tin tư vấn trực tiếp và nhận hỗ trợ từ Trợ Lý AI Realtime!
              </p>
              <Link
                href="/auth"
                style={{
                  marginTop: "8px",
                  background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 6px 16px rgba(46, 125, 50, 0.35)",
                }}
              >
                <LogIn style={{ width: "18px", height: "18px" }} /> Đăng Nhập Ngay
              </Link>
            </div>
          ) : (
            <>
              {/* Messages Body */}
              <div
                ref={chatBodyRef}
                onScroll={handleScroll}
                style={{ flex: 1, padding: "16px", overflowY: "auto", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "14px" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                      gap: "6px",
                    }}
                  >
                    {/* Sender Tag */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {msg.sender === "bot" ? (
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <Bot style={{ width: "12px", height: "12px", color: "#2e7d32" }} /> Trợ Lý MINI SHOP • {msg.timestamp}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          Bạn • {msg.timestamp} <User style={{ width: "12px", height: "12px", color: "#475569" }} />
                        </span>
                      )}
                    </div>

                    {/* Text Bubble */}
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "12px 16px",
                        borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: msg.sender === "user" ? "var(--primary-color, #2e7d32)" : "#ffffff",
                        color: msg.sender === "user" ? "#ffffff" : "#0f172a",
                        fontSize: "13.5px",
                        lineHeight: "1.55",
                        boxShadow: msg.sender === "bot" ? "0 2px 8px rgba(0, 0, 0, 0.04)" : "none",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {msg.text}
                    </div>

                    {/* Rich Content: Products Recommendations Carousel */}
                    {msg.products && msg.products.length > 0 && (
                      <div style={{ width: "100%", marginTop: "6px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {msg.products.map((p) => (
                          <div
                            key={p.id}
                            style={{
                              background: "#ffffff",
                              borderRadius: "14px",
                              padding: "10px",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              gap: "12px",
                              alignItems: "center",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                            }}
                          >
                            <div style={{ position: "relative", width: "64px", height: "64px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                              <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h5 style={{ margin: "0 0 2px 0", fontSize: "12.5px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {p.name}
                              </h5>
                              <div style={{ fontSize: "13px", fontWeight: 800, color: "#2e7d32" }}>
                                {formatPrice(p.price)}
                              </div>
                              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                                <button
                                  type="button"
                                  onClick={() => addToCart(p, 1)}
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    background: "#2e7d32",
                                    color: "#ffffff",
                                    border: "none",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <ShoppingBag style={{ width: "12px", height: "12px" }} /> Thêm giỏ
                                </button>
                                <Link
                                  href={`/products/${p.id}`}
                                  target="_blank"
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    border: "none",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <ExternalLink style={{ width: "12px", height: "12px" }} /> Xem
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rich Content: Voucher Cards */}
                    {msg.vouchers && msg.vouchers.length > 0 && (
                      <div style={{ width: "100%", marginTop: "6px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {msg.vouchers.map((v, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                              border: "1.5px dashed #059669",
                              borderRadius: "12px",
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#047857", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Tag style={{ width: "12px", height: "12px" }} /> {v.discount}
                              </div>
                              <div style={{ fontSize: "12px", fontWeight: 700, color: "#065f46" }}>Mã: {v.code}</div>
                              <div style={{ fontSize: "10.5px", color: "#047857" }}>{v.minOrder}</div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyVoucher(v.code)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: copiedCode === v.code ? "#059669" : "#ffffff",
                                color: copiedCode === v.code ? "#ffffff" : "#059669",
                                border: "1px solid #059669",
                                fontSize: "11px",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {copiedCode === v.code ? (
                                <>
                                  <CheckCircle2 style={{ width: "12px", height: "12px" }} /> Đã lưu
                                </>
                              ) : (
                                <>
                                  <Copy style={{ width: "12px", height: "12px" }} /> Lưu mã
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Chips */}
                    {msg.quickReplies && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                        {msg.quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(reply)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "999px",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              color: "#334155",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#2e7d32";
                              e.currentTarget.style.color = "#2e7d32";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#cbd5e1";
                              e.currentTarget.style.color = "#334155";
                            }}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "8px 14px", borderRadius: "16px", width: "fit-content", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                    <Sparkles style={{ width: "14px", height: "14px", color: "#2e7d32" }} />
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Trợ Lý đang soạn phản hồi...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer Bar */}
              <div style={{ padding: "12px 16px", background: "#ffffff", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn (Sofa, đơn hàng, mã giảm giá)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none",
                    color: "#0f172a",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(46, 125, 50, 0.25)",
                  }}
                >
                  <Send style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
