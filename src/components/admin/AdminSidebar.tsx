"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminSidebarProps {
  activeMenu:
    | "overview"
    | "categories"
    | "products"
    | "orders"
    | "vouchers"
    | "users"
    | "settings";
  sidebarCollapsed: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeMenu,
  sidebarCollapsed,
}) => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleAdminLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Bạn có chắc chắn muốn thoát quyền Admin và đăng xuất?")) {
      logout();
      router.push("/auth");
    }
  };

  return (
    <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <Link href="/" className="sidebar-brand-logo">
          <svg viewBox="0 0 24 24">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
          </svg>
          <div>
            <div>Mini Shop</div>
            <div className="sidebar-subtext">Admin Panel</div>
          </div>
        </Link>
      </div>

      <ul className="sidebar-menu">
        <li
          className={`sidebar-menu-item ${
            activeMenu === "overview" ? "active" : ""
          }`}
        >
          <Link href="/admin">
            <svg viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span>Tổng quan</span>
          </Link>
        </li>
        <li
          className={`sidebar-menu-item ${
            activeMenu === "categories" ? "active" : ""
          }`}
        >
          <Link href="/admin/categories">
            <svg viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
            <span>Danh mục</span>
          </Link>
        </li>
        <li
          className={`sidebar-menu-item ${
            activeMenu === "products" ? "active" : ""
          }`}
        >
          <Link href="/admin/products">
            <svg viewBox="0 0 24 24">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
            </svg>
            <span>Sản phẩm</span>
          </Link>
        </li>
        <li
          className={`sidebar-menu-item ${
            activeMenu === "orders" ? "active" : ""
          }`}
        >
          <Link href="/admin/orders">
            <svg viewBox="0 0 24 24">
              <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
            </svg>
            <span>Đơn hàng</span>
          </Link>
        </li>
        <li
          className={`sidebar-menu-item ${
            activeMenu === "vouchers" ? "active" : ""
          }`}
        >
          <Link href="/admin/vouchers">
            <svg viewBox="0 0 24 24">
              <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
            </svg>
            <span>Mã Voucher</span>
          </Link>
        </li>
        <li
          className={`sidebar-menu-item ${
            activeMenu === "users" ? "active" : ""
          }`}
        >
          <Link href="/admin/users">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>Người dùng</span>
          </Link>
        </li>
        <li
          className={`sidebar-menu-item ${
            activeMenu === "settings" ? "active" : ""
          }`}
        >
          <Link href="/admin/settings">
            <svg viewBox="0 0 24 24">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
            </svg>
            <span>Cài đặt</span>
          </Link>
        </li>
      </ul>

      <div className="sidebar-footer">
        <button
          onClick={handleAdminLogout}
          className="btn-logout"
          style={{
            background: "none",
            border: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          <span>Thoát Admin</span>
        </button>
      </div>
    </aside>
  );
};
