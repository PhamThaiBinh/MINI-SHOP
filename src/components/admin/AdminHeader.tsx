"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, AlertTriangle, UserCheck, MessageSquare, Menu, Bell, Settings, Users, LogOut, ArrowRight } from "lucide-react";

import { getLocalSessions, LiveChatSession } from "@/lib/liveChatService";

interface AdminHeaderProps {
  title: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  searchPlaceholder?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  sidebarCollapsed,
  setSidebarCollapsed,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Tìm kiếm nhanh...",
}) => {
  const router = useRouter();
  const { logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [chatUnreadTotal, setChatUnreadTotal] = useState(0);
  const [chatNotifications, setChatNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync Live Chat Notifications in Realtime
  useEffect(() => {
    const syncChatNotifs = () => {
      const sessions = getLocalSessions();
      const unreadSessions = sessions.filter((s) => (s.unread_count || 0) > 0);
      const totalUnread = unreadSessions.reduce((sum, s) => sum + (s.unread_count || 0), 0);
      setChatUnreadTotal(totalUnread);

      const dynamicNotifs = unreadSessions.map((s) => ({
        id: `chat-${s.id}`,
        icon: <MessageSquare className="w-4 h-4 text-emerald-600" />,
        title: `Tin nhắn từ ${s.customer_name}`,
        desc: s.last_message || "Đang chờ tư vấn trực tiếp...",
        time: s.last_message_at || "Vừa xong",
        unread: true,
        link: "/admin/chat",
      }));
      setChatNotifications(dynamicNotifs);
    };

    syncChatNotifs();
    const interval = setInterval(syncChatNotifs, 800);
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "minishop_live_chat_sessions" ||
        e.key === "minishop_live_sessions" ||
        e.key?.startsWith("minishop_live_chat_messages_") ||
        e.key?.startsWith("minishop_live_msg_")
      ) {
        syncChatNotifs();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("minishop_admin_read_notifs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [orderNotifs, setOrderNotifs] = useState<any[]>([]);

  useEffect(() => {
    const syncOrderNotifs = async () => {
      try {
        const { fetchAdminOrders } = await import("@/lib/supabaseAdmin");
        const orders = await fetchAdminOrders();
        const latest = orders.slice(0, 3).map((o, idx) => ({
          id: `ord-${o.id}-${idx}`,
          icon: <ShoppingCart className="w-4 h-4 text-emerald-600" />,
          title: `Đơn hàng mới ${o.id.startsWith("#") ? o.id : "#" + o.id}`,
          desc: `Khách hàng ${o.recipientName || "Ẩn danh"} vừa đặt ${o.total.toLocaleString("vi-VN")}đ`,
          time: o.date || "Vừa xong",
          link: "/admin/orders",
        }));
        setOrderNotifs(latest);
      } catch (e) {
        console.error(e);
      }
    };
    syncOrderNotifs();
    window.addEventListener("ordersUpdated", syncOrderNotifs);
    return () => window.removeEventListener("ordersUpdated", syncOrderNotifs);
  }, []);

  const notifications = [...chatNotifications, ...orderNotifs].map((n) => ({
    ...n,
    unread: !readNotifIds.includes(n.id),
  }));
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setChatUnreadTotal(0);
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem("minishop_admin_read_notifs", JSON.stringify(allIds));
      const sessions = getLocalSessions();
      const updated = sessions.map((s) => ({ ...s, unread_count: 0 }));
      localStorage.setItem("minishop_live_chat_sessions", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn thoát quyền Admin và đăng xuất?")) {
      logout();
      router.push("/auth");
    }
  };

  return (
    <header className="admin-top-header">
      <div className="top-header-left">
        <button
          className="btn-menu-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title="Ẩn/Hiện Sidebar Menu"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="top-header-right">
        {setSearchQuery && (
          <div className="admin-search-box" style={{ width: "260px" }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="admin-search-shortcut">Ctrl + K</span>
          </div>
        )}

        {/* Unified Notification Bell Dropdown */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <div
            className="notification-bell"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            style={{ cursor: "pointer", userSelect: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            title="Xem thông báo hệ thống"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </div>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "340px",
                background: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                zIndex: 2000,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong style={{ fontSize: "14px", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Bell className="w-4 h-4 text-emerald-700" /> Thông Báo Hệ Thống
                </strong>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-color, #2e7d32)",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => {
                      setReadNotifIds((prev) => {
                        const next = [...prev, n.id];
                        try {
                          localStorage.setItem("minishop_admin_read_notifs", JSON.stringify(next));
                        } catch {}
                        return next;
                      });
                      setShowNotifications(false);
                    }}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      textDecoration: "none",
                      color: "inherit",
                      background: n.unread ? "#f0fdf4" : "#ffffff",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {n.desc}
                      </div>
                      <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                        {n.time}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div
                style={{
                  padding: "10px",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href="/admin/orders"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--primary-color)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Xem tất cả hoạt động <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Unified Interactive Admin Profile Dropdown */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            className="admin-user-profile"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            style={{ cursor: "pointer", userSelect: "none" }}
            title="Menu tài khoản Admin"
          >
            <div className="user-avatar">A</div>
            <span className="user-name-text">Admin ▾</span>
          </div>

          {showProfileMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "220px",
                background: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                zIndex: 2000,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                  Quản Trị Viên (Root)
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  admin@minishop.vn
                </div>
              </div>

              <div style={{ padding: "6px 0" }}>
                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    textDecoration: "none",
                  }}
                >
                  <Settings className="w-4 h-4 text-slate-600" /> Cài đặt hệ thống
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    textDecoration: "none",
                  }}
                >
                  <Users className="w-4 h-4 text-slate-600" /> Quản lý người dùng
                </Link>
                <div
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#dc2626",
                    cursor: "pointer",
                    borderTop: "1px solid #f1f5f9",
                    marginTop: "4px",
                  }}
                >
                  <LogOut className="w-4 h-4 text-red-600" /> Đăng xuất khỏi hệ thống
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
