"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToastAndConfirm } from "@/context/ToastAndConfirmContext";
import {
  BarChart3,
  FolderTree,
  Package,
  ShoppingCart,
  Ticket,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Store,
  Sparkles,
} from "lucide-react";

import { useState, useEffect } from "react";
import { getLocalSessions } from "@/lib/liveChatService";

interface AdminSidebarProps {
  activeMenu:
    | "overview"
    | "categories"
    | "products"
    | "orders"
    | "vouchers"
    | "users"
    | "chat"
    | "settings";
  sidebarCollapsed: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeMenu,
  sidebarCollapsed,
}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const syncUnread = () => {
      const sessions = getLocalSessions();
      const count = sessions.reduce((sum, s) => sum + (s.unread_count || 0), 0);
      setUnreadChatCount(count);
    };

    syncUnread();
    const interval = setInterval(syncUnread, 800);
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "minishop_live_chat_sessions" ||
        e.key === "minishop_live_sessions" ||
        e.key?.startsWith("minishop_live_chat_messages_") ||
        e.key?.startsWith("minishop_live_msg_")
      ) {
        syncUnread();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const { showConfirm } = useToastAndConfirm();

  const handleAdminLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    showConfirm({
      title: "Đăng xuất tài khoản Admin",
      message: "Bạn có chắc chắn muốn thoát quyền Admin và đăng xuất?",
      confirmText: "Đăng xuất",
      cancelText: "Ở lại",
      type: "danger",
      icon: "fa-solid fa-right-from-bracket",
      onConfirm: () => {
        logout();
        router.push("/auth");
      },
    });
  };


  const menuItems = [
    { key: "overview", label: "Tổng quan", href: "/admin", icon: BarChart3 },
    { key: "categories", label: "Danh mục", href: "/admin/categories", icon: FolderTree },
    { key: "products", label: "Sản phẩm", href: "/admin/products", icon: Package },
    { key: "orders", label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
    { key: "vouchers", label: "Mã giảm giá", href: "/admin/vouchers", icon: Ticket },
    { key: "users", label: "Tài khoản", href: "/admin/users", icon: Users },
    { key: "chat", label: "Tư vấn Live Chat", href: "/admin/chat", icon: MessageSquare, badge: unreadChatCount },
    { key: "settings", label: "Cấu hình Shop", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <Link href="/admin" className="brand-logo" style={{ textDecoration: "none" }}>
          <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: "var(--primary-color, #2e7d32)", flexShrink: 0 }}>
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
          </svg>
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 800, fontSize: "1.35rem", color: "var(--primary-color, #2e7d32)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Mini Shop
            </span>
          )}
        </Link>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeMenu === item.key;
          return (
            <li
              key={item.key}
              className={`sidebar-menu-item ${isActive ? "active" : ""}`}
            >
              <Link href={item.href} title={sidebarCollapsed ? item.label : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <IconComp className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-500"}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge && item.badge > 0 ? (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 900,
                      padding: "2px 7px",
                      borderRadius: "999px",
                      boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "12px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "var(--primary-color, #2e7d32)",
            fontSize: "13px",
            fontWeight: 800,
            textDecoration: "none",
            marginBottom: "8px",
          }}
        >
          <Store className="w-4 h-4 text-emerald-700" />
          {!sidebarCollapsed && <span>Trang chủ Shop ↗</span>}
        </Link>
        <button
          onClick={handleAdminLogout}
          className="btn-logout"
          style={{
            background: "none",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "10px 14px",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          <LogOut className="w-4 h-4 text-red-500" />
          {!sidebarCollapsed && <span>Thoát Admin</span>}
        </button>
      </div>
    </aside>
  );
};
