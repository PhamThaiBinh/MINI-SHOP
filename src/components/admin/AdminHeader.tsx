"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications List Data
  const notifications = [
    {
      id: 1,
      icon: "🛒",
      title: "Đơn hàng mới #MS-9824",
      desc: "Khách hàng Bình Nguyễn vừa đặt 3.539.000đ",
      time: "Vừa xong",
      unread: true,
      link: "/admin/orders",
    },
    {
      id: 2,
      icon: "⚠️",
      title: "Cảnh báo tồn kho thấp",
      desc: "Sản phẩm Kệ gỗ đa năng còn dưới 10 món",
      time: "15 phút trước",
      unread: true,
      link: "/admin/products",
    },
    {
      id: 3,
      icon: "👤",
      title: "Thành viên VIP mới",
      desc: "Tài khoản @binh_nguyen vừa kích hoạt VIP",
      time: "1 giờ trước",
      unread: true,
      link: "/admin/users",
    },
  ];

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

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("admin-dark", !isDarkMode);
  };

  return (
    <header className="admin-top-header">
      <div className="top-header-left">
        <button
          className="btn-menu-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title="Ẩn/Hiện Sidebar Menu"
        >
          ☰
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="top-header-right">
        {setSearchQuery && (
          <div className="admin-search-box" style={{ width: "240px" }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="admin-search-shortcut">Ctrl + K</span>
          </div>
        )}

        {/* Audio Alert Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="btn-header-action"
          style={{
            background: soundEnabled ? "#dcfce7" : "#f1f5f9",
            color: soundEnabled ? "#166534" : "#64748b",
            border: "1px solid var(--border-color)",
            padding: "6px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
          title={soundEnabled ? "Âm thanh báo đơn mới: BẬT" : "Âm thanh báo đơn mới: TẮT"}
        >
          {soundEnabled ? "🔊 Âm thanh" : "🔇 Tắt chuông"}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="btn-header-action"
          style={{
            background: isDarkMode ? "#1e293b" : "#f1f5f9",
            color: isDarkMode ? "#f8fafc" : "#0f172a",
            border: "1px solid var(--border-color)",
            padding: "6px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
          title="Chuyển chế độ Giao diện Tối/Sáng"
        >
          {isDarkMode ? "🌙 Dark" : "☀️ Light"}
        </button>

        {/* Unified Notification Bell Dropdown */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <div
            className="notification-bell"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            style={{ cursor: "pointer", userSelect: "none" }}
            title="Xem thông báo hệ thống"
          >
            🔔
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
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                  🔔 Thông Báo Hệ Thống
                </strong>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-color)",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
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
                    onClick={() => setShowNotifications(false)}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      textDecoration: "none",
                      color: "inherit",
                      background: n.unread && unreadCount > 0 ? "#f0fdf4" : "#ffffff",
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
                  }}
                >
                  Xem tất cả hoạt động ➔
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
                  ⚙️ Cài đặt hệ thống
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
                  👥 Quản lý người dùng
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
                  🚪 Đăng xuất khỏi hệ thống
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
