"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  FolderTree,
  Package,
  ShoppingCart,
  Ticket,
  Users,
  Settings,
  LogOut,
  Store,
  Sparkles,
} from "lucide-react";

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

  const menuItems = [
    { key: "overview", label: "Tổng quan", href: "/admin", icon: BarChart3 },
    { key: "categories", label: "Danh mục", href: "/admin/categories", icon: FolderTree },
    { key: "products", label: "Sản phẩm", href: "/admin/products", icon: Package },
    { key: "orders", label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
    { key: "vouchers", label: "Mã giảm giá", href: "/admin/vouchers", icon: Ticket },
    { key: "users", label: "Tài khoản", href: "/admin/users", icon: Users },
    { key: "settings", label: "Cấu hình Shop", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <Link href="/admin" className="sidebar-brand-logo">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 font-black text-lg">
            M
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                Mini Shop
              </div>
              <div className="sidebar-subtext text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Admin Suite
              </div>
            </div>
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
              <Link href={item.href} title={sidebarCollapsed ? item.label : undefined}>
                <IconComp className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-500"}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
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
